# QUY CHUẨN KỸ THUẬT: TÍCH HỢP META PIXEL & CAPI KHỬ TRÙNG LẶP SỰ KIỆN (DEDUPLICATION)

> **Mục tiêu**: Hướng dẫn chuẩn hóa 100% việc đo lường song song **Meta Pixel (Trình duyệt)** và **Conversions API (Máy chủ)** nhằm:
> 1. Triệt tiêu 100% lỗi x2 số liệu chuyển đổi (Deduplication thành công).
> 2. Đạt điểm chất lượng khớp sự kiện (**Event Match Quality - EMQ**) tối đa từ 8.0 - 10.0.
> 3. Không bị mất dữ liệu khi người dùng bật AdBlock, dùng trình duyệt Safari/iOS (ITP).

---

## 1. NGUYÊN TẮC BẤT BIẾN (CORE RULES)

| Tiêu chí | Phía Trình duyệt (Pixel) | Phía Máy chủ (CAPI) |
| :--- | :--- | :--- |
| **Tên sự kiện** | `fbq('track', 'Purchase', ...)` | `"event_name": "Purchase"` (Phải giống 100%) |
| **Mã định danh** | `{ eventID: orderCode }` *(Tham số thứ 4, chữ **ID** viết hoa)* | `"event_id": orderCode` *(Trường dữ liệu snake_case)* |
| **Giá trị định danh** | Cả hai bắt buộc dùng **CHUNG một chuỗi ký tự duy nhất** (khuyên dùng Mã đơn hàng `order_code` hoặc `UUIDv4`). |
| **Dữ liệu cá nhân (PII)** | Tự động hoặc truyền qua Advanced Matching | Bắt buộc băm mật mã **SHA-256** (lowercase) |
| **Thông số kỹ thuật** | Tự động gửi | IP, User-Agent, `_fbp`, `_fbc` gửi dạng **Plaintext** (KHÔNG HASH) |

---

## 2. QUY CHUẨN XỬ LÝ DỮ LIỆU ĐỂ ĐẠT EMQ CAO NHẤT

### 2.1. Chuẩn hóa Số điện thoại (`ph`)
- Loại bỏ toàn bộ khoảng trắng, dấu ngoặc, dấu gạch nối, dấu `+`.
- Số điện thoại Việt Nam bắt đầu bằng số `0` phải đổi thành mã quốc gia `84` (hoặc số 9 chữ số thì thêm `84` phía trước).
- *Ví dụ*: `0912 345 678` ➔ `84912345678` ➔ Băm **SHA-256**.

### 2.2. Chuẩn hóa Họ & Tên (`fn`, `ln`)
- Trim khoảng trắng thừa, chuyển về chữ thường (lowercase).
- Tách Họ (`ln`) và Tên chính (`fn`), sau đó băm từng phần bằng **SHA-256**.

### 2.3. Hai Cookie vàng của Meta (`_fbp` và `_fbc`)
- `_fbp`: Facebook Browser ID (sinh tự động khi Pixel khởi tạo trên trình duyệt).
- `_fbc`: Facebook Click ID (sinh khi khách click từ quảng cáo Facebook có tham số `fbclid`).
- **Tuyệt đối KHÔNG băm SHA-256** hai cookie này. Gửi nguyên bản lên máy chủ để Meta liên kết tài khoản người dùng ngay lập tức.

---

## 3. MẪU CODE CHUẨN HÓA (COPY & PASTE READY)

### Bước 1: Nhúng Pixel cơ sở vào thẻ `<head>` (Client)

```html
<!-- Meta Pixel Base Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

---

### Bước 2: Bắn sự kiện Purchase trên giao diện đặt hàng (Client)

```typescript
// Khi người dùng bấm nút xác nhận Đặt Hàng:

// 1. Tạo mã định danh duy nhất (Mã đơn hàng)
const orderCode = "DH" + Math.floor(100000 + Math.random() * 900000);

// 2. Lấy cookie _fbp và _fbc từ trình duyệt
const fbpMatch = document.cookie.match(/(^|;)\s*_fbp=([^;]+)/);
const fbcMatch = document.cookie.match(/(^|;)\s*_fbc=([^;]+)/);
const fbp = fbpMatch ? decodeURIComponent(fbpMatch[2]) : undefined;
const fbc = fbcMatch ? decodeURIComponent(fbcMatch[2]) : undefined;

// 3. Gửi đơn hàng lên Backend kèm order_code, fbp, fbc
await fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    order_code: orderCode,
    customer_name: fullName,
    customer_phone: phoneNumber,
    customer_address: address,
    total_price: totalPrice,
    fbp,
    fbc,
  }),
});

// 4. Bắn Meta Pixel với tham số thứ 4: { eventID: orderCode }
if (typeof (window as any).fbq === "function") {
  (window as any).fbq(
    "track",
    "Purchase",
    {
      value: Number(totalPrice),
      currency: "VND",
      content_name: productName,
      content_type: "product",
    },
    {
      eventID: orderCode, // ⭐ BẮT BUỘC: Viết đúng { eventID: '...' }
    }
  );
}
```

---

### Bước 3: Module CAPI trên máy chủ (Server - Node.js / Next.js)

Tạo file tiện ích `lib/meta-capi.ts`:

```typescript
import crypto from "crypto";

