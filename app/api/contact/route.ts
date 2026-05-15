import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().min(10).max(8000),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const trap = typeof raw.companyWebsite === "string" ? raw.companyWebsite : "";
  if (trap.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  await prisma.contactInquiry.create({
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || null,
      message: d.message,
    },
  });

  return NextResponse.json({ ok: true });
}
