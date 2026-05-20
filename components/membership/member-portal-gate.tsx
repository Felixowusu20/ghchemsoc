"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { normalizeMemberId } from "@/lib/member-profile";

export function MemberPortalGate({ children }: { children: React.ReactNode }) {
  const { hydrated, profile, unlocked } = useMemberPortal();

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gcs-muted-text">
        Loading your member area
      </div>
    );
  }

  if (!profile) {
    return (
      <GateCard title="Member portfolio">
        <p className="mt-3 text-sm leading-relaxed text-gcs-muted-text">
          Apply for membership {" "}
          <Link href="/login?role=member" className="font-medium text-gcs-primary hover:underline">
            member sign-in
          </Link>{" "}
          with your email and GCS member ID.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-white hover:bg-gcs-primary-hover">
            <Link href="/membership">Become a Member</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-gcs-border px-8 text-sm">
            <Link href="/login?role=member">Member sign-in</Link>
          </Button>
        </div>
      </GateCard>
    );
  }

  if (!unlocked) {
    const memberId = normalizeMemberId(profile.memberId);
    return (
      <GateCard title="Sign in to view your portfolio">
        <p className="mt-3 text-sm leading-relaxed text-gcs-muted-text">
          We found your application on this browser. Sign in with your email and member ID to unlock benefits,
          resources, and payment history.
        </p>
        <p className="mt-4 font-mono text-sm font-medium text-gcs-foreground">{memberId}</p>
        <div className="mt-8 flex justify-center">
          <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-white hover:bg-gcs-primary-hover">
            <Link href={`/login?role=member&memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(profile.email)}`}>
              Member sign-in
            </Link>
          </Button>
        </div>
      </GateCard>
    );
  }

  return <>{children}</>;
}

function GateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg rounded-[1.75rem] border border-gcs-border bg-white p-10 text-center shadow-[0_2px_32px_-12px_rgba(15,23,42,0.12)]"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gcs-primary/10 to-sky-100 text-gcs-primary ring-1 ring-gcs-primary/15">
        <Lock className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight text-gcs-foreground">{title}</h1>
      {children}
    </motion.div>
  );
}
