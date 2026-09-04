import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); // ISO date string
    const to = searchParams.get("to");     // ISO date string

    const admin = createAdminClient();
    const now = new Date();

    // Default: today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // If custom range provided
    if (from && to) {
      const fromDate = new Date(from).toISOString();
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      const toDateStr = toDate.toISOString();

      // Total count in range
      const { count: rangeCount } = await admin
        .from("affiliate_clicks")
        .select("*", { count: "exact", head: true })
        .gte("clicked_at", fromDate)
        .lte("clicked_at", toDateStr);

      // Top products in range
      const { data: rawClicks } = await admin
        .from("affiliate_clicks")
        .select("product_id, products(id, title, thumbnail_url, slug)")
        .gte("clicked_at", fromDate)
        .lte("clicked_at", toDateStr);

      const productCounts: Record<string, any> = {};
      rawClicks?.forEach((c: any) => {
        if (c.product_id) {
          if (!productCounts[c.product_id]) {
            productCounts[c.product_id] = {
              title: c.products?.title || "Sản phẩm",
              thumbnail_url: c.products?.thumbnail_url,
              slug: c.products?.slug,
              count: 0,
            };
          }
          productCounts[c.product_id].count++;
        }
      });

      const topProducts = Object.entries(productCounts)
        .map(([product_id, info]: [string, any]) => ({
          product_id,
          title: info.title,
          thumbnail_url: info.thumbnail_url,
          slug: info.slug,
          click_count: info.count,
        }))
        .sort((a, b) => b.click_count - a.click_count)
        .slice(0, 10);

      // Daily breakdown in range
      const { data: dailyRaw } = await admin
        .from("affiliate_clicks")
        .select("clicked_at")
        .gte("clicked_at", fromDate)
        .lte("clicked_at", toDateStr)
        .order("clicked_at", { ascending: true });

      const dailyMap: Record<string, number> = {};
      dailyRaw?.forEach((c: any) => {
        const day = c.clicked_at.substring(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      });
      const dailyBreakdown = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

      return NextResponse.json({
        success: true,
        rangeCount: rangeCount || 0,
        topProducts,
        dailyBreakdown,
      });
    }

    // Default summary (today / 7d / 30d)
    const [todayRes, sevenRes, thirtyRes] = await Promise.all([
      admin.from("affiliate_clicks").select("*", { count: "exact", head: true }).gte("clicked_at", todayStart),
      admin.from("affiliate_clicks").select("*", { count: "exact", head: true }).gte("clicked_at", sevenDaysAgo),
      admin.from("affiliate_clicks").select("*", { count: "exact", head: true }).gte("clicked_at", thirtyDaysAgo),
    ]);

    const { data: rawClicks } = await admin
      .from("affiliate_clicks")
      .select("product_id, products(id, title, thumbnail_url, slug)")
      .gte("clicked_at", thirtyDaysAgo);

    const productCounts: Record<string, any> = {};
    rawClicks?.forEach((c: any) => {
      if (c.product_id) {
        if (!productCounts[c.product_id]) {
          productCounts[c.product_id] = {
            title: c.products?.title || "Sản phẩm",
            thumbnail_url: c.products?.thumbnail_url,
            slug: c.products?.slug,
            count: 0,
          };
        }
        productCounts[c.product_id].count++;
      }
    });

    const topProducts = Object.entries(productCounts)
      .map(([product_id, info]: [string, any]) => ({
        product_id,
        title: info.title,
        thumbnail_url: info.thumbnail_url,
        slug: info.slug,
        click_count: info.count,
      }))
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      totalClicksToday: todayRes.count || 0,
      totalClicks7Days: sevenRes.count || 0,
      totalClicks30Days: thirtyRes.count || 0,
      topProducts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("affiliate_clicks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ dữ liệu click" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
