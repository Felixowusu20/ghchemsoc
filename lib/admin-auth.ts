import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, type JwtPayload } from "@/lib/jwt";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";

export async function getSessionFromRequest(request: NextRequest): Promise<JwtPayload | null> {
  const cookieToken = request.cookies.get(JWT_COOKIE_NAME)?.value;
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const token = cookieToken ?? bearer;
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

/** Returns 401 JSON if the request is not authenticated as an admin. */
export async function assertAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
