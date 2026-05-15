import { NextResponse } from "next/server";
import { getPublishedPublications } from "@/lib/cms-queries";

export async function GET() {
  const rows = await getPublishedPublications();
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      meta: r.meta,
      description: r.description,
      issue: r.issue,
      href: r.href,
      sortOrder: r.sortOrder,
      imageUrl: r.media?.url ?? null,
      imageAlt: r.media?.alt ?? null,
    }))
  );
}
