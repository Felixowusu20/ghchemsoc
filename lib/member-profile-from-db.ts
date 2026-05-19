import type { MembershipApplication } from "@prisma/client";
import type { MemberProfile } from "@/lib/member-profile";
import { emailsMatch } from "@/lib/member-email";
import { normalizeMemberId } from "@/lib/member-profile";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";

export function memberProfileFromApplication(row: MembershipApplication): MemberProfile {
  const memberId = row.memberId!;
  const verifiedAt = row.approvedAt ?? row.paidAt ?? row.createdAt;

  return {
    memberId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone ?? "",
    institution: row.institution,
    jobTitle: row.jobTitle ?? "",
    highestDegree: row.highestDegree ?? "",
    declarationLegalName: row.declarationLegalName,
    declarationDate: row.declarationDate,
    registeredAt: verifiedAt.toISOString(),
    ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}),
    payments: [
      {
        id: `${memberId}-membership`,
        date: verifiedAt.toISOString(),
        description: row.paymentMethod
          ? `Annual membership dues — ${membershipPaymentMethodLabel(row.paymentMethod)}`
          : "Annual membership dues — verified",
        amountGhs: row.amountGhs,
        status: "completed",
        ...(row.paystackReference ? { reference: row.paystackReference } : {}),
      },
    ],
  };
}

export function memberLoginErrorMessage(
  row: Pick<MembershipApplication, "status" | "email" | "memberId" | "paymentStatus"> | null,
  email: string,
  memberIdInput: string
): string {
  if (!row) {
    return "No membership found for that email and member ID. Use the exact details from your approval email, or contact the secretariat.";
  }

  if (row.status === "payment_submitted") {
    return "Your payment was received but your membership is not approved yet. The secretariat must approve your application before you can sign in — you will receive another email with your member ID when that happens.";
  }
  if (row.status === "pending_payment") {
    return "Complete membership payment first, then wait for secretariat approval before signing in.";
  }
  if (row.status === "rejected") {
    return "This application was not approved. Contact the secretariat for assistance.";
  }

  if (row.status === "approved") {
    const emailOk = emailsMatch(row.email, email);
    const idOk = row.memberId && normalizeMemberId(row.memberId) === normalizeMemberId(memberIdInput);
    if (!emailOk && idOk) {
      return `That member ID is registered to a different email address (${row.email.trim()}). Use the same email you used when you applied.`;
    }
    if (emailOk && !idOk) {
      return "That email is approved, but the member ID does not match. Copy the member ID exactly from your approval email (format GCS-26-…).";
    }
    if (emailOk && idOk) {
      return "We could not complete sign-in. Try again, or clear your browser cache and use the link from your approval email.";
    }
  }

  return "Your membership is not active yet. Contact the secretariat if you believe this is an error.";
}
