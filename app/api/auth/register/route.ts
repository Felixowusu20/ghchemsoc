import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createAccessToken } from "@/lib/jwt";
import { JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { jwtCookieSetOptions } from "@/lib/auth-cookie";

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

  const count = await prisma.adminUser.count();
  const isFirst = count === 0;
  const envSecret = process.env.ADMIN_REGISTRATION_SECRET;

  if (!isFirst) {
    if (!envSecret || registrationSecret !== envSecret) {
      return NextResponse.json(
        { error: "Registration is closed. Provide a valid registration secret or contact the site owner." },
        { status: 403 }
      );
    }
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
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
