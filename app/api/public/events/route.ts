import { NextResponse } from "next/server";
import { getPublishedSocietyEvents } from "@/lib/cms-queries";

export async function GET() {
  const rows = await getPublishedSocietyEvents();
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      featured: r.featured,
      title: r.title,
      excerpt: r.excerpt,
      body: r.body,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate?.toISOString() ?? null,
      timeLabel: r.timeLabel,
      location: r.location,
      href: r.href,
      badge: r.badge,
      sortOrder: r.sortOrder,
      registrationFormFields: r.registrationFormFields,
      imageUrl: r.media?.url ?? null,
      imageAlt: r.media?.alt ?? null,
    }))
  );
}
