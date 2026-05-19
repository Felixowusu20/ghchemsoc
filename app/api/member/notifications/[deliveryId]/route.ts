import { NextRequest, NextResponse } from "next/server";
import { assertMember } from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;
  const { deliveryId } = await params;

  const existing = await prisma.memberAnnouncementDelivery.findFirst({
    where: { id: deliveryId, applicationId: auth.application.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.memberAnnouncementDelivery.update({
    where: { id: deliveryId },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
