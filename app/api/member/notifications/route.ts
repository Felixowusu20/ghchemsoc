import { NextRequest, NextResponse } from "next/server";
import { assertMember } from "@/lib/member-auth";
import { countUnreadMemberNotifications, getMemberNotificationsForApplication } from "@/lib/member-announcements";

export async function GET(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  const items = await getMemberNotificationsForApplication(auth.application.id);
  const unreadCount = await countUnreadMemberNotifications(auth.application.id);

  return NextResponse.json({ items, unreadCount });
}
