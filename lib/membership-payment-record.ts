import type { MembershipPaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";

export type RecordMembershipPaymentInput = {
  applicationId: string;
  paymentMethod: MembershipPaymentMethod;
  paystackReference: string;
  payerPhone?: string | null;
  paymentNote?: string | null;
};

export async function recordMembershipPayment(input: RecordMembershipPaymentInput) {
  const existing = await prisma.membershipApplication.findUnique({
    where: { id: input.applicationId },
  });

  if (!existing) {
    return { ok: false as const, error: "Application not found.", status: 404 };
  }

  if (existing.status === "approved") {
    return { ok: false as const, error: "This application is already approved.", status: 400 };
  }

  if (existing.status === "rejected") {
    return { ok: false as const, error: "This application was rejected.", status: 400 };
  }

  if (
    existing.status === "payment_submitted" &&
    existing.paymentStatus === "submitted" &&
    existing.paystackReference === input.paystackReference
  ) {
    return {
      ok: true as const,
      alreadyRecorded: true,
      applicationId: existing.id,
      paystackReference: existing.paystackReference!,
      paymentMethod: existing.paymentMethod!,
      message: "Payment already recorded. Awaiting secretariat verification.",
    };
  }

  const now = new Date();
  const methodLabel = membershipPaymentMethodLabel(input.paymentMethod);

  await prisma.membershipApplication.update({
    where: { id: input.applicationId },
    data: {
      status: "payment_submitted",
      paymentStatus: "submitted",
      paymentMethod: input.paymentMethod,
      paystackReference: input.paystackReference,
      payerPhone: input.payerPhone ?? existing.payerPhone,
      paymentNote: input.paymentNote?.trim() || existing.paymentNote,
      paidAt: now,
      read: false,
    },
  });

  return {
    ok: true as const,
    alreadyRecorded: false,
    applicationId: input.applicationId,
    paystackReference: input.paystackReference,
    paymentMethod: input.paymentMethod,
    message: `Payment via ${methodLabel} received. The secretariat will verify and email your member ID once approved.`,
  };
}
