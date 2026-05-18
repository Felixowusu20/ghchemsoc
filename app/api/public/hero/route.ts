import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hrefForMemberCta } from "@/lib/member-login";
import { prisma, prismaReady } from "@/lib/prisma";
import { isDbConnectionError, isPrismaEngineDisconnected } from "@/lib/db-fallback";

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Public read — no auth. Use on marketing site: `GET /api/public/hero` */
export async function GET(_request: NextRequest) {
  if (!(await prismaReady())) {
    return NextResponse.json([]);
  }

  let rows;
  try {
    rows = await prisma.heroSlide.findMany({
      where: { published: true, mediaId: { not: null } },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });
  } catch (error) {
    if (isDbConnectionError(error) || isPrismaEngineDisconnected(error)) {
      return NextResponse.json([]);
    }
    throw error;
  }

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
      cta: { label: r.ctaLabel, href: hrefForMemberCta(r.ctaLabel, r.ctaHref) },
      secondaryCta:
        r.secondaryLabel && r.secondaryHref ? { label: r.secondaryLabel, href: r.secondaryHref } : undefined,
      stat: r.statValue && r.statLabel ? { value: r.statValue, label: r.statLabel } : undefined,
    }));
  return NextResponse.json(mapped);
}
