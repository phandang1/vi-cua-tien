-- Seed data for "Vị Của Tiên" Mini Web
-- Categories
INSERT INTO categories (id, name, slug, icon, description, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Tất cả', 'tat-ca', 'leaf', 'Tất cả sản phẩm', 0, true),
  ('c1000000-0000-0000-0000-000000000002', 'Đồ ăn vặt', 'do-an-vat', 'utensils', 'Món ăn vặt lành mạnh, giòn thơm tự nhiên', 1, true),
  ('c1000000-0000-0000-0000-000000000003', 'Đồ uống', 'do-uong', 'coffee', 'Trà thảo mộc, mật ong tự nhiên', 2, true),
  ('c1000000-0000-0000-0000-000000000004', 'Gia vị', 'gia-vi', 'soup', 'Gia vị truyền thống đậm đà tinh túy Việt', 3, true),
  ('c1000000-0000-0000-0000-000000000005', 'Đồ bếp', 'do-bep', 'cooking-pot', 'Dụng cụ làm bếp mộc mạc và an lành', 4, true),
  ('c1000000-0000-0000-0000-000000000006', 'Sản phẩm khác', 'san-pham-khac', 'grid', 'Các sản phẩm chọn lọc phong cách sống xanh', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Initial Products
INSERT INTO products (id, category_id, title, slug, shopee_url, affiliate_url, thumbnail_url, sort_order, is_featured, is_active)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Hạt dinh dưỡng mix cao cấp',
    'hat-dinh-duong-mix-cao-cap',
    'https://shopee.vn/product/123456/111111',
    'https://shope.ee/sample-nut-mix',
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80',
    1,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Tương ớt nhà làm Vị Của Tiên',
    'tuong-ot-nha-lam-vi-cua-tien',
    'https://shopee.vn/product/123456/222222',
    'https://shope.ee/sample-chili-sauce',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    2,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'Xoài sấy dẻo thơm ngon',
    'xoai-say-deo-thom-ngon',
    'https://shopee.vn/product/123456/333333',
    'https://shope.ee/sample-dried-mango',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&auto=format&fit=crop&q=80',
    3,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Trà hoa cúc thanh nhiệt',
    'tra-hoa-cuc-thanh-nhiet',
    'https://shopee.vn/product/123456/444444',
    'https://shope.ee/sample-chamomile-tea',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
    4,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000002',
    'Granola ăn liền giàu dinh dưỡng',
    'granola-an-lien-giau-dinh-duong',
    'https://shopee.vn/product/123456/555555',
    'https://shope.ee/sample-granola',
    'https://images.unsplash.com/photo-1517093157656-b9ec8161f32a?w=600&auto=format&fit=crop&q=80',
    5,
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Trái cây sấy thập cẩm tự nhiên',
    'trai-cay-say-thap-cam-tu-nhien',
    'https://shopee.vn/product/123456/666666',
    'https://shope.ee/sample-fruits',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    6,
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000003',
    'Mật ong hoa rừng nguyên chất',
    'mat-ong-hoa-rung-nguyen-chat',
    'https://shopee.vn/product/123456/777777',
    'https://shope.ee/sample-honey',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    7,
    false,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000004',
    'Muối tiêu chanh Tây Ninh',
    'muoi-tieu-chanh-tay-ninh',
    'https://shopee.vn/product/123456/888888',
    'https://shope.ee/sample-salt',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    8,
    false,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Initial Settings
INSERT INTO site_settings (id, site_name, tagline, description, hero_quote, youtube_url, tiktok_url, facebook_url, instagram_url, contact_url, footer_text)
VALUES (
  's1000000-0000-0000-0000-000000000001',
  'Vị Của Tiên',
  'TINH HOA ẨM THỰC • VỊ NGON TỪ THIÊN NHIÊN',
  'Khám phá các sản phẩm ẩm thực, đồ ăn vặt, trà thảo mộc lành mạnh và gia vị truyền thống được Vị Của Tiên chọn lọc tâm huyết.',
  'Món ngon hôm nay là hạnh phúc ngày mai',
  'https://youtube.com/@vicuatien',
  'https://tiktok.com/@vicuatien',
  'https://facebook.com/vicuatien',
  'https://instagram.com/vicuatien',
  'https://zalo.me',
  'EAT GOOD · LIVE BETTER · BE HAPPIER'
)
ON CONFLICT (id) DO NOTHING;
