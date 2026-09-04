import { NextRequest, NextResponse } from "next/server";
import { ShopeeMetadataService } from "@/lib/shopee";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp link sản phẩm Shopee hợp lệ" },
        { status: 400 }
      );
    }

    const result = await ShopeeMetadataService.fetchMetadata(url);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Lỗi xử lý yêu cầu",
      },
      { status: 500 }
    );
  }
}
