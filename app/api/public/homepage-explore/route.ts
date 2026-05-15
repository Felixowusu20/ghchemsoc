import { NextResponse } from "next/server";
import { getHomepageExploreForPublic } from "@/lib/cms-queries";

export async function GET() {
  const data = await getHomepageExploreForPublic();
  return NextResponse.json(data);
}