export function hashSHA256(val: string): string {
  if (!val) return "";
  const cleaned = val.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(cleaned)) return cleaned;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export function hashPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.trim().replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "84" + digits.slice(1);
  else if (digits.length === 9) digits = "84" + digits;
  return hashSHA256(digits);
}

export async function sendMetaCapiPurchase(order: any, reqMeta: any) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const payload = {
    data: [
      {
        event_name: "Purchase", // Khớp 100% với Pixel
        event_time: Math.floor(Date.now() / 1000),
        event_id: order.order_code, // ⭐ Khớp 100% với eventID ở Pixel
        event_source_url: reqMeta.referer || "https://yourdomain.com",
        action_source: "website",
        user_data: {
          client_ip_address: reqMeta.clientIp, // Không băm
          client_user_agent: reqMeta.userAgent, // Không băm
          ph: [hashPhone(order.customer_phone)], // Băm SHA-256
          fn: order.firstName ? [hashSHA256(order.firstName)] : undefined,
          ln: order.lastName ? [hashSHA256(order.lastName)] : undefined,
          fbp: reqMeta.fbp || undefined,
          fbc: reqMeta.fbc || undefined,
        },
        custom_data: {
          currency: "VND",
          value: Number(order.total_price),
          content_name: order.product_name,
          content_type: "product",
          order_id: order.order_code,
        },
      },
    ],
    // Khi test gắn mã test_event_code từ Meta Events Manager:
    // test_event_code: process.env.META_TEST_EVENT_CODE || undefined
  };

  try {
    await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[Meta CAPI Error]", err);
  }
}
```

---

### Bước 4: Gọi CAPI trong API tiếp nhận đơn hàng (Server)

```typescript
// Trong app/api/orders/route.ts

// 1. Lưu đơn vào Database thành công
const order = await saveOrderToDatabase(...);

// 2. Chạy CAPI ở chế độ nền (không dùng await để tránh làm chậm response của khách)
const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
const userAgent = req.headers.get("user-agent");
const referer = req.headers.get("referer");
const fbp = body.fbp || req.cookies.get("_fbp")?.value;
const fbc = body.fbc || req.cookies.get("_fbc")?.value;

sendMetaCapiPurchase(order, { clientIp, userAgent, referer, fbp, fbc }).catch(console.warn);

// 3. Phản hồi khách hàng ngay lập tức
return NextResponse.json({ success: true, order });
```

---

## 4. QUY TRÌNH KIỂM THỬ & NGHIỆM THU (TESTING)

1. Vào **Trình quản lý sự kiện Meta** > Chọn Pixel/Dataset > Tab **Thử nghiệm sự kiện (Test Events)**.
2. Lấy mã `TESTxxxxx` gán vào `META_TEST_EVENT_CODE` trong file cấu hình `.env`.
3. Mở ẩn danh trình duyệt, vào website đặt 1 đơn hàng thử nghiệm.
4. Kiểm tra trên màn hình Meta:
   - Sự kiện `Purchase` xuất hiện.
   - Cột **Phương thức**: Có cả **Trình duyệt (Browser)** và **Máy chủ (Server)**.
   - Trạng thái: **Đã khử trùng lặp (Deduplicated)**.
   - Số lượt chuyển đổi ghi nhận: **1** (chính xác tuyệt đối).

---

## 5. PROMPT MẪU DÙNG ĐỂ GIAO CHO AI Ở DỰ ÁN SAU

> Khi làm bất kỳ dự án mới nào, bạn chỉ cần copy nguyên văn đoạn prompt dưới đây gửi cho AI:

```text
Hãy tích hợp theo dõi chuyển đổi Meta Ads chuẩn 100% (gồm Meta Pixel ở trình duyệt và Conversions API / CAPI ở máy chủ) với cơ chế Khử trùng lặp sự kiện (Deduplication) cho dự án này theo các nguyên tắc sau:

1. Đồng bộ mã định danh duy nhất (eventID):
   - Khi khách đặt hàng, tạo mã đơn hàng duy nhất (order_code).
   - Phía Browser: Bắn fbq('track', 'Purchase', data, { eventID: order_code }). Lưu ý eventID nằm ở tham số thứ 4 của fbq.
   - Phía Server: Bắn CAPI với "event_id": order_code và "event_name": "Purchase".
2. Thu thập và chuẩn hóa dữ liệu người dùng (EMQ cao nhất):
   - Lấy cookie _fbp và _fbc từ trình duyệt gửi lên server (giữ nguyên không hash).
   - Lấy IP và User-Agent của client ở headers server (không hash).
   - Số điện thoại khách hàng phải chuẩn hóa về mã quốc gia 84 (ví dụ 0912345678 -> 84912345678) và băm SHA-256 lowercase.
   - Họ tên khách hàng tách fn/ln và băm SHA-256 lowercase.
3. Kiến trúc CAPI:
   - Gửi POST tới endpoint https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token={ACCESS_TOKEN}.
   - Xử lý CAPI bất đồng bộ (chạy nền), không làm chậm hoặc ảnh hưởng đến trải nghiệm đặt hàng của khách nếu mạng Meta bị trễ.
   - Cho phép truyền test_event_code để kiểm thử trên Meta Test Events.
```
