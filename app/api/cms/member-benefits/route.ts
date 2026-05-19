import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import { getMemberPortalForCms } from "@/lib/member-portal-queries";
import { mapMemberBenefitRow, MEMBER_BENEFIT_ICON_OPTIONS } from "@/lib/member-portal";
import { prisma } from "@/lib/prisma";

const sectionSchema = z.enum(["dashboard", "benefits", "resources"]);

const bodySchema = z.object({
  section: sectionSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  iconKey: z.string().min(1),
  hint: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  try {
    const data = await getMemberPortalForCms();
    return NextResponse.json({
      benefits: data.benefits,
      iconOptions: MEMBER_BENEFIT_ICON_OPTIONS,
      meta: data.meta,
    });
  } catch (error) {
    console.error("[cms/member-benefits GET]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "load benefits") }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const maxOrder = await prisma.memberBenefit.aggregate({
      where: { section: d.section },
      _max: { sortOrder: true },
    });

    const row = await prisma.memberBenefit.create({
      data: {
        section: d.section,
        title: d.title,
        description: d.description,
        body: d.body?.trim() ? d.body.trim() : null,
        href: d.href?.trim() ? d.href.trim() : null,
        iconKey: d.iconKey,
        hint: d.hint?.trim() ? d.hint.trim() : null,
        sortOrder: d.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
        published: d.published ?? true,
      },
    });

    return NextResponse.json({
      benefit: { ...mapMemberBenefitRow(row), published: row.published, sortOrder: row.sortOrder },
    });
  } catch (error) {
    console.error("[cms/member-benefits POST]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "add benefit") }, { status: 500 });
  }
}
