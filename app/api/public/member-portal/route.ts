import { NextResponse } from "next/server";
import { getMemberPortalForPublic } from "@/lib/member-portal-queries";

export async function GET() {
  const data = await getMemberPortalForPublic();
  return NextResponse.json(data);
}
