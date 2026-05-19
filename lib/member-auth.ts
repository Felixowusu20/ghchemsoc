import { NextRequest, NextResponse } from "next/server";
import type { MembershipApplication } from "@prisma/client";
import { MEMBER_JWT_COOKIE_NAME } from "@/lib/auth-constants";
import { createMemberAccessToken, verifyMemberAccessToken, type MemberJwtPayload } from "@/lib/jwt";
import { emailsMatch, normalizeMembershipEmail } from "@/lib/member-email";
import { memberProfileFromApplication } from "@/lib/member-profile-from-db";
import { normalizeMemberId } from "@/lib/member-profile";
import { prisma } from "@/lib/prisma";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export async function getMemberSessionFromRequest(request: NextRequest): Promise<MemberJwtPayload | null> {
  const token = request.cookies.get(MEMBER_JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyMemberAccessToken(token);
  } catch {
    return null;
  }
}

export function memberSessionCookieOptions(maxAgeSec = COOKIE_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export async function setMemberSessionCookie(
  response: NextResponse,
  application: Pick<MembershipApplication, "id" | "email" | "memberId">
) {
  if (!application.memberId) return;
  const token = await createMemberAccessToken({
    applicationId: application.id,
    email: normalizeMembershipEmail(application.email),
    memberId: normalizeMemberId(application.memberId),
  });
  response.cookies.set(MEMBER_JWT_COOKIE_NAME, token, memberSessionCookieOptions());
}

export function clearMemberSessionCookie(response: NextResponse) {
  response.cookies.set(MEMBER_JWT_COOKIE_NAME, "", { ...memberSessionCookieOptions(0), maxAge: 0 });
}

export async function getApprovedApplicationForSession(
  session: MemberJwtPayload
): Promise<MembershipApplication | null> {
  const row = await prisma.membershipApplication.findUnique({
    where: { id: session.sub },
  });
  if (!row || row.status !== "approved" || !row.memberId) return null;
  if (normalizeMemberId(row.memberId) !== normalizeMemberId(session.memberId)) return null;
  if (!emailsMatch(row.email, session.email)) return null;
  return row;
}

export async function assertMember(request: NextRequest): Promise<
  | { session: MemberJwtPayload; application: MembershipApplication }
  | NextResponse
> {
  const session = await getMemberSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const application = await getApprovedApplicationForSession(session);
  if (!application) {
    return NextResponse.json({ error: "Membership session expired or invalid" }, { status: 401 });
  }
  return { session, application };
}

export async function loadMemberProfileForRequest(request: NextRequest) {
  const result = await assertMember(request);
  if (result instanceof NextResponse) return result;
  return NextResponse.json({ profile: memberProfileFromApplication(result.application) });
}
