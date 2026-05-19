import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { appBaseUrl } from "@/lib/app-url";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import { mapAnnouncement, sendAnnouncementToApprovedMembers } from "@/lib/member-announcements";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  try {
    const result = await sendAnnouncementToApprovedMembers(id, appBaseUrl(request));
    const row = await prisma.memberAnnouncement.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      announcement: mapAnnouncement(row),
      send: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : prismaCmsErrorMessage(error, "send announcement");
    console.error("[cms/member-announcements send]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
