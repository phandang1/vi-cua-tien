import { Category, Product, SiteSettings, ClickAnalyticsSummary, Order } from "@/types/database";
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
let fallbackOrders: Order[] = [];

export async function getCategories(): Promise<Category[]> {
  // Virtual "Tất cả" category always at front
  const tatCa: Category = {
    id: "tat-ca",
    name: "Tất cả",
    slug: "tat-ca",
    icon: "utensils-crossed",
    description: "Tất cả sản phẩm tinh hoa ẩm thực",
    sort_order: 0,
    is_active: true,
  };

  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return [tatCa, ...data];
      }
    }
  } catch (err) {
    console.error("Error fetching categories from Supabase, using fallback:", err);
  }

  return [tatCa, ...fallbackCategories
    .filter((c) => c.is_active && c.slug !== "tat-ca")
    .sort((a, b) => a.sort_order - b.sort_order)];
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        return data;
      }
      if (error) console.error("Supabase admin categories error:", error);
    }
  } catch (err) {
    console.error("Error fetching admin categories:", err);
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

      query = query
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false, nullsFirst: false });

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
    .sort((a, b) => {
      // 1. Featured first
      if (Boolean(a.is_featured) !== Boolean(b.is_featured)) {
        return a.is_featured ? -1 : 1;
      }
      // 2. Custom sort order if set
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      // 3. Newest first
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    })
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
        // Parse extra fields (Telegram settings, etc.) from description if present
        let telegram_bot_token = "";
        let telegram_chat_id = "";
        let telegram_notify_enabled = false;

        try {
          if (data.description && typeof data.description === "string") {
            if (data.description.trim().startsWith("{")) {
              const extra = JSON.parse(data.description);
              telegram_bot_token = extra.telegram_bot_token || "";
              telegram_chat_id = extra.telegram_chat_id || "";
              telegram_notify_enabled = Boolean(extra.telegram_notify_enabled);
            }
          }
        } catch {}

        return {
          ...data,
          telegram_bot_token,
          telegram_chat_id,
          telegram_notify_enabled,
        };
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

  return {
    totalClicksToday: todayCount || 0,
    totalClicks7Days: sevenDaysCount || 0,
    totalClicks30Days: thirtyDaysCount || 0,
    topProducts: [],
    topCategories: [],
  };
}

