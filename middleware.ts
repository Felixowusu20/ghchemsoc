import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieClearOptions } from "@/lib/auth-cookie";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/cms")) {
    return NextResponse.next();
  }

  if (pathname === "/cms/login" || pathname === "/cms/register") {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  try {
    await verifyAccessToken(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/cms/login", request.url));
    res.cookies.set(JWT_COOKIE_NAME, "", jwtCookieClearOptions());
    return res;
  }
}

export const config = {
  matcher: ["/cms", "/cms/:path*"],
};
