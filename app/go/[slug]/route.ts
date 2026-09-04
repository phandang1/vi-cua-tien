import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, recordAffiliateClick } from "@/lib/db";
import { detectDevice } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const product = await getProductBySlug(slug);

  if (!product || !product.affiliate_url) {
    // If not found, redirect to homepage
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if this is a prefetch request from Next.js or browser
  const isPrefetch =
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch" ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree");

  // Check if this is an admin session (admin testing links shouldn't count as customer clicks)
  const isAdmin = !!request.cookies.get("admin_session")?.value;

  // Only track legitimate user clicks
  if (!isPrefetch && !isAdmin && request.method === "GET") {
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";
    const device = detectDevice(userAgent);

    try {
      await recordAffiliateClick(product.id, {
        referrer,
        userAgent,
        device,
      });
    } catch (err) {
      console.error("Failed to record affiliate click:", err);
    }
  }

  // Validate URL to prevent open redirect vulnerabilities
  let targetUrl = product.affiliate_url.trim();
  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(targetUrl, 307);
}
