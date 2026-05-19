import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertMember } from "@/lib/member-auth";
import { memberProfileFromApplication } from "@/lib/member-profile-from-db";
import { processMembershipPhotoFile } from "@/lib/membership-photo";
import { prisma } from "@/lib/prisma";

const jsonSchema = z
  .object({
    phone: z.string().max(40).nullable().optional(),
    jobTitle: z.string().max(120).nullable().optional(),
    institution: z.string().min(1).max(200).optional(),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  const auth = await assertMember(request);
  if (auth instanceof NextResponse) return auth;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const phone = form.get("phone");
      const jobTitle = form.get("jobTitle");
      const institution = form.get("institution");
      const photo = form.get("photo");

      const data: {
        phone?: string | null;
        jobTitle?: string | null;
        institution?: string;
        photoUrl?: string | null;
        photoPublicId?: string | null;
      } = {};

      if (phone !== null) data.phone = String(phone ?? "").trim() || null;
      if (jobTitle !== null) data.jobTitle = String(jobTitle ?? "").trim() || null;
      if (institution !== null && String(institution).trim()) {
        data.institution = String(institution).trim();
      }

      if (photo instanceof File && photo.size > 0) {
        const uploaded = await processMembershipPhotoFile(photo);
        if (uploaded.photoUrl) {
          data.photoUrl = uploaded.photoUrl;
          data.photoPublicId = uploaded.photoPublicId ?? null;
        }
      }

      const row = await prisma.membershipApplication.update({
        where: { id: auth.application.id },
        data,
      });

      return NextResponse.json({ profile: memberProfileFromApplication(row) });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = jsonSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const row = await prisma.membershipApplication.update({
      where: { id: auth.application.id },
      data: {
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.jobTitle !== undefined ? { jobTitle: d.jobTitle } : {}),
        ...(d.institution !== undefined ? { institution: d.institution } : {}),
      },
    });

    return NextResponse.json({ profile: memberProfileFromApplication(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update profile";
    console.error("[member/profile PATCH]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
