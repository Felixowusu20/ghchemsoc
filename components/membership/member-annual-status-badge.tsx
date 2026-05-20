"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { membershipAnnualStatusLabel, MEMBERSHIP_ANNUAL_PERIOD_MS } from "@/lib/membership-annual-status";
import { MEMBERSHIP_FEE_GHS } from "@/lib/membership-application";
import type { MemberProfile } from "@/lib/member-profile";
import { cn } from "@/lib/utils";

export type MemberAnnualStatusView = {
  status: "active" | "inactive";
  validUntil: string | null;
  paidOn: string | null;
};

/** Resolve annual status from server fields or payment / registration dates. */
export function memberAnnualStatusFromProfile(profile: MemberProfile): MemberAnnualStatusView | null {
  if (profile.annualMembershipStatus === "active" || profile.annualMembershipStatus === "inactive") {
    return {
      status: profile.annualMembershipStatus,
      validUntil: profile.annualMembershipValidUntil ?? null,
      paidOn: null,
    };
  }

  const completed = profile.payments.find((p) => p.status === "completed");
  const anchorIso = completed?.date ?? profile.registeredAt;
  if (!anchorIso) return null;

  const anchor = new Date(anchorIso);
  if (Number.isNaN(anchor.getTime())) return null;

  const validUntil = new Date(anchor.getTime() + MEMBERSHIP_ANNUAL_PERIOD_MS);
  const active = Date.now() < validUntil.getTime();

  return {
    status: active ? "active" : "inactive",
    validUntil: validUntil.toISOString(),
    paidOn: anchorIso,
  };
}

type Props = {
  profile: MemberProfile;
  /** Compact pill for nav; card for profile hero and payments. */
  variant?: "pill" | "card";
  className?: string;
};

export function MemberAnnualStatusBadge({ profile, variant = "pill", className }: Props) {
  const annual = useMemo(() => memberAnnualStatusFromProfile(profile), [profile]);

  if (!annual) return null;

  const isActive = annual.status === "active";
  const validUntilLabel = annual.validUntil
    ? new Date(annual.validUntil).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border px-4 py-3 shadow-sm",
          isActive ? "border-emerald-200 bg-emerald-50/90" : "border-red-200 bg-red-50/90",
          className
        )}
        role="status"
        aria-label={`Membership ${membershipAnnualStatusLabel(annual.status)}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            )}
          >
            <CalendarClock className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Annual membership · GHS {MEMBERSHIP_FEE_GHS}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold",
                isActive ? "text-emerald-900" : "text-red-900"
              )}
            >
              {membershipAnnualStatusLabel(annual.status)}
            </p>
            {validUntilLabel ? (
              <p className="mt-1 text-xs text-slate-600">
                {isActive ? "Valid until " : "Expired on "}
                {validUntilLabel}
              </p>
            ) : null}
            {!isActive ? (
              <p className="mt-1.5 text-xs text-red-800/90">
                Renew via the membership form to restore active status.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        isActive ? "border-emerald-200/90 bg-emerald-50" : "border-red-200/90 bg-red-50",
        className
      )}
      role="status"
      aria-label={`Membership ${membershipAnnualStatusLabel(annual.status)}`}
    >
      <p
        className={cn(
          "text-xs font-semibold",
          isActive ? "text-emerald-900" : "text-red-900"
        )}
      >
        {membershipAnnualStatusLabel(annual.status)}
      </p>
      <p className="mt-0.5 text-[10px] leading-snug text-slate-600">
        GHS {MEMBERSHIP_FEE_GHS}/year
        {validUntilLabel ? (
          <>
            <br />
            {isActive ? "Until " : "Expired "}
            {validUntilLabel}
          </>
        ) : null}
      </p>
    </div>
  );
}
