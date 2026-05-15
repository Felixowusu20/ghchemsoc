import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Public read — no auth. Use on marketing site: `GET /api/public/hero` */
export async function GET(_request: NextRequest) {
  const rows = await prisma.heroSlide.findMany({
    where: { published: true, mediaId: { not: null } },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
  const mapped = rows
    .filter((r) => r.media)
    .map((r) => ({
      id: r.id,
      imageUrl: r.media!.url,
      imageAlt: r.imageAlt,
      eyebrow: r.eyebrow,
      headline: [r.headlineLine1, r.headlineLine2] as const,
      description: r.description,
      tags: asStringArray(r.tags),
      highlights: asStringArray(r.highlights),
      cta: { label: r.ctaLabel, href: r.ctaHref },
      secondaryCta:
        r.secondaryLabel && r.secondaryHref ? { label: r.secondaryLabel, href: r.secondaryHref } : undefined,
      stat: r.statValue && r.statLabel ? { value: r.statValue, label: r.statLabel } : undefined,
    }));
  return NextResponse.json(mapped);
}
