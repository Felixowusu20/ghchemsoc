import { NextResponse } from "next/server";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieClearOptions } from "@/lib/auth-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(JWT_COOKIE_NAME, "", jwtCookieClearOptions());
  return res;
}
