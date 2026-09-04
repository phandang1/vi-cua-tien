export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  shopee_url?: string | null;
  affiliate_url: string;
  thumbnail_url?: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Join category info
  category?: Category;
}

export interface SiteSettings {
  id?: string;
  site_name: string;
  tagline: string;
  description: string;
  hero_quote: string;
  youtube_url: string;
  tiktok_url: string;
  facebook_url: string;
  instagram_url: string;
  contact_url: string;
  logo_url: string;
  hero_image_url: string;
  footer_text: string;
  updated_at?: string;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  clicked_at: string;
  referrer?: string | null;
  user_agent?: string | null;
  device?: string | null;
  // Join product info
  product?: Product;
}

export interface ClickAnalyticsSummary {
  totalClicksToday: number;
  totalClicks7Days: number;
  totalClicks30Days: number;
  topProducts: {
    product_id: string;
    title: string;
    thumbnail_url?: string | null;
    click_count: number;
  }[];
  topCategories: {
    category_id: string;
    category_name: string;
    click_count: number;
  }[];
}
