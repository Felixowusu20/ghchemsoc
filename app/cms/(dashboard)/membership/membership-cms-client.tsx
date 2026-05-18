"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard } from "@/components/cms/cms-ui";
import { handleCmsResponse } from "@/lib/cms-toast";
import { refreshCmsNotifications } from "@/components/cms/cms-nav-badges";
import {
  formatGhs,
  membershipPaymentStatusLabel,
  membershipStatusLabel,
  type MembershipApplicationRow,
} from "@/lib/membership-application";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";
import { cn } from "@/lib/utils";

type Dashboard = {
  pendingVerification: number;
  verifiedRevenueGhs: number;
  verifiedCount: number;
  awaitingVerificationGhs: number;
  awaitingVerificationCount: number;
  approved: number;
  rejected: number;
  pendingPayment: number;
};

type Tab = "verify" | "all" | "approved";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Banknote;
  tone?: "default" | "amber" | "emerald" | "slate";
}) {
  const tones = {
    default: "from-gcs-primary/10 to-white ring-gcs-primary/15",
    amber: "from-amber-50 to-white ring-amber-200/80",
    emerald: "from-emerald-50 to-white ring-emerald-200/80",
    slate: "from-slate-50 to-white ring-slate-200/80",
  };
  const iconTones = {
    default: "bg-gcs-primary/10 text-gcs-primary",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <CmsCard className={cn("bg-gradient-to-br p-5 ring-1", tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconTones[tone])}>
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
      </div>
    </CmsCard>
  );
}

