"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, Circle } from "lucide-react";
import {
  getMembershipAnnualStatus,
  membershipAnnualStatusLabel,
  MEMBERSHIP_ANNUAL_PERIOD_MS,
} from "@/lib/membership-annual-status";
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
          "overflow-hidden rounded-2xl border shadow-sm",
          isActive
            ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white"
            : "border-red-200/90 bg-gradient-to-br from-red-50 to-white",
          className
        )}
        role="status"
        aria-label={`Membership ${membershipAnnualStatusLabel(annual.status)}`}
      >
        <div className="flex items-start gap-3.5 p-4">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
              isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            )}
          >
            <CalendarClock className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Annual membership · GHS {MEMBERSHIP_FEE_GHS}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className={cn("text-sm font-semibold", isActive ? "text-emerald-900" : "text-red-900")}>
                {membershipAnnualStatusLabel(annual.status)}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  isActive ? "bg-emerald-200/60 text-emerald-900" : "bg-red-200/60 text-red-900"
                )}
              >
                <Circle className={cn("h-1.5 w-1.5 fill-current", isActive && "animate-pulse")} />
                {isActive ? "In good standing" : "Renewal due"}
              </span>
            </div>
            {validUntilLabel ? (
              <p className="mt-1.5 text-xs text-slate-600">
                {isActive ? "Valid until " : "Expired on "}
                <span className="font-medium">{validUntilLabel}</span>
              </p>
            ) : null}
            {!isActive ? (
              <p className="mt-2 text-xs leading-relaxed text-red-800/90">
                <Link href="/membership" className="font-semibold underline underline-offset-2 hover:text-red-950">
                  Renew membership
                </Link>{" "}
                to restore active status.
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
        "flex min-w-0 items-center gap-3 rounded-xl border px-3.5 py-2.5",
        isActive
          ? "border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 to-white"
          : "border-red-200/90 bg-gradient-to-r from-red-50/90 to-white",
        className
      )}
      role="status"
      aria-label={`Membership ${membershipAnnualStatusLabel(annual.status)}`}
    >
      <span
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
        )}
      >
        <CalendarClock className="h-4 w-4" aria-hidden />
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
            isActive ? "bg-emerald-500" : "bg-red-500"
          )}
          aria-hidden
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-semibold", isActive ? "text-emerald-900" : "text-red-900")}>
          {membershipAnnualStatusLabel(annual.status)}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-600">
          GHS {MEMBERSHIP_FEE_GHS}/year
          {validUntilLabel ? (
            <>
              <span className="text-slate-400"> · </span>
              {isActive ? "Until " : "Expired "}
              {validUntilLabel}
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
