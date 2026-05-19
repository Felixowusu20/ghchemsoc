import { NextResponse } from "next/server";
import { checkMembershipEmailAvailable } from "@/lib/membership-email-check";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const result = await checkMembershipEmailAvailable(email);
  return NextResponse.json(result);
}
