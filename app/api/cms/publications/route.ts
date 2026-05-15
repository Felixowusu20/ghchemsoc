import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Publication, Media } from "@prisma/client";

type PubRow = Publication & { media: Media | null };

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  meta: z.string().nullable().optional(),
  issue: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().nullable().optional(),
  imageAlt: z.string().optional(),
});

function serialize(r: PubRow) {
  return {
    id: r.id,
    title: r.title,
    meta: r.meta,
    description: r.description,
    issue: r.issue,
    href: r.href,
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
  const rows = await prisma.publication.findMany({
    orderBy: { sortOrder: "asc" },
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
    return tx.publication.create({
      data: {
        title: d.title,
        description: d.description,
        meta: d.meta ?? null,
        issue: d.issue ?? null,
        href: d.href ?? null,
        published: d.published ?? true,
        sortOrder: d.sortOrder ?? 0,
        mediaId: m.id,
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serialize(row));
}
