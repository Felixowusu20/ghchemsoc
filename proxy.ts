import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieClearOptions } from "@/lib/auth-cookie";

const ANALYTICS_SKIP_PREFIXES = ["/api", "/_next", "/cms", "/icon", "/apple-icon"];

function shouldTrackPageView(pathname: string) {
  if (ANALYTICS_SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  if (pathname.includes(".")) return false;
  return true;
}

async function visitorKeyFromRequest(request: NextRequest): Promise<string> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const ua = request.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function logPageView(request: NextRequest, visitorKey: string) {
  const url = new URL("/api/public/site-view", request.url);
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      path: request.nextUrl.pathname,
      visitorKey,
    }),
  }).catch(() => undefined);
}

async function handleCmsAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cms")) {
    return handleCmsAuth(request);
  }

  if (shouldTrackPageView(pathname)) {
    const visitorKey = await visitorKeyFromRequest(request);
    void logPageView(request, visitorKey);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/cms", "/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)"],
};
