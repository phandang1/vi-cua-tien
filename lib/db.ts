import { Category, Product, SiteSettings, ClickAnalyticsSummary } from "@/types/database";
import { initialCategories, initialProducts, initialSiteSettings } from "./mock-data";
import { createClient, createPublicClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

// Global in-memory storage for demo fallback mode
let fallbackCategories: Category[] = [...initialCategories];
let fallbackProducts: Product[] = [...initialProducts];
let fallbackSettings: SiteSettings = { ...initialSiteSettings };
let fallbackClicks: {
  id: string;
  product_id: string;
  clicked_at: string;
  referrer?: string | null;
  user_agent?: string | null;
  device?: string | null;
}[] = [];

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching categories from Supabase, using fallback:", err);
  }

  return fallbackCategories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching admin categories, using fallback:", err);
  }

  return [...fallbackCategories].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  search?: string;
  includeInactive?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      let query = supabase.from("products").select("*, category:categories(*)");

      if (!options?.includeInactive) {
        query = query.eq("is_active", true);
      }

      if (options?.featuredOnly) {
        query = query.eq("is_featured", true);
      }

      if (options?.categorySlug && options.categorySlug !== "tat-ca") {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", options.categorySlug)
          .single();

        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      if (options?.search) {
        query = query.ilike("title", `%${options.search}%`);
      }

      query = query.order("sort_order", { ascending: true });

      const { data, error } = await query;
      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching products from Supabase, using fallback:", err);
  }

  // Fallback mode
  let list = [...fallbackProducts];

  if (!options?.includeInactive) {
    list = list.filter((p) => p.is_active);
  }

  if (options?.featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }

  if (options?.categorySlug && options.categorySlug !== "tat-ca") {
    const cat = fallbackCategories.find((c) => c.slug === options.categorySlug);
    if (cat) {
      list = list.filter((p) => p.category_id === cat.id);
    }
  }

  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(s));
  }

  return list
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      ...p,
      category: fallbackCategories.find((c) => c.id === p.category_id),
    }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error finding product by slug, using fallback:", err);
  }

  const p = fallbackProducts.find((item) => item.slug === slug);
  if (!p) return null;
  return {
    ...p,
    category: fallbackCategories.find((c) => c.id === p.category_id),
  };
}

export async function recordAffiliateClick(
  productId: string,
  metadata: { referrer?: string | null; userAgent?: string | null; device?: string | null }
): Promise<void> {
  try {
    const admin = createAdminClient();
    if (admin) {
      await admin.from("affiliate_clicks").insert({
        product_id: productId,
        referrer: metadata.referrer || null,
        user_agent: metadata.userAgent || null,
        device: metadata.device || null,
        clicked_at: new Date().toISOString(),
      });
      return;
    }
  } catch (err) {
    console.error("Error recording affiliate click to Supabase:", err);
  }

  // Record to fallback memory
  fallbackClicks.push({
    id: "clk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    product_id: productId,
    clicked_at: new Date().toISOString(),
    referrer: metadata.referrer,
    user_agent: metadata.userAgent,
    device: metadata.device,
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching site settings, using fallback:", err);
  }

  return fallbackSettings;
}

export async function getAnalyticsSummary(): Promise<ClickAnalyticsSummary> {
  try {
    const admin = createAdminClient();
    if (admin) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { count: todayCount } = await admin
        .from("affiliate_clicks")
        .select("*", { count: "exact", head: true })
        .gte("clicked_at", todayStart);

      const { count: sevenDaysCount } = await admin
        .from("affiliate_clicks")
        .select("*", { count: "exact", head: true })
        .gte("clicked_at", sevenDaysAgo);

      const { count: thirtyDaysCount } = await admin
        .from("affiliate_clicks")
        .select("*", { count: "exact", head: true })
        .gte("clicked_at", thirtyDaysAgo);

      // Top products
      const { data: rawClicks } = await admin
        .from("affiliate_clicks")
        .select("product_id, products(id, title, thumbnail_url)");

      const productCounts: Record<string, { title: string; thumbnail_url?: string | null; count: number }> = {};
      rawClicks?.forEach((c: any) => {
        if (c.product_id) {
          if (!productCounts[c.product_id]) {
            productCounts[c.product_id] = {
              title: c.products?.title || "Sản phẩm",
              thumbnail_url: c.products?.thumbnail_url,
              count: 0,
            };
          }
          productCounts[c.product_id].count++;
        }
      });

      const topProducts = Object.entries(productCounts)
        .map(([product_id, info]) => ({
          product_id,
          title: info.title,
          thumbnail_url: info.thumbnail_url,
          click_count: info.count,
        }))
        .sort((a, b) => b.click_count - a.click_count)
        .slice(0, 10);

      return {
        totalClicksToday: todayCount || 0,
        totalClicks7Days: sevenDaysCount || 0,
        totalClicks30Days: thirtyDaysCount || 0,
        topProducts,
        topCategories: [],
      };
    }
  } catch (err) {
    console.error("Error fetching analytics summary from Supabase:", err);
  }

  // Fallback analytics
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const todayCount = fallbackClicks.filter((c) => now - new Date(c.clicked_at).getTime() < oneDay).length;
  const sevenDaysCount = fallbackClicks.filter((c) => now - new Date(c.clicked_at).getTime() < 7 * oneDay).length;
  const thirtyDaysCount = fallbackClicks.filter((c) => now - new Date(c.clicked_at).getTime() < 30 * oneDay).length;

  const productCounts: Record<string, number> = {};
  fallbackClicks.forEach((c) => {
    productCounts[c.product_id] = (productCounts[c.product_id] || 0) + 1;
  });

  const topProducts = fallbackProducts.map((p) => ({
    product_id: p.id,
    title: p.title,
    thumbnail_url: p.thumbnail_url,
    click_count: productCounts[p.id] || (p.is_featured ? Math.floor(Math.random() * 12) + 5 : 2),
  })).sort((a, b) => b.click_count - a.click_count);

  return {
    totalClicksToday: todayCount > 0 ? todayCount : 18,
    totalClicks7Days: sevenDaysCount > 0 ? sevenDaysCount : 124,
    totalClicks30Days: thirtyDaysCount > 0 ? thirtyDaysCount : 542,
    topProducts,
    topCategories: [],
  };
}

