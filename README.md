# 🌿 Vị Của Tiên — Mini Web Storefront & Shopee Affiliate

Mini storefront giới thiệu và tiếp thị sản phẩm ẩm thực, đồ ăn vặt bổ dưỡng, trà thảo mộc và gia vị truyền thống cho thương hiệu **Vị Của Tiên**.
Dự án được xây dựng bám sát 100% tài liệu đặc tả `Vi_Cua_Tien_Mini_Web_Spec_AI_Agent.docx` và thiết kế wireframe `90731d70-c10d-47be-b4be-f780db386571.png`.

---

## 🌟 Tính năng chính

1. **Giao diện chuẩn Mockup (Mobile-first 9:16):**
   - Tông màu ấm cúng: Warm cream (`#F7F3E8`), Olive green (`#53683A`), Dark olive (`#27351E`), Shopee orange (`#EE4D2D`).
   - Logo thư pháp tròn triện đỏ, núi non mây ngàn, chén trà hoa cúc bốc khói nghi ngút.
   - Slogan *"Ăn ngon Sống lành Cùng Vị Của Tiên ♡"* & Biển gỗ *"Từ Thiên Nhiên Đến Bữa Ăn Việt"*.
   - Thanh tìm kiếm dạng viên thuốc (Pill Search) lọc trực tiếp thời gian thực.
   - Danh mục dạng nút tròn biểu tượng: *Tất cả, Đồ ăn vặt, Đồ uống, Gia vị, Đồ bếp, Sản phẩm khác*.
   - 5 kênh mạng xã hội: YouTube, TikTok, Instagram, Facebook, Liên hệ.
   - Lưới sản phẩm 4 cột (responsive 2 cột mobile), thẻ tối giản chỉ gồm ảnh + tên món + nút [Mua trên Shopee].
   - Banner quảng bá phong vị ẩm thực mộc mạc và thanh cam kết uy tín 3 tiêu chuẩn.

2. **Affiliate Click Tracker `/go/[slug]`:**
   - Người dùng bấm [Mua trên Shopee] sẽ được điều hướng qua `/go/[slug]`.
   - Hệ thống tự động ghi nhận lượt click (thời gian, thiết bị, referrer, user-agent) rồi chuyển tiếp `307 Redirect` sang link affiliate của shop.

3. **Admin Quick Add từ Shopee:**
   - Dán link Shopee gốc (`shopee.vn/...` hoặc `vn.shp.ee/...`).
   - Bấm **"Lấy thông tin"**: API tự động bóc tách tiêu đề và ảnh đại diện sản phẩm từ OpenGraph và Schema.
   - Cơ chế Resilient Fallback: Cho phép điều chỉnh tiêu đề và dán link ảnh thủ công nếu Shopee chặn bot.
   - Bắt buộc điền link Affiliate trước khi lưu để đảm bảo doanh thu tiếp thị.

4. **Quản lý danh mục & Thống kê:**
   - Thêm, sửa, ẩn/hiện danh mục sản phẩm.
   - Báo cáo số lượt clicks hôm nay, 7 ngày, 30 ngày và bảng xếp hạng sản phẩm bán chạy nhất.
   - Cài đặt tùy biến thương hiệu, slogan và mạng xã hội.

---

## 🚀 Hướng dẫn khởi chạy cục bộ (Local Development)

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy môi trường phát triển:
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm website.

- **Trang chủ:** [http://localhost:3000/](http://localhost:3000/)
- **Trang quản trị (Admin):** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Thêm sản phẩm nhanh Shopee:** [http://localhost:3000/admin/products/new](http://localhost:3000/admin/products/new)

---

## 🗄️ Cấu hình Cơ sở dữ liệu Supabase (Tùy chọn)

Dự án đã tích hợp sẵn cơ chế **Fallback Mock Data**, giúp website và trang Admin chạy mượt mà ngay cả khi chưa kết nối Supabase. Để kết nối cơ sở dữ liệu Supabase thật:

1. Tạo một dự án mới trên [Supabase](https://supabase.com/).
2. Mở mục **SQL Editor** trong Supabase Dashboard:
   - Copy nội dung file `supabase/schema.sql` và nhấn **Run** để khởi tạo các bảng và phân quyền RLS.
   - Copy nội dung file `supabase/seed.sql` và nhấn **Run** để nạp sẵn dữ liệu mẫu.
3. Tạo file `.env.local` ở thư mục gốc và điền các khóa lấy từ mục **Project Settings > API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
Hệ thống sẽ tự động chuyển sang đọc/ghi dữ liệu từ Supabase thật 100%.

---

## ☁️ Hướng dẫn Deploy lên Vercel

1. Đẩy mã nguồn lên GitHub/GitLab.
2. Truy cập [Vercel](https://vercel.com/) và import repository.
3. Thêm các biến môi trường từ `.env.local` (nếu dùng Supabase).
4. Nhấn **Deploy**. Trang web sẽ sẵn sàng trong vòng chưa đầy 1 phút!
