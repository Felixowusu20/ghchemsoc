import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertMember } from "@/lib/member-auth";
import { mapMemberLibraryItem, MEMBER_LIBRARY_TYPES, serializeTags } from "@/lib/member-library";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  type: z.enum(MEMBER_LIBRARY_TYPES),
  title: z.string().min(1).max(200),
  body: z.string().max(20000).nullable().optional(),
  url: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  const rows = await prisma.memberLibraryItem.findMany({
    where: { applicationId: auth.application.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ items: rows.map(mapMemberLibraryItem) });
}

export async function POST(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  if (d.type === "link" && !d.url?.trim()) {
    return NextResponse.json({ error: "URL is required for links" }, { status: 400 });
  }
  if (d.type === "note" && !d.body?.trim() && !d.title.trim()) {
    return NextResponse.json({ error: "Note needs a title or body" }, { status: 400 });
  }
  if (d.type === "file") {
    return NextResponse.json(
      { error: "Use POST /api/member/library/upload to add files" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.memberLibraryItem.aggregate({
    where: { applicationId: auth.application.id },
    _max: { sortOrder: true },
  });

  const row = await prisma.memberLibraryItem.create({
    data: {
      applicationId: auth.application.id,
      type: d.type,
      title: d.title.trim(),
      body: d.body?.trim() || null,
      url: d.type === "link" ? d.url?.trim() || null : null,
      tags: serializeTags(d.tags ?? []),
      sortOrder: d.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ item: mapMemberLibraryItem(row) });
}
