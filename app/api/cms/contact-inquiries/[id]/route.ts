import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  read: z.boolean(),
});

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const row = await prisma.contactInquiry.update({
      where: { id },
      data: { read: parsed.data.read },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
