import { NextRequest, NextResponse } from "next/server";
import { saveProduct, deleteProduct } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Use admin client (service role key) to bypass RLS and avoid fallback mode
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("products")
        .select("*, category:categories(*)")
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false, nullsFirst: false });

      if (!error) {
        return NextResponse.json({ success: true, data: data || [], source: "supabase" });
      }
      console.error("Supabase admin query error:", error);
    }

    // If admin client not available, return error instead of mock data
    return NextResponse.json(
      { success: false, error: "Không thể kết nối Supabase. Kiểm tra env vars SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.affiliate_url || !body.category_id) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ tiêu đề, link affiliate và danh mục" },
        { status: 400 }
      );
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const saved = await saveProduct({
      ...body,
      slug,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID sản phẩm" }, { status: 400 });
    }

    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
