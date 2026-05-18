import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Clock, Mail, ShieldCheck } from "lucide-react";
import { PendingPaymentVerifier } from "@/components/membership/pending-payment-verifier";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";
import type { MembershipPaymentMethod } from "@prisma/client";

export const metadata: Metadata = {
  title: "Application pending | Ghana Chemical Society",
  description: "Your membership payment is awaiting secretariat verification.",
};

type Props = {
  searchParams: Promise<{
    applicationId?: string;
    ref?: string;
    method?: string;
    reference?: string;
    trxref?: string;
  }>;
};

export default async function MembershipPendingPage({ searchParams }: Props) {
  const { applicationId, ref, method, reference, trxref } = await searchParams;
  const paystackRef = reference ?? trxref ?? ref;
  const methodLabel =
    method && (method as MembershipPaymentMethod)
      ? membershipPaymentMethodLabel(method as MembershipPaymentMethod)
      : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-white px-4 pb-20 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
            <Clock className="h-8 w-8" strokeWidth={2} aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">
            Payment received — awaiting approval
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gcs-muted-text">
            Thank you. The secretariat will confirm your{" "}
            {methodLabel ? (
              <>
                <span className="font-medium text-gcs-foreground">{methodLabel}</span> payment
              </>
            ) : (
              "payment"
            )}{" "}
            and email your GCS member ID and sign-in link.
          </p>

          {methodLabel ? (
            <p className="mt-4 text-sm font-medium text-gcs-foreground">Payment method: {methodLabel}</p>
          ) : null}

          {applicationId && paystackRef ? (
            <PendingPaymentVerifier applicationId={applicationId} reference={paystackRef} />
          ) : null}

          {paystackRef ? (
            <p className="mt-6 rounded-xl border border-gcs-border bg-white px-4 py-3 font-mono text-xs text-gcs-muted-text shadow-sm">
              Reference: {paystackRef}
            </p>
          ) : null}
          {applicationId ? (
            <p className="mt-2 text-xs text-gcs-muted-text">Application ID: {applicationId}</p>
          ) : null}

          <ul className="mx-auto mt-10 max-w-sm space-y-4 text-left text-sm text-gcs-foreground">
            <li className="flex gap-3 rounded-xl border border-gcs-border/80 bg-white p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
              <span>Admin verifies payment under Membership in the CMS finance dashboard.</span>
            </li>
            <li className="flex gap-3 rounded-xl border border-gcs-border/80 bg-white p-4 shadow-sm">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
              <span>You will receive an email at the address on your application once approved.</span>
            </li>
          </ul>

          <Link
            href="/"
            className="mt-10 inline-flex rounded-full bg-gcs-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gcs-primary-hover"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    </>
  );
}
