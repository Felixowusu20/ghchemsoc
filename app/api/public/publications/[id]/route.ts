import { NextResponse } from "next/server";
import { getPublishedPublicationById } from "@/lib/cms-queries";
import { serializePublication } from "@/lib/publications-serialize";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = await getPublishedPublicationById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializePublication(row));
}
