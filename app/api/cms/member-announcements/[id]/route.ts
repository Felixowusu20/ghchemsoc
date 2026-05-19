import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import {
  mapAnnouncement,
  plainTextToHtml,
  stringifyResourceLinks,
} from "@/lib/member-announcements";
import { prisma } from "@/lib/prisma";

const resourceLinkSchema = z.object({
  label: z.string().min(1).max(200),
  url: z.string().url().max(500),
  kind: z.enum(["conference", "video", "summary", "document", "link"]).optional(),
});

const patchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(200).optional(),
    preview: z.string().min(1).max(500).optional(),
    bodyText: z.string().min(1).max(50000).optional(),
    bodyHtml: z.string().optional(),
    publicHref: z.string().url().nullable().optional(),
    goLiveAt: z.string().datetime().nullable().optional(),
    resourceLinks: z.array(resourceLinkSchema).max(20).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
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

  const existing = await prisma.memberAnnouncement.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const d = parsed.data;
  // Recompute bodyHtml when bodyText changes (unless caller provided a custom bodyHtml).
  const nextBodyText = d.bodyText?.trim() ?? existing.bodyText;
  const nextBodyHtml =
    d.bodyHtml?.trim() ||
    (d.bodyText !== undefined ? plainTextToHtml(nextBodyText) : existing.bodyHtml);

  const dataToUpdate: Record<string, unknown> = {};
  if (d.title !== undefined) dataToUpdate.title = d.title.trim();
  if (d.subject !== undefined) dataToUpdate.subject = d.subject.trim();
  if (d.preview !== undefined) dataToUpdate.preview = d.preview.trim();
  if (d.bodyText !== undefined) {
    dataToUpdate.bodyText = nextBodyText;
    dataToUpdate.bodyHtml = nextBodyHtml;
  } else if (d.bodyHtml !== undefined) {
    dataToUpdate.bodyHtml = nextBodyHtml;
  }
  if (d.publicHref !== undefined) {
    dataToUpdate.publicHref = d.publicHref?.trim() || null;
  }
  if (d.goLiveAt !== undefined) {
    dataToUpdate.goLiveAt = d.goLiveAt ? new Date(d.goLiveAt) : null;
  }
  if (d.resourceLinks !== undefined) {
    dataToUpdate.resourceLinks = stringifyResourceLinks(d.resourceLinks);
  }

  try {
    const row = await prisma.memberAnnouncement.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json({ announcement: mapAnnouncement(row) });
  } catch (error) {
    console.error("[cms/member-announcements PATCH]", error);
    return NextResponse.json(
      { error: prismaCmsErrorMessage(error, "update announcement") },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { id } = await params;

  try {
    await prisma.memberAnnouncement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[cms/member-announcements DELETE]", error);
    return NextResponse.json(
      { error: prismaCmsErrorMessage(error, "delete announcement") },
      { status: 500 }
    );
  }
}
