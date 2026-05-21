"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { normalizeMemberId } from "@/lib/member-profile";

export function MemberPortalGate({ children }: { children: React.ReactNode }) {
  const { hydrated, profile, unlocked } = useMemberPortal();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gcs-primary/20 border-t-gcs-primary" aria-hidden />
        <p className="text-sm font-medium text-gcs-muted-text">Loading your member portfolio…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <GateCard
        title="Member portfolio"
        subtitle="Sign in or apply to access your Ghana Chemical Society member area."
      >
        <p className="mt-4 text-sm leading-relaxed text-gcs-muted-text">
          Already approved? Use{" "}
          <Link href="/login?role=member" className="font-semibold text-gcs-primary hover:underline">
            member sign-in
          </Link>{" "}
          with your email and GCS member ID.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-white shadow-md shadow-gcs-primary/20 hover:bg-gcs-primary-hover">
            <Link href="/membership">Become a member</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 px-8">
            <Link href="/login?role=member">Member sign-in</Link>
          </Button>
        </div>
      </GateCard>
    );
  }

  if (!unlocked) {
    const memberId = normalizeMemberId(profile.memberId);
    return (
      <GateCard
        title="Sign in to unlock your portfolio"
        subtitle="We found your membership on this device. Authenticate to view benefits, resources, and payments."
      >
        <div className="mx-auto mt-5 max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">Your member ID</p>
          <p className="mt-1 break-all font-mono text-sm font-semibold text-gcs-foreground">{memberId}</p>
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-white shadow-md shadow-gcs-primary/20 hover:bg-gcs-primary-hover">
            <Link
              href={`/login?role=member&memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(profile.email)}`}
            >
              Continue to sign-in
            </Link>
          </Button>
        </div>
      </GateCard>
    );
  }

  return <>{children}</>;
}

function GateCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-center shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] sm:rounded-[1.75rem]"
    >
      <div className="h-2 bg-gradient-to-r from-gcs-primary via-blue-600 to-sky-500" aria-hidden />
      <div className="px-6 py-10 sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gcs-primary/10 to-sky-100 text-gcs-primary ring-1 ring-gcs-primary/15">
          <Lock className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-gcs-foreground sm:text-2xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gcs-muted-text">{subtitle}</p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gcs-primary/80">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Secure member access
        </div>
        {children}
      </div>
    </motion.div>
  );
}
