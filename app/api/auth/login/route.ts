import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createAccessToken } from "@/lib/jwt";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieSetOptions } from "@/lib/auth-cookie";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.adminUser.findUnique({ where: { email } });
  const ok = user && (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createAccessToken({ sub: user!.id, email: user!.email });
  const res = NextResponse.json({
    user: { id: user!.id, email: user!.email, name: user!.name },
  });
  res.cookies.set(JWT_COOKIE_NAME, token, jwtCookieSetOptions());
  return res;
}
