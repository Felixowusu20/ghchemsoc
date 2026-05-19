import { NextRequest } from "next/server";
import { loadMemberProfileForRequest } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  return loadMemberProfileForRequest(request);
}
