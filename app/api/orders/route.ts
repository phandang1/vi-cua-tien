import { NextRequest, NextResponse } from "next/server";
import { saveOrder, getSiteSettings } from "@/lib/db";
import { sendOrderTelegramAlert } from "@/lib/telegram";
import { sendMetaCapiPurchase } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customer_name = (body.customer_name || body.name || "").trim();
    const customer_phone = (body.customer_phone || body.phone || "").trim();
    const customer_address = (
      body.customer_address ||
      body.address ||
      ""
    ).trim();

    if (!customer_name) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập họ và tên nhận hàng" },
        { status: 400 }
      );
    }
    if (!customer_phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập số điện thoại nhận hàng" },
        { status: 400 }
      );
    }
    if (!customer_address) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập địa chỉ nhận hàng chi tiết" },
        { status: 400 }
      );
    }

    const combo_id = Number(body.combo_id) || 1;
    let combo_name = body.combo_name || "";
    let item_price = Number(body.item_price) || 0;
    let shipping_fee = Number(body.shipping_fee) || 0;
    let total_price = Number(body.total_price) || 0;

    // Chuẩn hóa giá trị combo theo chuẩn nếu chưa truyền đúng
    const comboConfigs: Record<
      number,
      { name: string; price: number; ship: number; total: number }
    > = {
      1: {
        name: "1 Cái Đèn T6 (119K)",
        price: 119000,
        ship: 25000,
        total: 144000,
      },
      2: {
        name: "Combo 2 Cái (199K - Miễn Ship)",
        price: 199000,
        ship: 0,
        total: 199000,
      },
      3: {
        name: "Combo 3 Cái (289K - Miễn Ship + Quà)",
        price: 289000,
        ship: 0,
        total: 289000,
      },
      5: {
        name: "Gói 5 Cái Mỏ Neo Đất",
        price: 170000,
        ship: 20000,
        total: 190000,
      },
      10: {
        name: "Combo 10 Cái Mỏ Neo Đất (Freeship)",
        price: 299000,
        ship: 0,
        total: 299000,
      },
      20: {
        name: "Combo 20 Cái Mỏ Neo Đất (Freeship)",
        price: 499000,
        ship: 0,
        total: 499000,
      },
    };

    if (comboConfigs[combo_id]) {
      const cfg = comboConfigs[combo_id];
      if (!combo_name) combo_name = cfg.name;
      if (!item_price) item_price = cfg.price;
      if (shipping_fee === undefined || shipping_fee === null)
        shipping_fee = cfg.ship;
      if (!total_price) total_price = cfg.total;
    }

    // Phân tích nguồn đơn: Nhận diện Facebook Ads qua fbclid hoặc cookie _fbc
    const fbclid = (body.fbclid || "").trim();
    const fbc = (body.fbc || request.cookies.get("_fbc")?.value || "").trim();
    const isFbAds = Boolean(fbclid || (fbc && fbc.startsWith("fb.")));

    const rawNote = (body.note || "").trim();
    let sourcePrefix = "";
    if (isFbAds) {
      const shortId = fbclid
        ? fbclid.length > 25
          ? `${fbclid.substring(0, 22)}...`
          : fbclid
        : "Có cookie _fbc";
      sourcePrefix = `[Nguồn: 🟢 Facebook Ads | ${shortId}]`;
    } else {
      sourcePrefix = `[Nguồn: ⚠️ Vào trực tiếp (Không có fbclid - Cần gọi chốt)]`;
    }

    const finalNote = rawNote ? `${sourcePrefix} ${rawNote}` : sourcePrefix;

    const order = await saveOrder({
      order_code: body.order_code,
      customer_name,
      customer_phone,
      customer_address,
      combo_id,
      combo_name: combo_name || body.combo_name || "Mỏ Neo Đất NDM-10",
      color: body.color || "Thép Mạ Kẽm",
      product_name:
        body.product_name ||
        (combo_id >= 5
          ? "Mỏ Neo Đất NDM-10 Chịu Tải 450kg"
          : "Đèn Xe Đạp Có Còi Pin Sạc USB LED T6 Chống Nước IP44"),
      item_price,
      shipping_fee,
      total_price,
      status: "pending",
      note: finalNote,
      traffic_source: isFbAds ? "fb_ads" : "direct",
      fbclid: fbclid || (fbc.startsWith("fb.") ? fbc : undefined),
    });

    // 1. Gửi thông báo Telegram (chạy nền, không làm chậm phản hồi của khách hàng)
    getSiteSettings()
      .then((settings) => {
        if (settings && settings.telegram_notify_enabled) {
          return sendOrderTelegramAlert(order, settings);
        }
      })
      .catch((err) => {
        console.warn("Lỗi gửi thông báo Telegram nền:", err);
      });

    // 2. Gửi sự kiện Purchase về Meta Conversions API (CAPI) chạy nền, đảm bảo Deduplication với Pixel
    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    const fbp = body.fbp || request.cookies.get("_fbp")?.value;
    const testEventCode = body.test_event_code || request.headers.get("x-meta-test-code");

    sendMetaCapiPurchase(order, {
      clientIp,
      userAgent,
      fbp,
      fbc,
      referer,
      testEventCode,
    }).catch((err) => {
      console.warn("Lỗi gửi Meta CAPI nền:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công!",
      order,
    });
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý đơn hàng" },
      { status: 500 }
    );
  }
}
