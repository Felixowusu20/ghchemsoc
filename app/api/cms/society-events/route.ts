import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { SocietyEvent, Media } from "@prisma/client";

type Row = SocietyEvent & { media: Media | null };

const createSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  timeLabel: z.string().min(1),
  location: z.string().min(1),
  href: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().nullable().optional(),
  imageAlt: z.string().optional(),
});

function serialize(r: Row) {
  return {
    id: r.id,
    title: r.title,
    excerpt: r.excerpt,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate?.toISOString() ?? null,
    timeLabel: r.timeLabel,
    location: r.location,
    href: r.href,
    badge: r.badge,
    featured: r.featured,
    published: r.published,
    sortOrder: r.sortOrder,
    mediaId: r.mediaId,
    imageUrl: r.media?.url ?? "",
    imagePublicId: r.media?.publicId ?? null,
    imageAlt: r.media?.alt ?? "",
  };
}

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const rows = await prisma.societyEvent.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { startDate: "asc" }],
    include: { media: true },
  });
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const row = await prisma.$transaction(async (tx) => {
    const m = await tx.media.create({
      data: {
        url: d.imageUrl,
        publicId: d.imagePublicId ?? null,
        alt: d.imageAlt ?? null,
      },
    });
    return tx.societyEvent.create({
      data: {
        title: d.title,
        excerpt: d.excerpt,
        startDate: d.startDate,
        endDate: d.endDate ?? null,
        timeLabel: d.timeLabel,
        location: d.location,
        href: d.href ?? null,
        badge: d.badge ?? null,
        featured: d.featured ?? false,
        published: d.published ?? true,
        sortOrder: d.sortOrder ?? 0,
        mediaId: m.id,
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serialize(row));
}
