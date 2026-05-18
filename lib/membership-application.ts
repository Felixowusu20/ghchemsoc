import { randomBytes } from "crypto";
import type {
  MembershipApplicationStatus,
  MembershipPaymentMethod,
  MembershipPaymentStatus,
} from "@prisma/client";

/** Annual membership dues in Ghana cedis. */
export const MEMBERSHIP_FEE_GHS = 150;

export function generateMembershipMemberId(): string {
  const year = new Date().getUTCFullYear();
  const yy = String(year % 100).padStart(2, "0");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `GCS-${yy}-${suffix}`;
}

export function membershipStatusLabel(status: MembershipApplicationStatus): string {
  const map: Record<MembershipApplicationStatus, string> = {
    pending_payment: "Awaiting payment",
    payment_submitted: "Payment to verify",
    approved: "Approved",
    rejected: "Rejected",
  };
  return map[status] ?? status;
}

export function membershipPaymentStatusLabel(status: MembershipPaymentStatus): string {
  const map: Record<MembershipPaymentStatus, string> = {
    pending: "Not paid",
    submitted: "Submitted (unverified)",
    verified: "Verified",
    failed: "Failed",
  };
  return map[status] ?? status;
}

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type MembershipApplicationRow = {
  id: string;
  status: MembershipApplicationStatus;
  fullName: string;
  email: string;
  phone: string | null;
  institution: string;
  jobTitle: string | null;
  highestDegree: string | null;
  declarationLegalName: string;
  declarationDate: string;
  photoUrl: string | null;
  amountGhs: number;
  paymentStatus: MembershipPaymentStatus;
  paymentMethod: MembershipPaymentMethod | null;
  paystackReference: string | null;
  payerPhone: string | null;
  paymentNote: string | null;
  paidAt: string | null;
  memberId: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  adminNote: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export function serializeMembershipApplication(
  r: {
    id: string;
    status: MembershipApplicationStatus;
    fullName: string;
    email: string;
    phone: string | null;
    institution: string;
    jobTitle: string | null;
    highestDegree: string | null;
    declarationLegalName: string;
    declarationDate: string;
    photoUrl: string | null;
    amountGhs: number;
    paymentStatus: MembershipPaymentStatus;
    paymentMethod: MembershipPaymentMethod | null;
    paystackReference: string | null;
    payerPhone: string | null;
    paymentNote: string | null;
    paidAt: Date | null;
    memberId: string | null;
    approvedAt: Date | null;
    rejectedAt: Date | null;
    adminNote: string | null;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
): MembershipApplicationRow {
  return {
    id: r.id,
    status: r.status,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    institution: r.institution,
    jobTitle: r.jobTitle,
    highestDegree: r.highestDegree,
    declarationLegalName: r.declarationLegalName,
    declarationDate: r.declarationDate,
    photoUrl: r.photoUrl,
    amountGhs: r.amountGhs,
    paymentStatus: r.paymentStatus,
    paymentMethod: r.paymentMethod,
    paystackReference: r.paystackReference,
    payerPhone: r.payerPhone,
    paymentNote: r.paymentNote,
    paidAt: r.paidAt?.toISOString() ?? null,
    memberId: r.memberId,
    approvedAt: r.approvedAt?.toISOString() ?? null,
    rejectedAt: r.rejectedAt?.toISOString() ?? null,
    adminNote: r.adminNote,
    read: r.read,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
