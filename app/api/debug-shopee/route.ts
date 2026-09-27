import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = "https://shopee.vn/product/289681578/50913916552";
  const results: any = {};

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9",
      },
    });

    results.facebookbot = {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      snippet: (await res.text()).substring(0, 500),
    };
  } catch (e: any) {
    results.facebookbot_error = e.message;
  }

  // Also test microlink
  try {
    const mRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    results.microlink = await mRes.json();
  } catch (e: any) {
    results.microlink_error = e.message;
  }

  return NextResponse.json(results);
}
