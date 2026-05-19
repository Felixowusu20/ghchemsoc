import type { MembershipApplication } from "@prisma/client";
import { emailsMatch, normalizeMembershipEmail } from "@/lib/member-email";
import { normalizeMemberId } from "@/lib/member-profile";
import { prisma } from "@/lib/prisma";

export type MemberLoginLookupResult =
  | { ok: true; application: MembershipApplication }
  | { ok: false; hint: MembershipApplication | null };

/**
 * Resolve an approved application by member ID (primary) and email (case-insensitive).
 */
export async function findApprovedMembershipForLogin(
  emailInput: string,
  memberIdInput: string
): Promise<MemberLoginLookupResult> {
  const email = normalizeMembershipEmail(emailInput);
  const memberIdNorm = normalizeMemberId(memberIdInput);

  const candidates = await prisma.membershipApplication.findMany({
    where: {
      memberId: { not: null },
      OR: [{ memberId: memberIdNorm }, { email: { equals: email, mode: "insensitive" } }],
    },
    orderBy: [{ approvedAt: "desc" }, { updatedAt: "desc" }],
    take: 12,
  });

  const approvedMatch = candidates.find(
    (row) =>
      row.status === "approved" &&
      row.memberId &&
      normalizeMemberId(row.memberId) === memberIdNorm &&
      emailsMatch(row.email, email)
  );

  if (approvedMatch) {
    return { ok: true, application: approvedMatch };
  }

  const hint =
    candidates.find((row) => emailsMatch(row.email, email)) ??
    candidates.find((row) => row.memberId && normalizeMemberId(row.memberId) === memberIdNorm) ??
    (await prisma.membershipApplication.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    })) ??
    (await prisma.membershipApplication.findFirst({
      where: { memberId: memberIdNorm },
    }));

  return { ok: false, hint };
}