// Admin Mutators
export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const admin = createAdminClient();

  // Strip relation objects (like category) and construct clean payload
  const { category, ...cleanProduct } = product as any;
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (cleanProduct.category_id !== undefined) payload.category_id = cleanProduct.category_id;
  if (cleanProduct.title !== undefined) payload.title = cleanProduct.title;
  if (cleanProduct.slug !== undefined) payload.slug = cleanProduct.slug;
  if (cleanProduct.shopee_url !== undefined) payload.shopee_url = cleanProduct.shopee_url;
  if (cleanProduct.affiliate_url !== undefined) payload.affiliate_url = cleanProduct.affiliate_url;
  if (cleanProduct.thumbnail_url !== undefined) payload.thumbnail_url = cleanProduct.thumbnail_url;
  if (cleanProduct.sort_order !== undefined) payload.sort_order = cleanProduct.sort_order;
  if (cleanProduct.is_featured !== undefined) payload.is_featured = cleanProduct.is_featured;
  if (cleanProduct.is_active !== undefined) payload.is_active = cleanProduct.is_active;

  if (product.id) {
    // Update existing product
    const { data, error } = await admin
      .from("products")
      .update(payload)
      .eq("id", product.id)
      .select("*, category:categories(*)")
      .single();

    if (error) {
      console.error("Supabase update product error:", error);
      throw new Error(error.message || "Không thể cập nhật sản phẩm trong Supabase");
    }
    return data;
  } else {
    // Insert new product
    const { data, error } = await admin
      .from("products")
      .insert(payload)
      .select("*, category:categories(*)")
      .single();

    if (error) {
      console.error("Supabase insert product error:", error);
      throw new Error(error.message || "Không thể tạo sản phẩm trong Supabase");
    }
    return data;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    console.error("Supabase delete product error:", error);
    throw new Error(error.message || "Không thể xóa sản phẩm trong Supabase");
  }
  return true;
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const admin = createAdminClient();

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (category.name !== undefined) payload.name = category.name;
  if (category.slug !== undefined) payload.slug = category.slug;
  if (category.icon !== undefined) payload.icon = category.icon;
  if (category.description !== undefined) payload.description = category.description;
  if (category.sort_order !== undefined) payload.sort_order = category.sort_order;
  if (category.is_active !== undefined) payload.is_active = category.is_active;

  if (category.id) {
    const { data, error } = await admin
      .from("categories")
      .update(payload)
      .eq("id", category.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update category error:", error);
      throw new Error(error.message || "Không thể cập nhật danh mục trong Supabase");
    }
    return data;
  } else {
    const { data, error } = await admin
      .from("categories")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert category error:", error);
      throw new Error(error.message || "Không thể tạo danh mục trong Supabase");
    }
    return data;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("categories").delete().eq("id", id);
    if (!error) return true;
    if (error) console.error("Supabase category delete error:", error);
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
      let id = settings.id;
      let existingDesc: string | null = null;

      const { data: existing } = await admin
        .from("site_settings")
        .select("id, description")
        .limit(1)
        .single();

      if (existing) {
        id = existing.id;
        existingDesc = existing.description;
      }

      // Merge extra fields into description JSON
      let descObj: any = {};
      try {
        if (existingDesc && existingDesc.trim().startsWith("{")) {
          descObj = JSON.parse(existingDesc);
        }
      } catch {}

      if (settings.telegram_bot_token !== undefined) {
        descObj.telegram_bot_token = settings.telegram_bot_token;
      }
      if (settings.telegram_chat_id !== undefined) {
        descObj.telegram_chat_id = settings.telegram_chat_id;
      }
      if (settings.telegram_notify_enabled !== undefined) {
        descObj.telegram_notify_enabled = settings.telegram_notify_enabled;
      }

      // Build payload with ONLY supported database columns
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (id) payload.id = id;
      if (settings.site_name !== undefined) payload.site_name = settings.site_name;
      if (settings.tagline !== undefined) payload.tagline = settings.tagline;
      if (settings.hero_quote !== undefined) payload.hero_quote = settings.hero_quote;
      if (settings.youtube_url !== undefined) payload.youtube_url = settings.youtube_url;
      if (settings.tiktok_url !== undefined) payload.tiktok_url = settings.tiktok_url;
      if (settings.facebook_url !== undefined) payload.facebook_url = settings.facebook_url;
      if (settings.instagram_url !== undefined) payload.instagram_url = settings.instagram_url;
      if (settings.contact_url !== undefined) payload.contact_url = settings.contact_url;
      if (settings.logo_url !== undefined) payload.logo_url = settings.logo_url;
      if (settings.hero_image_url !== undefined) payload.hero_image_url = settings.hero_image_url;
      if (settings.footer_text !== undefined) payload.footer_text = settings.footer_text;
      if (settings.popular_keywords !== undefined) payload.popular_keywords = settings.popular_keywords;

      // Persist the combined JSON into description column
      payload.description = JSON.stringify(descObj);

      const { data, error } = await admin
        .from("site_settings")
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          ...data,
          telegram_bot_token: descObj.telegram_bot_token || "",
          telegram_chat_id: descObj.telegram_chat_id || "",
          telegram_notify_enabled: Boolean(descObj.telegram_notify_enabled),
        };
      }
      if (error) console.error("Supabase update site settings error:", error);
    }
  } catch (err) {
    console.error("Error updating site settings in Supabase:", err);
  }

  fallbackSettings = { ...fallbackSettings, ...settings };
  return fallbackSettings;
}

// ==========================================
// ORDER MANAGEMENT FUNCTIONS (LƯU & QUẢN LÝ ĐƠN HÀNG)
// ==========================================

