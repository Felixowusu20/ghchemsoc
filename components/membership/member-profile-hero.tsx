"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Copy, FlaskConical, LogOut, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04),0_20px_48px_-24px_rgba(15,23,42,0.18)] sm:rounded-[1.75rem]"
    >
      <div
        className="relative h-28 bg-gradient-to-br from-gcs-primary via-blue-700 to-sky-600 sm:h-32"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-6">
            <div className="-mt-14 relative shrink-0 sm:-mt-16">
              <div className="h-[5.5rem] w-[5.5rem] rounded-full bg-gradient-to-br from-white via-white to-slate-100 p-[3px] shadow-lg shadow-slate-900/15 ring-4 ring-white sm:h-28 sm:w-28 md:h-32 md:w-32">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-50 to-white">
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
                    <span className="text-2xl font-semibold text-gcs-primary sm:text-3xl">{initials}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white bg-gradient-to-br from-gcs-primary to-blue-800 text-white shadow-md sm:h-10 sm:w-10">
                <FlaskConical className="h-4 w-4" aria-hidden />
              </div>
            </div>

            <div className="min-w-0 w-full pb-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gcs-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gcs-primary ring-1 ring-gcs-primary/15">
                <Sparkles className="h-3 w-3" aria-hidden />
                Verified member
              </span>
              <h1 className="mt-3 break-words text-xl font-semibold tracking-tight text-gcs-foreground sm:text-2xl md:text-[1.75rem]">
                {memberDisplayName(profile)}
              </h1>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gcs-muted-text sm:justify-start">
                <Building2 className="h-4 w-4 shrink-0 text-gcs-primary/80" aria-hidden />
                <span className="break-words">{profile.institution}</span>
                {memberJobTitle(profile) ? (
                  <span className="text-gcs-muted-text">· {memberJobTitle(profile)}</span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
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
              className="h-11 w-full rounded-full border-slate-200 bg-white shadow-sm hover:bg-slate-50 lg:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </Button>
            <Button
              asChild
              className="h-11 w-full rounded-full bg-gcs-primary text-white shadow-md shadow-gcs-primary/20 hover:bg-gcs-primary-hover lg:w-auto"
            >
              <Link href="/events">Browse events</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">Member ID</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold tracking-tight text-gcs-foreground">
              {displayMemberId}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyMemberId()}
            className={cn(
              "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
              idCopied
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-gcs-foreground shadow-sm hover:border-gcs-primary/30 hover:bg-slate-50"
            )}
          >
            {idCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {idCopied ? "Copied" : "Copy ID"}
          </button>
          <MemberAnnualStatusBadge profile={profile} variant="pill" className="min-h-[48px] lg:min-w-[200px]" />
        </div>
      </div>
    </motion.section>
  );
}
