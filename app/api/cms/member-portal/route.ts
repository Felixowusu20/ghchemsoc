import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import { getMemberPortalForCms } from "@/lib/member-portal-queries";
import {
  MEMBER_BENEFIT_ICON_OPTIONS,
  MEMBER_PORTAL_ID,
  mapMemberPortalSettings,
  memberPortalCreateData,
} from "@/lib/member-portal";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    dashboardEyebrow: z.string().min(1).optional(),
    dashboardTitle: z.string().min(1).optional(),
    dashboardLead: z.string().min(1).optional(),
    benefitsTitle: z.string().min(1).optional(),
    benefitsLead: z.string().min(1).optional(),
    resourcesTitle: z.string().min(1).optional(),
    resourcesLead: z.string().min(1).optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  try {
    const data = await getMemberPortalForCms();
    return NextResponse.json({ ...data, iconOptions: MEMBER_BENEFIT_ICON_OPTIONS });
  } catch (error) {
    console.error("[cms/member-portal GET]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "load member portal") }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

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
    let existing = await prisma.memberPortalSettings.findUnique({ where: { id: MEMBER_PORTAL_ID } });
    if (!existing) {
      existing = await prisma.memberPortalSettings.create({ data: memberPortalCreateData() });
    }

    const row = await prisma.memberPortalSettings.update({
      where: { id: MEMBER_PORTAL_ID },
      data: {
        ...(d.dashboardEyebrow !== undefined ? { dashboardEyebrow: d.dashboardEyebrow } : {}),
        ...(d.dashboardTitle !== undefined ? { dashboardTitle: d.dashboardTitle } : {}),
        ...(d.dashboardLead !== undefined ? { dashboardLead: d.dashboardLead } : {}),
        ...(d.benefitsTitle !== undefined ? { benefitsTitle: d.benefitsTitle } : {}),
        ...(d.benefitsLead !== undefined ? { benefitsLead: d.benefitsLead } : {}),
        ...(d.resourcesTitle !== undefined ? { resourcesTitle: d.resourcesTitle } : {}),
        ...(d.resourcesLead !== undefined ? { resourcesLead: d.resourcesLead } : {}),
      },
    });

    const data = await getMemberPortalForCms();
    return NextResponse.json({ settings: mapMemberPortalSettings(row), benefits: data.benefits, meta: data.meta });
  } catch (error) {
    console.error("[cms/member-portal PATCH]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "save member portal copy") }, { status: 500 });
  }
}