export async function saveOrder(orderData: Partial<Order>): Promise<Order> {
  const admin = createAdminClient();
  const orderCode =
    orderData.order_code ||
    `BP${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    id:
      orderData.id ||
      `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order_code: orderCode,
    customer_name: (orderData.customer_name || "").trim(),
    customer_phone: (orderData.customer_phone || "").trim(),
    customer_address: (orderData.customer_address || "").trim(),
    combo_id: Number(orderData.combo_id) || 1,
    combo_name: orderData.combo_name || "1 Cái Đèn T6 (119K)",
    color: orderData.color || "Đen Tuyền",
    product_name:
      orderData.product_name ||
      "Đèn Xe Đạp Có Còi Pin Sạc USB LED T6 Chống Nước",
    item_price: Number(orderData.item_price) || 119000,
    shipping_fee: Number(orderData.shipping_fee) || 0,
    total_price: Number(orderData.total_price) || 119000,
    status: orderData.status || "pending",
    note: orderData.note || "",
    traffic_source: orderData.traffic_source,
    fbclid: orderData.fbclid,
    created_at: orderData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Thử lưu vào bảng `orders` của Supabase trước nếu bảng đã được tạo
  if (admin) {
    try {
      const insertPayload: any = { ...newOrder };
      const isUuid =
        typeof insertPayload.id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          insertPayload.id
        );
      if (!isUuid) {
        delete insertPayload.id;
      }

      let { data, error } = await admin
        .from("orders")
        .insert(insertPayload)
        .select()
        .single();

      // Nếu Supabase báo thiếu cột traffic_source hoặc fbclid, loại bỏ và thử lại
      if (error && (error.code === "PGRST204" || error.message?.includes("column"))) {
        delete insertPayload.traffic_source;
        delete insertPayload.fbclid;
        const retry = await admin
          .from("orders")
          .insert(insertPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        return {
          ...data,
          traffic_source: newOrder.traffic_source,
          fbclid: newOrder.fbclid,
        } as Order;
      }
      if (error && error.code !== "PGRST205") {
        console.warn("Supabase orders table error:", error);
      }
    } catch (e) {
      console.warn("Failed inserting into orders table:", e);
    }
  }

  // 2. Cơ chế Fallback đám mây: Lưu vào mảng `orders` trong `site_settings.description`
  // Đảm bảo không bao giờ mất đơn dù chưa tạo bảng `orders` trong SQL
  try {
    if (admin) {
      const { data: currentSettings } = await admin
        .from("site_settings")
        .select("id, description")
        .limit(1)
        .single();

      if (currentSettings) {
        let descObj: any = {};
        try {
          if (
            currentSettings.description &&
            currentSettings.description.trim().startsWith("{")
          ) {
            descObj = JSON.parse(currentSettings.description);
          }
        } catch {}

        const existingOrders: Order[] = Array.isArray(descObj.orders)
          ? descObj.orders
          : [];
        // Chèn đơn mới lên đầu danh sách
        const updatedOrders = [
          newOrder,
          ...existingOrders.filter((o: Order) => o.id !== newOrder.id),
        ];
        descObj.orders = updatedOrders;

        await admin
          .from("site_settings")
          .update({
            description: JSON.stringify(descObj),
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSettings.id);
      }
    }
  } catch (err) {
    console.error("Error saving fallback order to site_settings:", err);
  }

  // 3. Lưu vào in-memory fallback
  fallbackOrders = [
    newOrder,
    ...fallbackOrders.filter((o) => o.id !== newOrder.id),
  ];
  return newOrder;
}

export async function getOrders(options?: {
  status?: string;
  search?: string;
}): Promise<Order[]> {
  const admin = createAdminClient();
  let ordersList: Order[] = [];

  // 1. Thử lấy từ bảng `orders` của Supabase
  if (admin) {
    try {
      let query = admin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }

      if (options?.search) {
        query = query.or(
          `customer_name.ilike.%${options.search}%,customer_phone.ilike.%${options.search}%,order_code.ilike.%${options.search}%`
        );
      }

      const { data, error } = await query;
      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data as Order[];
      }
    } catch (e) {
      // Table may not exist yet, fallback below
    }
  }

  // 2. Fallback: Đọc từ `site_settings.description`
  try {
    if (admin) {
      const { data: currentSettings } = await admin
        .from("site_settings")
        .select("description")
        .limit(1)
        .single();

      if (currentSettings?.description) {
        if (currentSettings.description.trim().startsWith("{")) {
          const parsed = JSON.parse(currentSettings.description);
          if (Array.isArray(parsed.orders)) {
            ordersList = parsed.orders;
          }
        }
      }
    }
  } catch (e) {}

  if (ordersList.length === 0) {
    ordersList = [...fallbackOrders];
  }

  // Áp dụng bộ lọc cho fallback
  if (options?.status && options.status !== "all") {
    ordersList = ordersList.filter((o) => o.status === options.status);
  }

  if (options?.search) {
    const s = options.search.toLowerCase();
    ordersList = ordersList.filter(
      (o) =>
        o.customer_name?.toLowerCase().includes(s) ||
        o.customer_phone?.toLowerCase().includes(s) ||
        o.order_code?.toLowerCase().includes(s)
    );
  }

  return ordersList.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  const admin = createAdminClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data as Order;
    } catch (e) {}
  }

  const all = await getOrders();
  return all.find((o) => o.id === id) || null;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<boolean> {
  const admin = createAdminClient();

  // 1. Cập nhật trong bảng `orders` nếu có
  if (admin) {
    try {
      const { error } = await admin
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (!error) return true;
    } catch (e) {}
  }

  // 2. Cập nhật trong fallback `site_settings.description`
  try {
    if (admin) {
      const { data: currentSettings } = await admin
        .from("site_settings")
        .select("id, description")
        .limit(1)
        .single();

      if (currentSettings?.description) {
        const descObj = JSON.parse(currentSettings.description);
        if (Array.isArray(descObj.orders)) {
          descObj.orders = descObj.orders.map((o: Order) =>
            o.id === id
              ? { ...o, status, updated_at: new Date().toISOString() }
              : o
          );
          await admin
            .from("site_settings")
            .update({
              description: JSON.stringify(descObj),
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSettings.id);
          return true;
        }
      }
    }
  } catch (e) {}

  // 3. Fallback memory
  fallbackOrders = fallbackOrders.map((o) =>
    o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
  );
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const admin = createAdminClient();

  // 1. Thử xóa trong Supabase `orders`
  if (admin) {
    try {
      const { error } = await admin.from("orders").delete().eq("id", id);
      if (!error) return true;
    } catch (e) {}
  }

  // 2. Fallback: Xóa khỏi `site_settings.description`
  try {
    if (admin) {
      const { data: currentSettings } = await admin
        .from("site_settings")
        .select("id, description")
        .limit(1)
        .single();

      if (currentSettings?.description) {
        const descObj = JSON.parse(currentSettings.description);
        if (Array.isArray(descObj.orders)) {
          descObj.orders = descObj.orders.filter((o: Order) => o.id !== id);
          await admin
            .from("site_settings")
            .update({
              description: JSON.stringify(descObj),
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSettings.id);
          return true;
        }
      }
    }
  } catch (e) {}

  fallbackOrders = fallbackOrders.filter((o) => o.id !== id);
  return true;
}

export async function getOrderAnalyticsSummary(): Promise<{
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}> {
  const orders = await getOrders();
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  let totalRevenue = 0;
  let todayOrders = 0;
  let pendingOrders = 0;

  for (const o of orders) {
    if (o.status !== "cancelled") {
      totalRevenue += Number(o.total_price) || 0;
    }
    const orderTime = new Date(o.created_at).getTime();
    if (orderTime >= todayStart) {
      todayOrders++;
    }
    if (o.status === "pending") {
      pendingOrders++;
    }
  }

  return {
    totalOrders: orders.length,
    todayOrders,
    totalRevenue,
    pendingOrders,
  };
}
