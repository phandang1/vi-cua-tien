import * as cheerio from "cheerio";

export interface ShopeeMetadataResult {
  success: boolean;
  title: string;
  thumbnail: string;
  originalUrl: string;
  error?: string;
}

export class ShopeeMetadataService {
  /**
   * Validate whether the provided URL is a valid Shopee link
   */
  static validateShopeeUrl(urlStr: string): boolean {
    try {
      const url = new URL(urlStr.trim());
      const validDomains = [
        "shopee.vn",
        "vn.shp.ee",
        "shope.ee",
        "s.shopee.vn",
        "shopee.com",
      ];
      return validDomains.some(
        (d) => url.hostname === d || url.hostname.endsWith("." + d)
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract title directly from Shopee URL slug
   * e.g. /Tra-gao-lut-dau-den-...-i.291773099.4345422731
   */
  static extractFromSlug(urlStr: string): { title: string; shopId?: string; itemId?: string } {
    try {
      const url = new URL(urlStr.trim());
      const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      
      const match = decodedPath.match(/^(.*?)-i\.(\d+)\.(\d+)/);
      if (match) {
        const rawSlug = match[1];
        const title = rawSlug.replace(/-/g, " ").trim();
        return {
          title,
          shopId: match[2],
          itemId: match[3],
        };
      }

      // Check /product/shopId/itemId
      const prodMatch = decodedPath.match(/^product\/(\d+)\/(\d+)/);
      if (prodMatch) {
        return {
          title: "",
          shopId: prodMatch[1],
          itemId: prodMatch[2],
        };
      }
    } catch (e) {
      console.warn("Failed to parse slug from URL:", e);
    }

    return { title: "" };
  }

  /**
   * Main entry point to fetch and parse metadata
   */
  static async fetchMetadata(urlStr: string): Promise<ShopeeMetadataResult> {
    const trimmed = urlStr.trim();
    if (!this.validateShopeeUrl(trimmed)) {
      return {
        success: false,
        title: "",
        thumbnail: "",
        originalUrl: trimmed,
        error: "URL không thuộc hệ thống tên miền hợp lệ của Shopee (shopee.vn, vn.shp.ee, ...)",
      };
    }

    let resolvedUrl = trimmed;
    let extractedTitle = "";
    let shopId: string | undefined;
    let itemId: string | undefined;

    // 1. First attempt: check if URL already has the slug with title
    const slugInfo = this.extractFromSlug(trimmed);
    if (slugInfo.title) {
      extractedTitle = slugInfo.title;
      shopId = slugInfo.shopId;
      itemId = slugInfo.itemId;
    }

    try {
      // 2. Fetch page (follows shortlink redirects if vn.shp.ee, etc.)
      const fetchTarget =
        shopId && itemId ? `https://shopee.vn/product/${shopId}/${itemId}` : trimmed;

      const response = await fetch(fetchTarget, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });

      if (response.url) {
        resolvedUrl = response.url;
      }

      // If title wasn't extracted yet, try from resolved URL after redirect
      if (!extractedTitle) {
        const resolvedSlugInfo = this.extractFromSlug(resolvedUrl);
        if (resolvedSlugInfo.title) {
          extractedTitle = resolvedSlugInfo.title;
          shopId = shopId || resolvedSlugInfo.shopId;
          itemId = itemId || resolvedSlugInfo.itemId;
        }
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 3. Extract title from HTML tags if still empty
      if (!extractedTitle) {
        let metaTitle =
          $('meta[property="og:title"]').attr("content") ||
          $('meta[name="twitter:title"]').attr("content") ||
          "";
        if (metaTitle && !metaTitle.toLowerCase().includes("shopping cart icon")) {
          extractedTitle = metaTitle.replace(/\s*\|\s*Shopee.*$/i, "").trim();
        }
      }

      if (!extractedTitle) {
        const pageTitle = $("title").text().trim();
        if (pageTitle && !pageTitle.toLowerCase().includes("shopping cart icon")) {
          extractedTitle = pageTitle.replace(/\s*\|\s*Shopee.*$/i, "").trim();
        }
      }

      // 4. Extract thumbnail
      let thumbnail = "";

      // Check og:image first
      const ogImg = $('meta[property="og:image"]').attr("content") || "";
      const shopeeDefaultLogo = "d4bbea4570b93bfd5fc652ca82a262a8";

      if (ogImg && !ogImg.includes(shopeeDefaultLogo)) {
        thumbnail = ogImg;
      }

      // If no valid og:image, scan HTML for Shopee image CDN matches
      if (!thumbnail) {
        const imageMatches = html.match(
          /https:\/\/(?:cf\.shopee\.vn|down-vn\.img\.susercontent\.com)\/file\/([a-zA-Z0-9_-]{32,})/g
        );

        if (imageMatches && imageMatches.length > 0) {
          // Find first image that is not the default logo
          const candidate = imageMatches.find((img) => !img.includes(shopeeDefaultLogo));
          if (candidate) {
            thumbnail = candidate;
          }
        }
      }

      // If we got title OR thumbnail, return success!
      if (extractedTitle || thumbnail) {
        return {
          success: true,
          title: extractedTitle || "Sản phẩm Shopee",
          thumbnail: thumbnail || "",
          originalUrl: resolvedUrl,
        };
      }

      return {
        success: false,
        title: "",
        thumbnail: "",
        originalUrl: resolvedUrl,
        error: "Không thể tự động lấy thông tin từ link này. Bạn có thể tự nhập tên và dán link ảnh thủ công bên dưới.",
      };
    } catch (err: any) {
      console.warn("Shopee metadata fetch error:", err?.message || err);

      // Even if network fetch failed, if we extracted title from URL slug, return it!
      if (extractedTitle) {
        return {
          success: true,
          title: extractedTitle,
          thumbnail: "",
          originalUrl: trimmed,
        };
      }

      return {
        success: false,
        title: "",
        thumbnail: "",
        originalUrl: trimmed,
        error: `Không thể kết nối lấy tin tự động (${err?.message || "Lỗi mạng"}). Bạn có thể tự nhập tên và ảnh sản phẩm bên dưới.`,
      };
    }
  }
}
