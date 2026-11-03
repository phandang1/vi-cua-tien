import { NextRequest, NextResponse } from "next/server";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderAnalyticsSummary,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const [orders, stats] = await Promise.all([
      getOrders({ status, search }),
      getOrderAnalyticsSummary(),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
    });
  } catch (error: any) {
    console.error("Admin get orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tải danh sách đơn hàng" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID hoặc trạng thái đơn hàng" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Trạng thái đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đơn hàng cần cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
    });
  } catch (error: any) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật trạng thái đơn" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID đơn hàng cần xóa" },
        { status: 400 }
      );
    }

    await deleteOrder(id);
    return NextResponse.json({
      success: true,
      message: "Đã xóa đơn hàng thành công!",
    });
  } catch (error: any) {
    console.error("Admin delete order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa đơn hàng" },
      { status: 500 }
    );
  }
}
