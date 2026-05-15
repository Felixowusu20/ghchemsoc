import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryAsset } from "@/lib/cloudinary-server";
import type { Publication, Media } from "@prisma/client";

type PubRow = Publication & { media: Media | null };

const patchSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    meta: z.string().nullable().optional(),
    issue: z.string().nullable().optional(),
    href: z.string().nullable().optional(),
    published: z.boolean().optional(),
    sortOrder: z.number().optional(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().nullable().optional(),
    imageAlt: z.string().optional(),
  })
  .strict();

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

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const existing = await prisma.publication.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = await prisma.$transaction(async (tx) => {
    if (d.imageUrl !== undefined || d.imagePublicId !== undefined || d.imageAlt !== undefined) {
      if (existing.mediaId) {
        await tx.media.update({
          where: { id: existing.mediaId },
          data: {
            ...(d.imageUrl !== undefined ? { url: d.imageUrl } : {}),
            ...(d.imagePublicId !== undefined ? { publicId: d.imagePublicId } : {}),
            ...(d.imageAlt !== undefined ? { alt: d.imageAlt } : {}),
          },
        });
      } else if (d.imageUrl !== undefined) {
        const m = await tx.media.create({
          data: {
            url: d.imageUrl,
            publicId: d.imagePublicId ?? null,
            alt: d.imageAlt ?? null,
          },
        });
        await tx.publication.update({ where: { id }, data: { mediaId: m.id } });
      }
    }

    return tx.publication.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.meta !== undefined ? { meta: d.meta } : {}),
        ...(d.issue !== undefined ? { issue: d.issue } : {}),
        ...(d.href !== undefined ? { href: d.href } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serialize(row));
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  const existing = await prisma.publication.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mediaId = existing.mediaId;
  const publicId = existing.media?.publicId;
  if (publicId) {
    try {
      await deleteCloudinaryAsset(publicId);
    } catch {
      /* ignore */
    }
  }
  await prisma.publication.delete({ where: { id } });
  if (mediaId) {
    try {
      await prisma.media.delete({ where: { id: mediaId } });
    } catch {
      /* ignore */
    }
  }
  return NextResponse.json({ ok: true });
}
