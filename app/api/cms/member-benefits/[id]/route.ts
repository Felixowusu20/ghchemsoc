import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import { mapMemberBenefitRow } from "@/lib/member-portal";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    section: z.enum(["dashboard", "benefits", "resources"]).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    body: z.string().nullable().optional(),
    href: z.string().nullable().optional(),
    iconKey: z.string().min(1).optional(),
    hint: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
  })
  .strict();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const existing = await prisma.memberBenefit.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const row = await prisma.memberBenefit.update({
      where: { id },
      data: {
        ...(d.section !== undefined ? { section: d.section } : {}),
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.body !== undefined ? { body: d.body?.trim() ? d.body.trim() : null } : {}),
        ...(d.href !== undefined ? { href: d.href?.trim() ? d.href.trim() : null } : {}),
        ...(d.iconKey !== undefined ? { iconKey: d.iconKey } : {}),
        ...(d.hint !== undefined ? { hint: d.hint?.trim() ? d.hint.trim() : null } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
      },
    });

    return NextResponse.json({
      benefit: { ...mapMemberBenefitRow(row), published: row.published, sortOrder: row.sortOrder },
    });
  } catch (error) {
    console.error("[cms/member-benefits PATCH]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "update benefit") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  try {
    const existing = await prisma.memberBenefit.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.memberBenefit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[cms/member-benefits DELETE]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "delete benefit") }, { status: 500 });
  }
}
