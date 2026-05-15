import { NextResponse } from "next/server";
import { getPublishedNewsItems } from "@/lib/cms-queries";

export async function GET() {
  const rows = await getPublishedNewsItems();
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      body: r.body,
      date: r.date.toISOString(),
      sortOrder: r.sortOrder,
      imageUrl: r.media?.url ?? null,
      imageAlt: r.media?.alt ?? null,
    }))
  );
}
