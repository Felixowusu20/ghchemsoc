import type { MembershipApplication } from "@prisma/client";
import type { MemberProfile } from "@/lib/member-profile";
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
  row: Pick<MembershipApplication, "status" | "email" | "memberId"> | null,
  email: string,
  memberIdInput: string
): string {
  if (!row) {
    return "No approved membership found for that email and member ID. Check the ID from your approval email or contact the secretariat.";
  }

  if (row.status === "payment_submitted") {
    return "Your payment is still being verified. You will be able to sign in after the secretariat approves your application.";
  }
  if (row.status === "pending_payment") {
    return "Complete membership payment first, then wait for secretariat approval before signing in.";
  }
  if (row.status === "rejected") {
    return "This application was not approved. Contact the secretariat for assistance.";
  }

  const emailOk = row.email.trim().toLowerCase() === email.trim().toLowerCase();
  const idOk = row.memberId && normalizeMemberId(row.memberId) === normalizeMemberId(memberIdInput);
  if (!emailOk || !idOk) {
    return "That email and member ID do not match our records. Use the exact email and ID from your approval message.";
  }

  return "Your membership is not active yet. Contact the secretariat if you believe this is an error.";
}
