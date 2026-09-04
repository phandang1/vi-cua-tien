import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/quanly/login", url.origin));
}
