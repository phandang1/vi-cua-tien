import { Order, SiteSettings } from "@/types/database";

export interface TelegramSendResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatVND(num: number): string {
  return (num || 0).toLocaleString("vi-VN") + "đ";
}

/**
 * Gửi tin nhắn test tới Telegram để kiểm tra Token và Chat ID
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<TelegramSendResult> {
  const token = (botToken || "").trim();
  const chat = (chatId || "").trim();

  if (!token) {
    return { success: false, error: "Chưa nhập Telegram Bot Token" };
  }
  if (!chat) {
    return { success: false, error: "Chưa nhập Telegram Chat ID" };
  }

  const nowStr = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  const text = `🔔 <b>KIỂM TRA KẾT NỐI TELEGRAM THÀNH CÔNG!</b>
━━━━━━━━━━━━━━━━━━━━
✅ Hệ thống quản lý đơn hàng của bạn đã kết nối thành công với Telegram Bot.
⏰ <b>Thời gian:</b> ${nowStr}
📦 Khi có khách đặt hàng mới trên landing page, thông tin đơn sẽ tự động được gửi về đây ngay lập tức!
━━━━━━━━━━━━━━━━━━━━
👉 <i>Hệ thống Vị Của Tiên / Đèn Xe Đạp</i>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        error: data.description || `Lỗi kết nối Telegram (mã ${res.status})`,
      };
    }

    return {
      success: true,
      message: "Đã gửi tin nhắn thử nghiệm thành công tới Telegram!",
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Không thể kết nối Telegram API: ${err.message}`,
    };
  }
}

/**
 * Tự động gửi thông báo đơn hàng mới về Telegram
 */
export async function sendOrderTelegramAlert(
  order: Order,
  settings: SiteSettings
): Promise<TelegramSendResult> {
  if (!settings.telegram_notify_enabled) {
    return {
      success: false,
      message: "Thông báo Telegram đang tắt trong cài đặt",
    };
  }

  const token = (settings.telegram_bot_token || "").trim();
  const chat = (settings.telegram_chat_id || "").trim();

  if (!token || !chat) {
    return {
      success: false,
      error: "Chưa cấu hình Telegram Bot Token hoặc Chat ID",
    };
  }

  const createdTime = order.created_at
    ? new Date(order.created_at).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      })
    : new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.vicuatien.food";

  const message = `🚨 <b>CÓ ĐƠN HÀNG MỚI!</b> [#${order.order_code}]
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> <b>${escapeHtml(order.customer_name)}</b>
📞 <b>Số điện thoại:</b> <code>${escapeHtml(order.customer_phone)}</code>
📍 <b>Địa chỉ:</b> ${escapeHtml(order.customer_address)}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Gói đặt:</b> <b>${escapeHtml(order.combo_name)}</b>
🎨 <b>Màu sắc:</b> ${escapeHtml(order.color || "Đen Tuyền")}
💵 <b>Tiền hàng:</b> ${formatVND(order.item_price)}
🚚 <b>Phí vận chuyển:</b> ${
    order.shipping_fee > 0 ? formatVND(order.shipping_fee) : "MIỄN PHÍ"
  }
💰 <b>TỔNG THU (COD):</b> <b style="color: #b91c1c;">${formatVND(
    order.total_price
  )}</b>
${order.note ? `📝 <b>Ghi chú:</b> ${escapeHtml(order.note)}\n` : ""}⏰ <b>Thời gian:</b> ${createdTime}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${siteUrl}/quanly/orders">Bấm vào đây để Xem & Quản lý đơn</a>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.warn("Telegram send failed:", data);
      return { success: false, error: data.description };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending order alert to Telegram:", err);
    return { success: false, error: err.message };
  }
}