export function MembershipCmsClient() {
  const [tab, setTab] = useState<Tab>("verify");
  const [rows, setRows] = useState<MembershipApplicationRow[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<{ to: string; subject: string; body: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const q =
      tab === "verify" ? "?pending=1" : tab === "approved" ? "?status=approved" : "";
    const res = await fetch(`/api/cms/membership-applications${q}`, cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
      setRows([]);
      setDashboard(null);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { applications: MembershipApplicationRow[]; dashboard: Dashboard };
    setRows(data.applications);
    setDashboard(data.dashboard);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (tab === "verify") {
      return rows.filter((r) => r.status === "payment_submitted" && r.paymentStatus === "submitted");
    }
    if (tab === "approved") return rows.filter((r) => r.status === "approved");
    return rows;
  }, [rows, tab]);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/cms/membership-applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as {
      emailPreview?: { to: string; subject: string; body: string };
    } | null;
    if (await handleCmsResponse(res, "Updated", { setErr })) {
      if (data?.emailPreview) setEmailPreview(data.emailPreview);
      await load();
      refreshCmsNotifications();
    }
  }

  async function approve(id: string) {
    setBusyId(id);
    await patch({ action: "approve", applicationId: id });
    setBusyId(null);
  }

  async function reject(id: string) {
    setBusyId(id);
    await patch({ action: "reject", applicationId: id });
    setBusyId(null);
  }

  if (loading && !dashboard) {
    return <p className="text-sm text-slate-500">Loading membership finance…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Finance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Membership</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Members choose MoMo, bank transfer, card, or USSD at checkout (demo until Paystack is live). Verify each
            payment, then approve to issue member IDs. Approved members receive an email preview below.
          </p>
        </div>
        <CmsButton type="button" variant="ghost" onClick={() => void load()} className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </CmsButton>
      </div>

      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      {dashboard ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Awaiting verification"
            value={String(dashboard.pendingVerification)}
            sub={formatGhs(dashboard.awaitingVerificationGhs) + " reported"}
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Verified revenue"
            value={formatGhs(dashboard.verifiedRevenueGhs)}
            sub={`${dashboard.verifiedCount} payments`}
            icon={Banknote}
            tone="emerald"
          />
          <StatCard
            label="Approved members"
            value={String(dashboard.approved)}
            sub="IDs issued"
            icon={BadgeCheck}
            tone="default"
          />
          <StatCard
            label="Incomplete checkout"
            value={String(dashboard.pendingPayment)}
            sub={`${dashboard.rejected} rejected`}
            icon={CreditCard}
            tone="slate"
          />
        </div>
      ) : null}

      <CmsCard className="overflow-hidden p-0">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/80 p-2">
          {(
            [
              ["verify", "Verify payments", dashboard?.pendingVerification],
              ["all", "All applications", rows.length],
              ["approved", "Approved", dashboard?.approved],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                tab === id ? "bg-white text-gcs-primary shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {label}
              {typeof count === "number" ? (
                <span className="ml-2 rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No applications in this view.
                  </td>
                </tr>
              ) : null}
              {filtered.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    className={cn(
                      "border-b border-slate-50 transition hover:bg-slate-50/50",
                      !r.read && r.status === "payment_submitted" && "bg-amber-50/40"
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      >
                        <p className="font-semibold text-slate-900">{r.fullName}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                        <p className="text-xs text-slate-400">{r.institution}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{formatGhs(r.amountGhs)}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{membershipPaymentStatusLabel(r.paymentStatus)}</p>
                      {r.paymentMethod ? (
                        <p className="text-xs font-medium text-slate-600">
                          {membershipPaymentMethodLabel(r.paymentMethod)}
                        </p>
                      ) : null}
                      {r.paystackReference ? (
                        <p className="font-mono text-[10px] text-slate-400">{r.paystackReference}</p>
                      ) : null}
                      {r.payerPhone ? <p className="text-xs text-slate-500">Phone: {r.payerPhone}</p> : null}
                      {r.paymentNote ? (
                        <p className="text-xs text-slate-500">Ref: {r.paymentNote}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          r.status === "approved" && "bg-emerald-100 text-emerald-800",
                          r.status === "payment_submitted" && "bg-amber-100 text-amber-900",
                          r.status === "pending_payment" && "bg-slate-100 text-slate-700",
                          r.status === "rejected" && "bg-red-100 text-red-800"
                        )}
                      >
                        {membershipStatusLabel(r.status)}
                      </span>
                      {r.memberId ? (
                        <p className="mt-1 font-mono text-xs font-semibold text-gcs-primary">{r.memberId}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {r.status === "payment_submitted" ? (
                          <>
                            <CmsButton
                              type="button"
                              disabled={busyId === r.id}
                              onClick={() => void approve(r.id)}
                              className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden />
                              Approve
                            </CmsButton>
                            <CmsButton
                              type="button"
                              variant="ghost"
                              disabled={busyId === r.id}
                              onClick={() => void reject(r.id)}
                              className="gap-1 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" aria-hidden />
                              Reject
                            </CmsButton>
                          </>
                        ) : r.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
                            Waiting
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === r.id ? (
                    <tr key={`${r.id}-detail`} className="bg-slate-50/80">
                      <td colSpan={6} className="px-4 py-4 text-sm text-slate-700">
                        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Job title</dt>
                            <dd>{r.jobTitle || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Phone</dt>
                            <dd>{r.phone || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Highest degree</dt>
                            <dd>{r.highestDegree || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Declaration name</dt>
                            <dd>{r.declarationLegalName}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Declaration date</dt>
                            <dd>{r.declarationDate}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Payment method</dt>
                            <dd>{r.paymentMethod ? membershipPaymentMethodLabel(r.paymentMethod) : "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-slate-400">Paid at</dt>
                            <dd>{r.paidAt ? new Date(r.paidAt).toLocaleString() : "—"}</dd>
                          </div>
                          {r.paymentNote ? (
                            <div>
                              <dt className="text-xs font-semibold uppercase text-slate-400">Transfer ref</dt>
                              <dd className="font-mono text-xs">{r.paymentNote}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CmsCard>

      <CmsCard className="border-dashed border-gcs-primary/25 bg-gcs-primary/[0.03] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-slate-900">Paystack</p>
            <p className="mt-1 text-sm text-slate-600">
              MoMo, card, and USSD are collected via Paystack when the member pays. Bank transfers are submitted manually
              and verified here. Webhooks are optional — not required for checkout to work.
            </p>
          </div>
        </div>
      </CmsCard>

      {emailPreview ? (
        <CmsCard className="p-6 ring-2 ring-emerald-200/80">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-emerald-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Email preview (mock send)</p>
              <p className="mt-1 text-xs text-slate-500">To: {emailPreview.to}</p>
              <p className="text-xs text-slate-500">Subject: {emailPreview.subject}</p>
              <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                {emailPreview.body}
              </pre>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-gcs-primary hover:underline"
                onClick={() => setEmailPreview(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </CmsCard>
      ) : null}
    </div>
  );
}
