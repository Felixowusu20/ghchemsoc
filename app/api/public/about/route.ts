import { NextResponse } from "next/server";
import { getPublishedAboutSections } from "@/lib/cms-queries";

export async function GET() {
  const rows = await getPublishedAboutSections();
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      sortOrder: r.sortOrder,
      title: r.title,
      subtitle: r.subtitle,
      body: r.body,
      layout: r.layout,
      imageUrl: r.media?.url ?? null,
      imageAlt: r.media?.alt ?? null,
    }))
  );
}