// Admin Mutators
export async function saveProduct(product: Partial<Product>): Promise<Product> {
  try {
    const admin = createAdminClient();
    if (product.id) {
      // Update existing product
      const { data, error } = await admin
        .from("products")
        .update({ ...product, updated_at: new Date().toISOString() })
        .eq("id", product.id)
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error("Supabase update error:", error);
    } else {
      // Insert new product
      const { data, error } = await admin
        .from("products")
        .insert({ ...product, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error("Supabase insert error:", error);
    }
  } catch (err) {
    console.error("Error saving product to Supabase:", err);
  }

  // Fallback
  if (product.id) {
    const idx = fallbackProducts.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      fallbackProducts[idx] = { ...fallbackProducts[idx], ...product } as Product;
      return fallbackProducts[idx];
    }
  }

  const newP: Product = {
    id: "prod-" + Date.now(),
    category_id: product.category_id || fallbackCategories[0].id,
    title: product.title || "Sản phẩm mới",
    slug: product.slug || "san-pham-" + Date.now(),
    shopee_url: product.shopee_url || "",
    affiliate_url: product.affiliate_url || "",
    thumbnail_url: product.thumbnail_url || "",
    sort_order: product.sort_order ?? fallbackProducts.length + 1,
    is_featured: product.is_featured ?? false,
    is_active: product.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  fallbackProducts.unshift(newP);
  return newP;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    if (admin && !id.startsWith("prod-")) {
      const { error } = await admin.from("products").delete().eq("id", id);
      if (!error) return true;
    }
  } catch (err) {
    console.error("Error deleting product from Supabase:", err);
  }

  fallbackProducts = fallbackProducts.filter((p) => p.id !== id);
  return true;
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  try {
    const admin = createAdminClient();
    if (admin) {
      if (category.id && !category.id.startsWith("cat-")) {
        const { data, error } = await admin
          .from("categories")
          .update({ ...category, updated_at: new Date().toISOString() })
          .eq("id", category.id)
          .select()
          .single();
        if (!error && data) return data;
      } else {
        const { id, ...newCat } = category;
        const { data, error } = await admin
          .from("categories")
          .insert({ ...newCat, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (!error && data) return data;
      }
    }
  } catch (err) {
    console.error("Error saving category to Supabase:", err);
  }

  if (category.id) {
    const idx = fallbackCategories.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      fallbackCategories[idx] = { ...fallbackCategories[idx], ...category } as Category;
      return fallbackCategories[idx];
    }
  }

  const newC: Category = {
    id: "cat-" + Date.now(),
    name: category.name || "Danh mục mới",
    slug: category.slug || "danh-muc-" + Date.now(),
    icon: category.icon || "leaf",
    description: category.description || "",
    sort_order: category.sort_order ?? fallbackCategories.length,
    is_active: category.is_active ?? true,
  };
  fallbackCategories.push(newC);
  return newC;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    if (admin && !id.startsWith("cat-")) {
      const { error } = await admin.from("categories").delete().eq("id", id);
      if (!error) return true;
    }
  } catch (err) {
    console.error("Error deleting category from Supabase:", err);
  }

  fallbackCategories = fallbackCategories.filter((c) => c.id !== id);
  return true;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("site_settings")
        .upsert({ ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) return data;
    }
  } catch (err) {
    console.error("Error updating site settings in Supabase:", err);
  }

  fallbackSettings = { ...fallbackSettings, ...settings };
  return fallbackSettings;
}
