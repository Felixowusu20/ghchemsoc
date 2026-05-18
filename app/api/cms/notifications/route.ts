import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { getCmsNotificationCounts } from "@/lib/cms-notifications";

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const { counts, degraded } = await getCmsNotificationCounts();
  const res = NextResponse.json(counts);
  if (degraded) res.headers.set("X-Cms-Notifications-Degraded", "1");
  return res;
}
