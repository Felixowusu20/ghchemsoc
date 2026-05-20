import type { MembershipApplicationStatus } from "@prisma/client";

/** One calendar year of membership from the last verified payment or approval. */
export const MEMBERSHIP_ANNUAL_PERIOD_MS = 365 * 24 * 60 * 60 * 1000;

export type MembershipAnnualStatus = "active" | "inactive" | "not_applicable";

export type MembershipAnnualStatusResult = {
  status: MembershipAnnualStatus;
  validUntil: string | null;
  anchorAt: string | null;
};

export function membershipAnnualStatusLabel(status: MembershipAnnualStatus): string {
  const map: Record<MembershipAnnualStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    not_applicable: "—",
  };
  return map[status] ?? status;
}

export function getMembershipPeriodAnchor(row: {
  paidAt: Date | null;
  approvedAt: Date | null;
}): Date | null {
  return row.paidAt ?? row.approvedAt ?? null;
}

export function getMembershipAnnualStatus(
  row: {
    status: MembershipApplicationStatus;
    paidAt: Date | null;
    approvedAt: Date | null;
  },
  now: Date = new Date()
): MembershipAnnualStatusResult {
  if (row.status !== "approved") {
    return { status: "not_applicable", validUntil: null, anchorAt: null };
  }

  const anchor = getMembershipPeriodAnchor(row);
  if (!anchor) {
    return { status: "inactive", validUntil: null, anchorAt: null };
  }

  const validUntil = new Date(anchor.getTime() + MEMBERSHIP_ANNUAL_PERIOD_MS);
  const active = now.getTime() < validUntil.getTime();

  return {
    status: active ? "active" : "inactive",
    validUntil: validUntil.toISOString(),
    anchorAt: anchor.toISOString(),
  };
}

export function countMembershipAnnualStatuses(
  rows: {
    status: MembershipApplicationStatus;
    paidAt: Date | null;
    approvedAt: Date | null;
  }[],
  now: Date = new Date()
): { active: number; inactive: number } {
  let active = 0;
  let inactive = 0;
  for (const row of rows) {
    const { status } = getMembershipAnnualStatus(row, now);
    if (status === "active") active++;
    else if (status === "inactive") inactive++;
  }
  return { active, inactive };
}
