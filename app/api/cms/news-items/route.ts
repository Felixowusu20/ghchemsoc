import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { NewsItem, Media } from "@prisma/client";

type NewsRow = NewsItem & { media: Media | null };

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSchema = z.object({
  slug: z.string().min(1).max(120).regex(slugRegex),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().nullable().optional(),
  date: z.coerce.date(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().nullable().optional(),
  imageAlt: z.string().optional(),
});

function serialize(r: NewsRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    date: r.date.toISOString(),
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
  const rows = await prisma.newsItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
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

  const clash = await prisma.newsItem.findUnique({ where: { slug: d.slug } });
  if (clash) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const row = await prisma.$transaction(async (tx) => {
    const m = await tx.media.create({
      data: {
        url: d.imageUrl,
        publicId: d.imagePublicId ?? null,
        alt: d.imageAlt ?? null,
      },
    });
    return tx.newsItem.create({
      data: {
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        body: d.body ?? null,
        date: d.date,
        published: d.published ?? false,
        sortOrder: d.sortOrder ?? 0,
        mediaId: m.id,
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serialize(row));
}
