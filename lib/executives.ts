import { prisma } from "@/lib/prisma";
import { EXECUTIVE_SEED } from "@/lib/executive-defaults";
import type { Executive, Media } from "@prisma/client";

export type ExecutiveWithMedia = Executive & { media: Media | null };

export async function seedExecutivesIfEmpty(): Promise<void> {
  const count = await prisma.executive.count();
  if (count > 0) return;

  for (const e of EXECUTIVE_SEED) {
    let mediaId: string | null = null;
    if (e.imageUrl) {
      const m = await prisma.media.create({
        data: { url: e.imageUrl, publicId: null, alt: e.imageAlt },
      });
      mediaId = m.id;
    }
    await prisma.executive.create({
      data: {
        sortOrder: e.sortOrder,
        published: e.published,
        name: e.name,
        role: e.role,
        bio: e.bio,
        mediaId,
      },
    });
  }
}

export async function fetchPublishedExecutives(): Promise<ExecutiveWithMedia[]> {
  let rows = await prisma.executive.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
  if (rows.length === 0) {
    await seedExecutivesIfEmpty();
    rows = await prisma.executive.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });
  }
  return rows;
}

export function mapExecutivePublic(row: ExecutiveWithMedia) {
  return {
    id: row.id,
    sortOrder: row.sortOrder,
    published: row.published,
    name: row.name,
    role: row.role,
    bio: row.bio,
    media: row.media ? { url: row.media.url, alt: row.media.alt } : null,
  };
}

export async function fetchPublishedExecutiveById(id: string): Promise<ExecutiveWithMedia | null> {
  const row = await prisma.executive.findFirst({
    where: { id, published: true },
    include: { media: true },
  });
  if (row) return row;

  if ((await prisma.executive.count()) === 0) {
    await seedExecutivesIfEmpty();
    return prisma.executive.findFirst({
      where: { id, published: true },
      include: { media: true },
    });
  }

  return null;
}
