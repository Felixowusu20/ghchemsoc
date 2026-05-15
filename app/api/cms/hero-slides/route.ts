import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const slideSchema = z.object({
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
  imagePublicId: z.string().nullable().optional(),
  imageUrl: z.string().url(),
  imageAlt: z.string().min(1),
  eyebrow: z.string().min(1),
  headlineLine1: z.string().min(1),
  headlineLine2: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  secondaryLabel: z.string().nullable().optional(),
  secondaryHref: z.string().nullable().optional(),
  statValue: z.string().nullable().optional(),
  statLabel: z.string().nullable().optional(),
});

/** CMS admin list shape (flattened media + JSON fields). */
function serializeSlide(r: {
  id: string;
  sortOrder: number;
  published: boolean;
  mediaId: string | null;
  imageAlt: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  tags: unknown;
  highlights: unknown;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string | null;
  secondaryHref: string | null;
  statValue: string | null;
  statLabel: string | null;
  media: { url: string; publicId: string | null } | null;
}) {
  const tags = Array.isArray(r.tags) ? r.tags.filter((x): x is string => typeof x === "string") : [];
  const highlights = Array.isArray(r.highlights)
    ? r.highlights.filter((x): x is string => typeof x === "string")
    : [];
  return {
    id: r.id,
    sortOrder: r.sortOrder,
    published: r.published,
    mediaId: r.mediaId,
    imageUrl: r.media?.url ?? "",
    imagePublicId: r.media?.publicId ?? null,
    imageAlt: r.imageAlt,
    eyebrow: r.eyebrow,
    headlineLine1: r.headlineLine1,
    headlineLine2: r.headlineLine2,
    description: r.description,
    tagsJson: JSON.stringify(tags),
    highlightsJson: JSON.stringify(highlights),
    ctaLabel: r.ctaLabel,
    ctaHref: r.ctaHref,
    secondaryLabel: r.secondaryLabel,
    secondaryHref: r.secondaryHref,
    statValue: r.statValue,
    statLabel: r.statLabel,
  };
}

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("admin") === "1";
  const rows = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });

  if (admin) {
    const denied = await assertAdmin(request);
    if (denied) return denied;
    return NextResponse.json(rows.map(serializeSlide));
  }

  const published = rows.filter((r) => r.published && r.media);
  return NextResponse.json(published.map(serializeSlide));
}

export async function POST(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const json = await request.json();
  const parsed = slideSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const row = await prisma.$transaction(async (tx) => {
    const media = await tx.media.create({
      data: {
        url: d.imageUrl,
        publicId: d.imagePublicId ?? null,
        alt: d.imageAlt,
      },
    });
    return tx.heroSlide.create({
      data: {
        sortOrder: d.sortOrder ?? 0,
        published: d.published ?? true,
        mediaId: media.id,
        imageAlt: d.imageAlt,
        eyebrow: d.eyebrow,
        headlineLine1: d.headlineLine1,
        headlineLine2: d.headlineLine2,
        description: d.description,
        tags: d.tags,
        highlights: d.highlights,
        ctaLabel: d.ctaLabel,
        ctaHref: d.ctaHref,
        secondaryLabel: d.secondaryLabel ?? null,
        secondaryHref: d.secondaryHref ?? null,
        statValue: d.statValue ?? null,
        statLabel: d.statLabel ?? null,
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serializeSlide(row));
}
