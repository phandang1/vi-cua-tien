-- Tạo bảng Đơn hàng (orders) cho hệ thống landing page bán Đèn Xe Đạp
-- Copy và dán toàn bộ nội dung này vào Supabase Dashboard -> SQL Editor -> Bấm RUN để thực thi

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    combo_id INTEGER DEFAULT 1,
    combo_name TEXT NOT NULL,
    color TEXT DEFAULT 'Đen Tuyền',
    product_name TEXT DEFAULT 'Đèn Xe Đạp Có Còi Pin Sạc USB LED T6',
    item_price NUMERIC NOT NULL DEFAULT 119000,
    shipping_fee NUMERIC DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 119000,
    status TEXT DEFAULT 'pending', -- pending: Chờ xác nhận, confirmed: Đã xác nhận, shipping: Đang giao, delivered: Hoàn thành, cancelled: Hủy
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chỉ mục tối ưu tốc độ tìm kiếm và sắp xếp
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);

-- Kích hoạt Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Cho phép khách đặt hàng từ Landing page tạo đơn mới (INSERT)
CREATE POLICY "Cho phep tao don hang moi"
ON orders FOR INSERT
WITH CHECK (true);

-- Cho phép Admin và Service Role toàn quyền xem, sửa, xóa đơn
CREATE POLICY "Toan quyen quan ly don hang"
ON orders FOR ALL
USING (true)
WITH CHECK (true);

