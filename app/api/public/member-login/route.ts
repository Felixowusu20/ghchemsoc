import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { memberLoginErrorMessage, memberProfileFromApplication } from "@/lib/member-profile-from-db";
import { normalizeMemberId } from "@/lib/member-profile";

const bodySchema = z.object({
  email: z.string().email(),
  memberId: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid email and member ID." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const memberIdNorm = normalizeMemberId(parsed.data.memberId);

  try {
    const approved = await prisma.membershipApplication.findFirst({
      where: {
        email,
        status: "approved",
        memberId: { not: null },
      },
    });

    if (
      approved?.memberId &&
      normalizeMemberId(approved.memberId) === memberIdNorm
    ) {
      return NextResponse.json({
        ok: true,
        profile: memberProfileFromApplication(approved),
      });
    }

    const byEmail = await prisma.membershipApplication.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    const byId = await prisma.membershipApplication.findFirst({
      where: { memberId: memberIdNorm },
    });

    const hint = byEmail ?? byId;
    return NextResponse.json(
      { ok: false, message: memberLoginErrorMessage(hint, email, parsed.data.memberId) },
      { status: 401 }
    );
  } catch (e) {
    console.error("[member-login]", e);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Could not verify membership right now. If this persists, the database may be unavailable — try again shortly.",
      },
      { status: 503 }
    );
  }
}
