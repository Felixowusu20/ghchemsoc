import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { getCmsAnalytics } from "@/lib/cms-analytics";

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const analytics = await getCmsAnalytics();
  return NextResponse.json(analytics);
}
