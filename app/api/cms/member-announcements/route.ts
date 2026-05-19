import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import { mapAnnouncement, plainTextToHtml } from "@/lib/member-announcements";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  preview: z.string().min(1).max(500),
  bodyText: z.string().min(1).max(50000),
  bodyHtml: z.string().optional(),
  publicHref: z.string().url().nullable().optional(),
  goLiveAt: z.string().datetime().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  try {
    const rows = await prisma.memberAnnouncement.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
    });
    const approvedCount = await prisma.membershipApplication.count({
      where: { status: "approved", memberId: { not: null } },
    });
    return NextResponse.json({
      announcements: rows.map(mapAnnouncement),
      approvedMemberCount: approvedCount,
    });
  } catch (error) {
    console.error("[cms/member-announcements GET]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "load announcements") }, { status: 500 });
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
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const bodyHtml = d.bodyHtml?.trim() || plainTextToHtml(d.bodyText);

  try {
    const row = await prisma.memberAnnouncement.create({
      data: {
        title: d.title.trim(),
        subject: d.subject.trim(),
        preview: d.preview.trim(),
        bodyText: d.bodyText.trim(),
        bodyHtml,
        publicHref: d.publicHref?.trim() || null,
        goLiveAt: d.goLiveAt ? new Date(d.goLiveAt) : null,
      },
    });
    return NextResponse.json({ announcement: mapAnnouncement(row) });
  } catch (error) {
    console.error("[cms/member-announcements POST]", error);
    return NextResponse.json({ error: prismaCmsErrorMessage(error, "save announcement") }, { status: 500 });
  }
}
