-- Schema for "Vị Của Tiên" Mini Web / Affiliate Storefront
-- Compatible with Supabase PostgreSQL and Row Level Security (RLS)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    shopee_url TEXT,
    affiliate_url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT NOT NULL DEFAULT 'Vị Của Tiên',
    tagline TEXT DEFAULT 'TINH HOA ẨM THỰC • VỊ NGON TỪ THIÊN NHIÊN',
    description TEXT,
    hero_quote TEXT DEFAULT 'Món ngon hôm nay là hạnh phúc ngày mai',
    youtube_url TEXT DEFAULT '',
    tiktok_url TEXT DEFAULT '',
    facebook_url TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    contact_url TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    hero_image_url TEXT DEFAULT '',
    footer_text TEXT DEFAULT 'EAT GOOD · LIVE BETTER · BE HAPPIER',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Affiliate Clicks Table (Tracking)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    device TEXT
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);

-- 7. Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 7.1 Categories Policies
CREATE POLICY "Public can view active categories"
ON categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7.2 Products Policies
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7.3 Site Settings Policies
CREATE POLICY "Public can view site settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update site settings"
ON site_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7.4 Affiliate Clicks Policies
CREATE POLICY "Service and Authenticated can view clicks"
ON affiliate_clicks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow logging clicks"
ON affiliate_clicks FOR INSERT
WITH CHECK (true);
