"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PendingPaymentVerifier } from "@/components/membership/pending-payment-verifier";
import { formatGhs, MEMBERSHIP_FEE_GHS } from "@/lib/membership-fee";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "payment",
    title: "Payment submitted",
    description: "Your dues have been sent for processing.",
    state: "complete" as const,
  },
  {
    id: "review",
    title: "Secretariat review",
    description: "Our team confirms your payment and application details.",
    state: "current" as const,
  },
  {
    id: "welcome",
    title: "Member ID & welcome email",
    description: "You receive your GCS member ID and a link to sign in to the member portal.",
    state: "upcoming" as const,
  },
];

export type MembershipPendingViewProps = {
  applicationId?: string;
  paystackRef?: string;
  methodLabel?: string | null;
  amountGhs?: number;
};

function StepIcon({ state }: { state: "complete" | "current" | "upcoming" }) {
  if (state === "complete") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-white">
        <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gcs-primary text-white ring-4 ring-white">
        <Clock className="h-5 w-5" strokeWidth={2} aria-hidden />
        <span
          className="absolute inset-0 animate-ping rounded-full bg-gcs-primary/30"
          aria-hidden
        />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-4 ring-white">
      <Circle className="h-4 w-4" strokeWidth={2} aria-hidden />
    </span>
  );
}

export function MembershipPendingView({
  applicationId,
  paystackRef,
  methodLabel,
  amountGhs = MEMBERSHIP_FEE_GHS,
}: MembershipPendingViewProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/40 px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:pb-24 md:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#0ea5e915_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-gcs-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-gcs-primary/[0.07] via-white to-sky-50/50 px-6 py-10 text-center sm:px-10 sm:py-12">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Awaiting approval
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gcs-foreground sm:text-3xl md:text-[2rem]">
              Thank you — we&apos;re reviewing your payment
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gcs-muted-text sm:text-[1.05rem]">
              Your membership application and{" "}
              <span className="font-semibold text-gcs-foreground">{formatGhs(amountGhs)}</span> annual fee
              {methodLabel ? (
                <>
                  {" "}
                  via <span className="font-medium text-gcs-foreground">{methodLabel}</span>
                </>
              ) : null}{" "}
              are with the Ghana Chemical Society secretariat. You will be notified by email once approved.
            </p>

            {applicationId && paystackRef ? (
              <PendingPaymentVerifier applicationId={applicationId} reference={paystackRef} />
            ) : null}
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gcs-muted-text">
              What happens next
            </h2>

            <ol className="relative mt-8 space-y-0">
              {STEPS.map((step, index) => (
                <li
                  key={step.id}
                  className={cn(
                    "relative flex gap-4 pb-10 last:pb-0 sm:gap-5",
                    index < STEPS.length - 1 &&
                      "before:absolute before:left-[1.125rem] before:top-9 before:h-[calc(100%-2.25rem)] before:w-px before:bg-gradient-to-b before:from-emerald-200 before:via-gcs-primary/25 before:to-slate-200 sm:before:left-[1.125rem]"
                  )}
                >
                  <StepIcon state={step.state} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        step.state === "current" ? "text-gcs-primary" : "text-gcs-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gcs-muted-text">{step.description}</p>
                    {step.state === "current" ? (
                      <p className="mt-2 text-xs font-medium text-gcs-primary/90">
                        Usually within a few working days after payment is confirmed.
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-gcs-foreground">Check your inbox</p>
                  <p className="mt-1 text-xs leading-relaxed text-gcs-muted-text">
                    Approval and your member ID are sent to the email on your application.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-gcs-foreground">No action needed</p>
                  <p className="mt-1 text-xs leading-relaxed text-gcs-muted-text">
                    You do not need to submit the form again unless the secretariat contacts you.
                  </p>
                </div>
              </div>
            </div>

            {paystackRef || applicationId ? (
              <details className="group mt-8 rounded-2xl border border-dashed border-slate-200 bg-white open:bg-slate-50/50">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gcs-muted-text marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gcs-primary" aria-hidden />
                    Payment reference details
                    <span className="text-xs font-normal text-slate-400 group-open:hidden">(show)</span>
                  </span>
                </summary>
                <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-sm">
                  {paystackRef ? (
                    <p className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-gcs-muted-text">Reference</span>
                      <span className="break-all font-mono text-xs font-medium text-gcs-foreground sm:text-right">
                        {paystackRef}
                      </span>
                    </p>
                  ) : null}
                  {applicationId ? (
                    <p className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-gcs-muted-text">Application ref.</span>
                      <span className="break-all font-mono text-xs text-gcs-foreground sm:text-right">
                        {applicationId}
                      </span>
                    </p>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gcs-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-gcs-primary/20 transition hover:bg-gcs-primary-hover"
            >
              Back to homepage
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-gcs-foreground transition hover:border-gcs-primary/30 hover:bg-white"
            >
              <MessageCircle className="h-4 w-4 text-gcs-primary" aria-hidden />
              Contact secretariat
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-gcs-muted-text">
          Already approved?{" "}
          <Link href="/login" className="font-semibold text-gcs-primary hover:underline">
            Sign in to the member portal
          </Link>
        </p>
      </div>
    </main>
  );
}
