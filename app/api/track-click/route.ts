import { NextRequest, NextResponse } from "next/server";
import { recordAffiliateClick } from "@/lib/db";
import { detectDevice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Ignore clicks if the user is an admin logged in
    const adminSession = request.cookies.get("admin_session")?.value;
    if (adminSession) {
      return NextResponse.json({ success: true, ignored: "admin" });
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ success: false, error: "Missing product_id" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";
    const device = detectDevice(userAgent);

    await recordAffiliateClick(product_id, {
      referrer,
      userAgent,
      device,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Click tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
