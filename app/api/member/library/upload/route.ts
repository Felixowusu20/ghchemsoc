import { NextRequest, NextResponse } from "next/server";
import { assertMember } from "@/lib/member-auth";
import { mapMemberLibraryItem, serializeTags } from "@/lib/member-library";
import { uploadMemberLibraryFileFromForm } from "@/lib/member-library-files";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    const tagsRaw = String(form.get("tags") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Expected file field" }, { status: 400 });
    }

    const upload = await uploadMemberLibraryFileFromForm(file);
    const displayTitle = title || file.name.replace(/\.[^.]+$/, "") || "Uploaded file";

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const maxOrder = await prisma.memberLibraryItem.aggregate({
      where: { applicationId: auth.application.id },
      _max: { sortOrder: true },
    });

    const row = await prisma.memberLibraryItem.create({
      data: {
        applicationId: auth.application.id,
        type: "file",
        title: displayTitle.slice(0, 200),
        body: body || null,
        url: upload.url,
        filePublicId: upload.filePublicId,
        fileMime: upload.fileMime,
        fileBytes: upload.fileBytes,
        tags: serializeTags(tags),
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ item: mapMemberLibraryItem(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[member/library/upload]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
