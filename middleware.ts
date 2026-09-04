import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /quanly routes (except /quanly/login)
  if (pathname.startsWith("/quanly") && pathname !== "/quanly/login") {
    const session = request.cookies.get("admin_session");

    if (!session || session.value !== "authenticated") {
      const loginUrl = new URL("/quanly/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin to /quanly
  if (pathname.startsWith("/admin")) {
    const redirectUrl = new URL(pathname.replace(/^\/admin/, "/quanly"), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect mutating /api/admin routes
  if (pathname.startsWith("/api/admin")) {
    if (request.method !== "GET") {
      const session = request.cookies.get("admin_session");
      if (!session || session.value !== "authenticated") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quanly/:path*", "/admin/:path*", "/api/admin/:path*"],
};
