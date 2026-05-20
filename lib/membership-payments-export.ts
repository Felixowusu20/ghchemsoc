import type { MembershipApplication } from "@prisma/client";
import {
  membershipPaymentStatusLabel,
  membershipStatusLabel,
  serializeMembershipApplication,
  type MembershipApplicationRow,
} from "@/lib/membership-application";
import { membershipAnnualStatusLabel } from "@/lib/membership-annual-status";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";

export function membershipPaymentYear(d: Date | null | undefined): number | null {
  if (!d || Number.isNaN(d.getTime())) return null;
  return d.getUTCFullYear();
}

/** Calendar year used for finance export (payment date, else approval, else application). */
export function membershipRecordFinanceYear(row: {
  paidAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
}): number {
  return (
    membershipPaymentYear(row.paidAt) ??
    membershipPaymentYear(row.approvedAt) ??
    row.createdAt.getUTCFullYear()
  );
}

export function yearRangeOptions(countBack = 6): number[] {
  const y = new Date().getUTCFullYear();
  return Array.from({ length: countBack }, (_, i) => y - i);
}

export function filterApplicationsByFinanceYear<T extends { paidAt: Date | null; approvedAt: Date | null; createdAt: Date }>(
  rows: T[],
  year: number
): T[] {
  return rows.filter((r) => membershipRecordFinanceYear(r) === year);
}

const CSV_HEADERS = [
  "Finance year",
  "Application ID",
  "Member ID",
  "Full name",
  "Email",
  "Phone",
  "Institution",
  "Amount (GHS)",
  "Application status",
  "Payment status",
  "Payment method",
  "Paystack reference",
  "Payer phone",
  "Transfer note",
  "Paid at",
  "Approved at",
  "Rejected at",
  "Annual status",
  "Valid until",
  "Submitted at",
] as const;

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatCsvDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString();
  } catch {
    return iso;
  }
}

export function membershipPaymentRowToCsvRecord(row: MembershipApplicationRow): string[] {
  const financeYear =
    membershipPaymentYear(row.paidAt ? new Date(row.paidAt) : null) ??
    membershipPaymentYear(row.approvedAt ? new Date(row.approvedAt) : null) ??
    new Date(row.createdAt).getUTCFullYear();

  return [
    String(financeYear),
    row.id,
    row.memberId ?? "",
    row.fullName,
    row.email,
    row.phone ?? "",
    row.institution,
    String(row.amountGhs),
    membershipStatusLabel(row.status),
    membershipPaymentStatusLabel(row.paymentStatus),
    row.paymentMethod ? membershipPaymentMethodLabel(row.paymentMethod) : "",
    row.paystackReference ?? "",
    row.payerPhone ?? "",
    row.paymentNote ?? "",
    formatCsvDate(row.paidAt),
    formatCsvDate(row.approvedAt),
    formatCsvDate(row.rejectedAt),
    row.status === "approved" ? membershipAnnualStatusLabel(row.annualMembershipStatus) : "",
    formatCsvDate(row.annualMembershipValidUntil),
    formatCsvDate(row.createdAt),
  ];
}

export function buildMembershipPaymentsCsv(rows: MembershipApplicationRow[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(membershipPaymentRowToCsvRecord(row).map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export function serializeRowsForExport(applications: MembershipApplication[]): MembershipApplicationRow[] {
  return applications.map(serializeMembershipApplication);
}

/** CMS may delete any membership record individually; bulk archive still uses {@link isArchivableMembershipRecord}. */
export function canDeleteMembershipApplication(_row: {
  status: import("@prisma/client").MembershipApplicationStatus;
}): boolean {
  return true;
}

export function membershipApplicationMatchesSearch(
  row: {
    fullName: string;
    email: string;
    institution: string;
    memberId: string | null;
    paystackReference: string | null;
    payerPhone: string | null;
    phone: string | null;
    paymentNote: string | null;
    id: string;
  },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.fullName,
    row.email,
    row.institution,
    row.memberId,
    row.paystackReference,
    row.payerPhone,
    row.phone,
    row.paymentNote,
    row.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

/** Records safe to remove after export (incomplete / rejected only, past years). */
export function isArchivableMembershipRecord(
  row: Pick<MembershipApplication, "status" | "paidAt" | "approvedAt" | "createdAt">,
  year: number
): boolean {
  if (membershipRecordFinanceYear(row) !== year) return false;
  if (year >= new Date().getUTCFullYear()) return false;
  return row.status === "rejected" || row.status === "pending_payment";
}
