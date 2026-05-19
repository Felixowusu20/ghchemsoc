"use client";

import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import type { MemberProfile } from "@/lib/member-profile";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusStyles(status: MemberProfile["payments"][number]["status"]) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/15";
    case "pending":
      return "bg-amber-50 text-amber-900 ring-amber-600/15";
    case "failed":
      return "bg-rose-50 text-rose-800 ring-rose-600/15";
    default:
      return "bg-neutral-100 text-gcs-foreground ring-gcs-border/40";
  }
}

export function MemberPaymentsPage() {
  const { profile } = useMemberPortal();
  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">Payment history</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
          Membership dues and receipts recorded by the secretariat. Amounts are shown in Ghana Cedis (GHS) where applicable.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gcs-border bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-gcs-border/60 bg-gradient-to-r from-gcs-primary/[0.06] via-white to-white px-6 py-5 md:px-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gcs-primary shadow-sm ring-1 ring-gcs-border/40">
            <CreditCard className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gcs-foreground">Transactions</h3>
            <p className="text-xs text-gcs-muted-text">Confirmed payments appear here after secretariat review</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gcs-border/60 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wide text-gcs-muted-text">
              <tr>
                <th className="px-6 py-3.5 md:px-8">Date</th>
                <th className="px-6 py-3.5 md:px-8">Description</th>
                <th className="px-6 py-3.5 md:px-8">Amount</th>
                <th className="px-6 py-3.5 md:px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gcs-border/50">
              {profile.payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gcs-muted-text md:px-8">
                    No payment records yet. They will appear here after the secretariat confirms your invoice.
                  </td>
                </tr>
              ) : (
                profile.payments.map((p) => (
                  <tr key={p.id} className="bg-white transition hover:bg-neutral-50/80">
                    <td className="whitespace-nowrap px-6 py-4 text-gcs-muted-text md:px-8">{formatDate(p.date)}</td>
                    <td className="px-6 py-4 text-gcs-foreground md:px-8">
                      {p.description}
                      {p.reference ? (
                        <span className="mt-1 block font-mono text-xs text-gcs-muted-text">Ref {p.reference}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gcs-foreground md:px-8">
                      {p.amountGhs == null ? "—" : `GHS ${p.amountGhs.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 md:px-8">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
