import { NextRequest, NextResponse } from "next/server";
import { testTelegramConnection } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bot_token, chat_id } = body;

    if (!bot_token || !bot_token.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Telegram Bot Token" },
        { status: 400 }
      );
    }

    if (!chat_id || !chat_id.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Telegram Chat ID" },
        { status: 400 }
      );
    }

    const result = await testTelegramConnection(bot_token, chat_id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gửi tin nhắn thử thất bại" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Đã gửi tin nhắn test thành công!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi gửi tin nhắn Telegram" },
      { status: 500 }
    );
  }
}
