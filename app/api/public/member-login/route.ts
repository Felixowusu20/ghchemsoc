import { NextResponse } from "next/server";
import { z } from "zod";
import { setMemberSessionCookie } from "@/lib/member-auth";
import { findApprovedMembershipForLogin } from "@/lib/member-login-lookup";
import { memberLoginErrorMessage, memberProfileFromApplication } from "@/lib/member-profile-from-db";
import { normalizeMembershipEmail } from "@/lib/member-email";

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

  const email = normalizeMembershipEmail(parsed.data.email);

  try {
    const result = await findApprovedMembershipForLogin(email, parsed.data.memberId);

    if (result.ok) {
      const profile = memberProfileFromApplication(result.application);
      const response = NextResponse.json({ ok: true, profile });
      await setMemberSessionCookie(response, result.application);
      return response;
    }

    return NextResponse.json(
      {
        ok: false,
        message: memberLoginErrorMessage(result.hint, email, parsed.data.memberId),
      },
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
