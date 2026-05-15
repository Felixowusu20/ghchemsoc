import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "1";

  const rows = await prisma.contactInquiry.findMany({
    where: unreadOnly ? { read: false } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(rows);
}
