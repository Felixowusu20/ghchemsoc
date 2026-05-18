import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canRegisterAdmin } from "@/lib/admin-registration";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieSetOptions } from "@/lib/auth-cookie";
import { createAccessToken } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().max(120).optional(),
  registrationSecret: z.string().optional(),
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
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, registrationSecret } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const adminCount = await prisma.adminUser.count();
  const gate = canRegisterAdmin({ adminCount, registrationSecret });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.error }, { status: 403 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists. Try signing in instead." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.adminUser.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name?.trim() || null,
    },
  });

  const token = await createAccessToken({ sub: user.id, email: user.email });
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  res.cookies.set(JWT_COOKIE_NAME, token, jwtCookieSetOptions());
  return res;
}
