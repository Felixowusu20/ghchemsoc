import { NextRequest, NextResponse } from "next/server";
import { assertMember } from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  await prisma.memberAnnouncementDelivery.updateMany({
    where: {
      applicationId: auth.application.id,
      readAt: null,
      announcement: { sentAt: { not: null } },
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
