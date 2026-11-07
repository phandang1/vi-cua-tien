import crypto from "crypto";
import { Order } from "@/types/database";

export interface MetaCapiUserParams {
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  referer?: string | null;
  testEventCode?: string | null;
}

/**
 * Băm chuẩn SHA-256 theo quy chuẩn Meta Ads cho dữ liệu cá nhân (PII)
 */
export function hashSHA256(val: string): string {
  if (!val) return "";
  const cleaned = val.trim().toLowerCase();
  // Nếu đã là chuỗi sha256 64 ký tự hex thì giữ nguyên
  if (/^[a-f0-9]{64}$/.test(cleaned)) {
    return cleaned;
  }
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Chuẩn hóa số điện thoại theo chuẩn quốc tế E.164 của Meta trước khi băm SHA-256
 * Ví dụ: 0912345678 -> 84912345678
 */
export function hashPhoneNumber(phone: string): string {
  if (!phone) return "";
  let digits = phone.trim().replace(/\D/g, "");
  if (!digits) return "";

  // Nếu bắt đầu bằng 84 (Việt Nam)
  if (digits.startsWith("84")) {
    // Đã đúng định dạng
  } else if (digits.startsWith("0")) {
    digits = "84" + digits.slice(1);
  } else if (digits.length === 9) {
    digits = "84" + digits;
  }

  return hashSHA256(digits);
}

/**
 * Tách họ và tên tiếng Việt để băm theo chuẩn Meta fn / ln
 */
export function hashName(fullName: string): { fn?: string; ln?: string } {
  if (!fullName) return {};
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) {
    return { fn: hashSHA256(parts[0]) };
  }
  const lastName = parts[0]; // Họ
  const firstName = parts[parts.length - 1]; // Tên chính
  return {
    ln: hashSHA256(lastName),
    fn: hashSHA256(firstName),
  };
}

/**
 * Gửi sự kiện Purchase qua Meta Conversions API (CAPI)
 * Đảm bảo Deduplication (khử trùng lặp) với Meta Pixel qua event_id = order.order_code
 */
export async function sendMetaCapiPurchase(
  order: Order,
  userParams: MetaCapiUserParams = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const pixelId = process.env.META_PIXEL_ID || "1685188589692175";
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn("[Meta CAPI] Thiếu META_CAPI_ACCESS_TOKEN trong biến môi trường.");
      return { success: false, error: "Missing META_CAPI_ACCESS_TOKEN" };
    }

    const eventTime = Math.floor(Date.now() / 1000);
    // ⭐ event_id cực kỳ quan trọng: Bắt buộc trùng khớp 100% với eventID ở Pixel browser
    const eventId = order.order_code;

    const { fn, ln } = hashName(order.customer_name);
    const hashedPhone = hashPhoneNumber(order.customer_phone);

    const userData: Record<string, any> = {
      ph: hashedPhone ? [hashedPhone] : undefined,
      external_id: [hashSHA256(order.order_code)],
    };

    if (fn) userData.fn = [fn];
    if (ln) userData.ln = [ln];

    // Các thông số kỹ thuật không được băm (Plaintext)
    if (userParams.clientIp) {
      userData.client_ip_address = userParams.clientIp;
    }
    if (userParams.userAgent) {
      userData.client_user_agent = userParams.userAgent;
    }
    if (userParams.fbp) {
      userData.fbp = userParams.fbp;
    }
    if (userParams.fbc) {
      userData.fbc = userParams.fbc;
    }

    const payload: Record<string, any> = {
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: eventId, // ⭐ Khử trùng lặp
          event_source_url: userParams.referer || "https://vicuatien.com",
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: "VND",
            value: Number(order.total_price) || 0,
            content_name: order.combo_name || order.product_name,
            content_type: "product",
            order_id: order.order_code,
            num_items: Number(order.combo_id) || 1,
          },
        },
      ],
    };

    // Nếu có mã test sự kiện (từ biến môi trường hoặc params)
    const testCode = userParams.testEventCode || process.env.META_TEST_EVENT_CODE;
    if (testCode) {
      payload.test_event_code = testCode;
    }

    const endpoint = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resJson = await response.json();

    if (!response.ok || resJson.error) {
      console.error("[Meta CAPI Error]", resJson.error || resJson);
      return {
        success: false,
        error: resJson.error?.message || "Lỗi gửi sự kiện Meta CAPI",
        data: resJson,
      };
    }

    console.log(`[Meta CAPI Success] Đã gửi Purchase (event_id: ${eventId}):`, resJson);
    return { success: true, data: resJson };
  } catch (error: any) {
    console.error("[Meta CAPI Exception]", error);
    return { success: false, error: error.message || "Lỗi ngoại lệ CAPI" };
  }
}
