import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertMember } from "@/lib/member-auth";
import { deleteMemberLibraryCloudinaryFile } from "@/lib/member-library-files";
import { mapMemberLibraryItem, serializeTags } from "@/lib/member-library";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().max(20000).nullable().optional(),
    url: z.string().max(2000).nullable().optional(),
    tags: z.array(z.string().max(40)).max(12).optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.memberLibraryItem.findFirst({
    where: { id, applicationId: auth.application.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const d = parsed.data;
  const row = await prisma.memberLibraryItem.update({
    where: { id },
    data: {
      ...(d.title !== undefined ? { title: d.title.trim() } : {}),
      ...(d.body !== undefined ? { body: d.body?.trim() || null } : {}),
      ...(d.url !== undefined && existing.type === "link" ? { url: d.url?.trim() || null } : {}),
      ...(d.tags !== undefined ? { tags: serializeTags(d.tags) } : {}),
      ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    },
  });

  return NextResponse.json({ item: mapMemberLibraryItem(row) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await prisma.memberLibraryItem.findFirst({
    where: { id, applicationId: auth.application.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.type === "file" && existing.filePublicId) {
    try {
      await deleteMemberLibraryCloudinaryFile(existing.filePublicId, existing.fileMime);
    } catch (e) {
      console.error("[member/library DELETE] cloudinary", e);
    }
  }

  await prisma.memberLibraryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
