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
   * Extract title & IDs directly from Shopee URL or path
   */
  static extractIds(urlStr: string): { title: string; shopId?: string; itemId?: string } {
    try {
      const url = new URL(urlStr.trim());
      const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");

      // 1. Slug format: /Tra-gao-lut-dau-den-...-i.291773099.4345422731
      const slugMatch = decodedPath.match(/^(.*?)-i\.(\d+)\.(\d+)/);
      if (slugMatch) {
        const title = slugMatch[1].replace(/-/g, " ").trim();
        return {
          title,
          shopId: slugMatch[2],
          itemId: slugMatch[3],
        };
      }

      // 2. /product/{shopId}/{itemId} or /opaanlp/{shopId}/{itemId}
      const prodMatch = decodedPath.match(/(?:product|opaanlp|i)\/(\d+)\/(\d+)/i);
      if (prodMatch) {
        return {
          title: "",
          shopId: prodMatch[1],
          itemId: prodMatch[2],
        };
      }

      // 3. Generic {shopId}/{itemId} pattern in path (at least 6 digits / 8 digits)
      const genericMatch = decodedPath.match(/(\d{6,})\/(\d{8,})/);
      if (genericMatch) {
        return {
          title: "",
          shopId: genericMatch[1],
          itemId: genericMatch[2],
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

    try {
      // 1. If it's a shortlink (s.shopee.vn, vn.shp.ee, shope.ee), resolve redirect location
      if (/shope\.ee|shp\.ee|s\.shopee\.vn/.test(trimmed)) {
        try {
          const redirectRes = await fetch(trimmed, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
            redirect: "manual",
          });
          const loc = redirectRes.headers.get("location");
          if (loc) {
            resolvedUrl = loc;
          }
        } catch (e) {
          console.warn("Failed to resolve shortlink:", e);
        }
      }

      // 2. Extract shopId and itemId
      const ids = this.extractIds(resolvedUrl);
      let extractedTitle = ids.title || "";
      const shopId = ids.shopId;
      const itemId = ids.itemId;

      // 3. Construct target URL to scrape with SSR bot
      const targetUrl =
        shopId && itemId ? `https://shopee.vn/product/${shopId}/${itemId}` : resolvedUrl;

      // Fetch with Facebookbot crawler User-Agent: Shopee returns full SSR HTML with og:title and og:image!
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // 4. Extract title
      let title =
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text().trim() ||
        extractedTitle;

      if (title) {
        // Strip trailing Shopee branding
        title = title.replace(/\s*\|\s*Shopee.*$/i, "").trim();
      }

      // 5. Extract thumbnail
      let thumbnail =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "";

      const shopeeDefaultLogo = "d4bbea4570b93bfd5fc652ca82a262a8";
      if (thumbnail.includes(shopeeDefaultLogo)) {
        thumbnail = "";
      }

      // Fallback: scan HTML for Shopee image CDN matches
      if (!thumbnail) {
        const imageMatches = html.match(
          /https:\/\/(?:cf\.shopee\.vn|down-vn\.img\.susercontent\.com)\/file\/([a-zA-Z0-9_-]{32,})/g
        );

        if (imageMatches && imageMatches.length > 0) {
          const candidate = imageMatches.find((img) => !img.includes(shopeeDefaultLogo));
          if (candidate) {
            thumbnail = candidate;
          }
        }
      }

      // 6. Return result if either title or thumbnail found
      if (title || thumbnail) {
        return {
          success: true,
          title: title || "Sản phẩm Shopee",
          thumbnail: thumbnail || "",
          originalUrl: resolvedUrl,
        };
      }

      return {
        success: false,
        title: "",
        thumbnail: "",
        originalUrl: resolvedUrl,
        error: `Debug: status=${response.status}, target=${targetUrl}, len=${html.length}, snippet=${html.substring(0, 200).replace(/[\r\n]+/g, " ")}`,
      };
    } catch (err: any) {
      console.warn("Shopee metadata fetch error:", err?.message || err);

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
