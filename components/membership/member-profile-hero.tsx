"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Copy, FlaskConical, LogOut } from "lucide-react";
import { MemberAnnualStatusBadge } from "@/components/membership/member-annual-status-badge";
import { Button } from "@/components/ui/button";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import {
  clearMemberProfile,
  memberDisplayName,
  memberInitials,
  memberJobTitle,
  memberPhotoSrc,
  normalizeMemberId,
} from "@/lib/member-profile";

export function MemberProfileHero() {
  const router = useRouter();
  const { profile, refresh } = useMemberPortal();
  const [idCopied, setIdCopied] = useState(false);

  const initials = useMemo(() => (profile ? memberInitials(profile) : ""), [profile]);
  const photoSrc = useMemo(() => (profile ? memberPhotoSrc(profile) : null), [profile]);
  const displayMemberId = useMemo(
    () => (profile ? normalizeMemberId(profile.memberId) : ""),
    [profile]
  );

  if (!profile) return null;

  const copyMemberId = async () => {
    try {
      await navigator.clipboard.writeText(displayMemberId);
      setIdCopied(true);
      window.setTimeout(() => setIdCopied(false), 2000);
    } catch {
      setIdCopied(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-gcs-border bg-white shadow-[0_2px_48px_-16px_rgba(15,23,42,0.14)]"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" aria-hidden />
      <div className="relative p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-gcs-primary via-blue-600 to-sky-500 p-[3px] shadow-lg shadow-blue-500/25 md:h-32 md:w-32">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                  {photoSrc ? (
                    <Image
                      src={photoSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={photoSrc.startsWith("data:")}
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-gcs-primary">{initials}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gcs-primary to-blue-700 text-white shadow-md">
                <FlaskConical className="h-4 w-4" aria-hidden />
              </div>
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gcs-muted-text">Verified member</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">
                {memberDisplayName(profile)}
              </h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gcs-muted-text sm:justify-start">
                <Building2 className="h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
                {profile.institution}
                {memberJobTitle(profile) ? ` · ${memberJobTitle(profile)}` : ""}
              </p>
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <div className="rounded-2xl border border-gcs-border/80 bg-white px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">Member ID</p>
                  <p className="font-mono text-sm font-semibold text-gcs-foreground">{displayMemberId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyMemberId()}
                  className="inline-flex items-center gap-1 rounded-full border border-gcs-border bg-white px-3 py-2 text-xs font-medium hover:border-gcs-primary/40"
                >
                  {idCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {idCopied ? "Copied" : "Copy ID"}
                </button>
                <MemberAnnualStatusBadge profile={profile} variant="pill" />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-gcs-border/60 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void fetch("/api/member/logout", { method: "POST", credentials: "include" }).finally(() => {
                  clearMemberProfile();
                  void refresh();
                  router.refresh();
                });
              }}
              className="h-10 rounded-full border-gcs-border"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </Button>
            <Button asChild variant="ghost" className="h-10 rounded-full text-gcs-primary">
              <Link href="/events">Browse events</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
