"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsMetricCard, CmsPageHero } from "@/components/cms/cms-page-chrome";
import { CmsButton, CmsCard } from "@/components/cms/cms-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { handleCmsResponse, notifyCmsError, notifyCmsSuccess } from "@/lib/cms-toast";
import { refreshCmsNotifications } from "@/components/cms/cms-nav-badges";
import {
  formatGhs,
  MEMBERSHIP_FEE_GHS,
  membershipPaymentStatusLabel,
  membershipStatusLabel,
  type MembershipApplicationRow,
} from "@/lib/membership-application";
import { membershipAnnualStatusLabel } from "@/lib/membership-annual-status";
import { membershipPaymentMethodLabel } from "@/lib/membership-payment-methods";
import { membershipApplicationMatchesSearch } from "@/lib/membership-payments-export";
import { cn } from "@/lib/utils";

type Dashboard = {
  pendingVerification: number;
  verifiedRevenueGhs: number;
  verifiedCount: number;
  awaitingVerificationGhs: number;
  awaitingVerificationCount: number;
  approved: number;
  activeMembers: number;
  inactiveMembers: number;
  rejected: number;
  pendingPayment: number;
};

type Tab = "verify" | "all" | "approved" | "rejected";

type ApprovalEmailNotice = {
  sent: boolean;
  to: string;
  mode?: string;
  error?: string;
  subject?: string;
  loginUrl?: string;
};

type PendingAction =
  | { kind: "delete"; row: MembershipApplicationRow }
  | { kind: "delete_many"; rows: MembershipApplicationRow[] }
  | { kind: "reject"; row: MembershipApplicationRow };

const TABS: { id: Tab; label: string }[] = [
  { id: "verify", label: "Awaiting approval" },
  { id: "all", label: "All applications" },
  { id: "approved", label: "Approved members" },
  { id: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: MembershipApplicationRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status === "approved" && "bg-emerald-100 text-emerald-800",
        status === "payment_submitted" && "bg-amber-100 text-amber-900",
        status === "pending_payment" && "bg-slate-100 text-slate-700",
        status === "rejected" && "bg-red-100 text-red-800"
      )}
    >
      {membershipStatusLabel(status)}
    </span>
  );
}

export function MembershipCmsDashboard() {
  const [tab, setTab] = useState<Tab>("verify");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<MembershipApplicationRow[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<ApprovalEmailNotice | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setErr(null);
    const q = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
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
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => void load(), search.trim() ? 280 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab === "verify") {
      list = list.filter((r) => r.status === "payment_submitted" && r.paymentStatus === "submitted");
    } else if (tab === "approved") {
      list = list.filter((r) => r.status === "approved");
    } else if (tab === "rejected") {
      list = list.filter((r) => r.status === "rejected");
    }
    if (search.trim()) {
      list = list.filter((r) => membershipApplicationMatchesSearch(r, search));
    }
    return list;
  }, [rows, tab, search]);

  const tabCounts = useMemo(
    () => ({
      verify: rows.filter((r) => r.status === "payment_submitted" && r.paymentStatus === "submitted").length,
      all: rows.length,
      approved: rows.filter((r) => r.status === "approved").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    }),
    [rows]
  );

  const selectedRows = useMemo(
    () => filtered.filter((r) => selectedIds.has(r.id)),
    [filtered, selectedIds]
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someFilteredSelected = filtered.some((r) => selectedIds.has(r.id));

  useEffect(() => {
    setSelectedIds(new Set());
  }, [tab, search]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
  }, [someFilteredSelected, allFilteredSelected]);

  function toggleRowSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const r of filtered) next.delete(r.id);
      } else {
        for (const r of filtered) next.add(r.id);
      }
      return next;
    });
  }

  function openBulkDelete() {
    if (selectedRows.length === 0) return;
    setPendingAction({ kind: "delete_many", rows: selectedRows });
  }

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/cms/membership-applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as { email?: ApprovalEmailNotice } | null;
    const isApprove = body.action === "approve";
    const isDelete = body.action === "delete";
    if (
      await handleCmsResponse(
        res,
        isApprove ? "Member approved" : isDelete ? "Record deleted" : "Updated",
        { setErr }
      )
    ) {
      if (isApprove && data?.email) {
        setEmailNotice(data.email);
        if (data.email.sent) {
          notifyCmsSuccess(
            data.email.mode === "logged" ? "Approved — email logged (dev)" : "Approved — welcome email sent",
            data.email.to
          );
        } else {
          notifyCmsError("Approved, but email not sent", data.email.error);
        }
      }
      await load();
      refreshCmsNotifications();
      return true;
    }
    return false;
  }

  async function approve(id: string) {
    setBusyId(id);
    await patch({ action: "approve", applicationId: id });
    setBusyId(null);
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setDialogBusy(true);
    try {
      if (pendingAction.kind === "reject") {
        const { row } = pendingAction;
        setBusyId(row.id);
        const ok = await patch({ action: "reject", applicationId: row.id });
        if (ok) setPendingAction(null);
        setBusyId(null);
      } else if (pendingAction.kind === "delete_many") {
        const ids = pendingAction.rows.map((r) => r.id);
        const res = await fetch("/api/cms/membership-applications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify({ action: "delete_many", applicationIds: ids }),
        });
        const data = (await res.json().catch(() => null)) as { deleted?: number } | null;
        const count = data?.deleted ?? ids.length;
        if (await handleCmsResponse(res, `Removed ${count} record${count === 1 ? "" : "s"}`)) {
          setPendingAction(null);
          setSelectedIds(new Set());
          if (expanded && ids.includes(expanded)) setExpanded(null);
          await load();
          refreshCmsNotifications();
        }
      } else {
        const { row } = pendingAction;
        setBusyId(row.id);
        const ok = await patch({ action: "delete", applicationId: row.id });
        if (ok) {
          setPendingAction(null);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(row.id);
            return next;
          });
          if (expanded === row.id) setExpanded(null);
        }
        setBusyId(null);
      }
    } finally {
      setDialogBusy(false);
    }
  }

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-gcs-muted-text">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading membership…
        </p>
      </div>
    );
  }

  const deleteTargets =
    pendingAction?.kind === "delete"
      ? [pendingAction.row]
      : pendingAction?.kind === "delete_many"
        ? pendingAction.rows
        : [];
  const isBulkDelete = pendingAction?.kind === "delete_many";
  const dialogRow =
    pendingAction?.kind === "reject" ? pendingAction.row : deleteTargets[0];
  const approvedDeleteCount = deleteTargets.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-8 pb-8">
      <CmsPageHero
        eyebrow="Membership"
        title="Applications & payments"
        description={`Review new members, confirm payments (${formatGhs(MEMBERSHIP_FEE_GHS)} annual fee), and manage member records.`}
        icon={Wallet}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/cms/settings">
              <CmsButton type="button" variant="ghost" className="gap-2">
                <Settings className="h-4 w-4" aria-hidden />
                Settings
              </CmsButton>
            </Link>
            <CmsButton type="button" variant="ghost" onClick={() => void load()} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </CmsButton>
          </div>
        }
      />

      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>
      ) : null}

      {dashboard ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CmsMetricCard
            label="Awaiting approval"
            value={String(dashboard.pendingVerification)}
            hint={`${formatGhs(dashboard.awaitingVerificationGhs)} received`}
            icon={Clock}
            variant="warning"
          />
          <CmsMetricCard
            label="Payments received"
            value={formatGhs(dashboard.verifiedRevenueGhs)}
            hint={`${dashboard.verifiedCount} confirmed`}
            icon={Banknote}
            variant="success"
          />
          <CmsMetricCard
            label="Active members"
            value={String(dashboard.activeMembers)}
            hint={`${dashboard.inactiveMembers} need renewal`}
            icon={BadgeCheck}
          />
          <CmsMetricCard
            label="Not yet paid"
            value={String(dashboard.pendingPayment)}
            hint={`${dashboard.rejected} declined`}
            icon={CreditCard}
            variant="neutral"
          />
        </div>
      ) : null}

      <CmsCard className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-4 md:px-6">
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or member ID…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gcs-foreground shadow-sm outline-none ring-gcs-primary/20 transition focus:border-gcs-primary focus:ring-2"
              aria-label="Search members"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === id
                    ? "bg-gcs-primary text-white shadow-md shadow-gcs-primary/25"
                    : "bg-white text-gcs-muted-text ring-1 ring-slate-200 hover:text-gcs-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "ml-2 rounded-full px-2 py-0.5 text-xs font-bold",
                    tab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {tabCounts[id]}
                </span>
              </button>
            ))}
          </div>

          {selectedIds.size > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-3">
              <span className="text-sm font-semibold text-red-900">
                {selectedIds.size} selected
              </span>
              <CmsButton
                type="button"
                variant="danger"
                className="gap-2"
                disabled={dialogBusy}
                onClick={openBulkDelete}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete selected
              </CmsButton>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-sm font-medium text-red-800/90 hover:underline"
              >
                Clear selection
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-11 px-3 py-3.5">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    disabled={filtered.length === 0 || dialogBusy}
                    className="h-4 w-4 rounded border-slate-300 text-gcs-primary focus:ring-gcs-primary/30"
                    aria-label="Select all in this view"
                  />
                </th>
                <th className="px-5 py-3.5">Member / applicant</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Annual</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-gcs-foreground">No applications in this view</p>
                    <p className="mt-1 text-xs text-gcs-muted-text">Try another tab or clear your search</p>
                  </td>
                </tr>
              ) : null}
              {filtered.map((r) => {
                const needsAction = r.status === "payment_submitted" && r.paymentStatus === "submitted";
                const isApprovedMember = r.status === "approved";
                return (
                  <Fragment key={r.id}>
                    <tr
                      className={cn(
                        "border-b border-slate-50 transition-colors",
                        selectedIds.has(r.id) && "bg-gcs-primary/[0.04]",
                        needsAction && !r.read && "bg-amber-50/50",
                        expanded === r.id && "bg-slate-50/80"
                      )}
                    >
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleRowSelected(r.id)}
                          disabled={dialogBusy}
                          className="h-4 w-4 rounded border-slate-300 text-gcs-primary focus:ring-gcs-primary/30"
                          aria-label={`Select ${r.fullName}`}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        >
                          <p className="font-semibold text-gcs-foreground">{r.fullName}</p>
                          <p className="text-xs text-slate-500">{r.email}</p>
                          {r.memberId ? (
                            <p className="mt-0.5 font-mono text-xs font-semibold text-gcs-primary">{r.memberId}</p>
                          ) : (
                            <p className="mt-0.5 text-xs text-slate-400">{r.institution}</p>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-base font-semibold text-gcs-foreground">{formatGhs(r.amountGhs)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {membershipPaymentStatusLabel(r.paymentStatus)}
                        </p>
                        {r.paymentMethod ? (
                          <p className="text-xs text-gcs-muted-text">{membershipPaymentMethodLabel(r.paymentMethod)}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        {r.status === "approved" ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                              r.annualMembershipStatus === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {membershipAnnualStatusLabel(r.annualMembershipStatus)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(r.paidAt ?? r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {needsAction ? (
                            <>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => void approve(r.id)}
                                title="Approve and issue member ID"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={busyId === r.id}
                                onClick={() => setPendingAction({ kind: "reject", row: r })}
                                title="Decline application"
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" aria-hidden />
                                Decline
                              </button>
                            </>
                          ) : isApprovedMember ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                              Issued
                            </span>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => setPendingAction({ kind: "delete", row: r })}
                            title={
                              isApprovedMember
                                ? "Remove member and payment record"
                                : "Remove application and payment record"
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === r.id ? (
                      <tr className="bg-slate-50/60">
                        <td colSpan={8} className="px-5 py-4">
                          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <dt className="text-[0.65rem] font-semibold uppercase text-slate-400">Phone</dt>
                              <dd className="mt-0.5 text-slate-800">{r.phone || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-[0.65rem] font-semibold uppercase text-slate-400">Paid at</dt>
                              <dd className="mt-0.5 text-slate-800">
                                {r.paidAt ? new Date(r.paidAt).toLocaleString() : "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[0.65rem] font-semibold uppercase text-slate-400">Approved</dt>
                              <dd className="mt-0.5 text-slate-800">
                                {r.approvedAt ? new Date(r.approvedAt).toLocaleString() : "—"}
                              </dd>
                            </div>
                            {r.paystackReference ? (
                              <div>
                                <dt className="text-[0.65rem] font-semibold uppercase text-gcs-muted-text">Reference</dt>
                                <dd className="mt-0.5 text-xs text-gcs-foreground">{r.paystackReference}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CmsCard>

      {emailNotice ? (
        <CmsCard className={cn("p-5", emailNotice.sent ? "ring-2 ring-emerald-200" : "ring-2 ring-amber-200")}>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 text-gcs-primary" aria-hidden />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-gcs-foreground">
                {emailNotice.sent ? "Welcome email sent" : "Welcome email not sent"}
              </p>
              <p className="mt-1 text-gcs-muted-text">{emailNotice.to}</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-gcs-primary hover:underline"
                onClick={() => setEmailNotice(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </CmsCard>
      ) : null}

      <ConfirmDialog
        open={pendingAction?.kind === "delete" || pendingAction?.kind === "delete_many"}
        variant="danger"
        title={
          isBulkDelete
            ? `Remove ${deleteTargets.length} records?`
            : dialogRow?.status === "approved"
              ? "Remove this member and payment record?"
              : "Remove this application?"
        }
        description={
          isBulkDelete ? (
            <>
              You are about to permanently remove{" "}
              <span className="font-semibold text-slate-900">{deleteTargets.length}</span> membership
              {deleteTargets.length === 1 ? " record" : " records"} from the system.
            </>
          ) : dialogRow ? (
            <>
              You are about to permanently remove{" "}
              <span className="font-semibold text-slate-900">{dialogRow.fullName}</span> ({dialogRow.email}
              {dialogRow.memberId ? (
                <>
                  , member ID <span className="font-mono font-semibold">{dialogRow.memberId}</span>
                </>
              ) : null}
              ).
            </>
          ) : null
        }
        highlights={
          <ul className="space-y-1.5">
            {isBulkDelete ? (
              <>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>All selected applications and payment data will be deleted. This cannot be undone.</span>
                </li>
                {approvedDeleteCount > 0 ? (
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      Includes {approvedDeleteCount} approved member
                      {approvedDeleteCount === 1 ? "" : "s"} who will lose portal access.
                    </span>
                  </li>
                ) : null}
                <li className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-slate-200/80 bg-white/80 p-2 text-xs text-slate-700">
                  {deleteTargets.slice(0, 8).map((r) => (
                    <div key={r.id} className="py-0.5">
                      {r.fullName}
                      {r.memberId ? ` · ${r.memberId}` : ""}
                    </div>
                  ))}
                  {deleteTargets.length > 8 ? (
                    <p className="pt-1 font-medium text-slate-500">+ {deleteTargets.length - 8} more</p>
                  ) : null}
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>
                    Payment record ({formatGhs(dialogRow?.amountGhs ?? MEMBERSHIP_FEE_GHS)}) and application data will be
                    deleted.
                  </span>
                </li>
                {dialogRow?.status === "approved" ? (
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>This member will lose portal access. Export from Settings first if you need a backup.</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>This cannot be undone. Export from Settings if you need a backup.</span>
                  </li>
                )}
              </>
            )}
          </ul>
        }
        confirmLabel={
          isBulkDelete
            ? `Remove ${deleteTargets.length} records`
            : dialogRow?.status === "approved"
              ? "Remove member"
              : "Remove application"
        }
        cancelLabel={isBulkDelete ? "Keep records" : "Keep record"}
        loading={dialogBusy}
        onConfirm={() => void confirmPendingAction()}
        onCancel={() => {
          if (!dialogBusy) setPendingAction(null);
        }}
      />

      <ConfirmDialog
        open={pendingAction?.kind === "reject"}
        variant="warning"
        title="Decline this application?"
        description={
          dialogRow ? (
            <>
              <span className="font-semibold text-slate-900">{dialogRow.fullName}</span> will not receive a member ID.
              Payment may already have been received — handle refunds outside the system if needed.
            </>
          ) : null
        }
        highlights={
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span>The applicant can be removed later from this list if you need to free space.</span>
            </li>
          </ul>
        }
        confirmLabel="Decline application"
        cancelLabel="Cancel"
        loading={dialogBusy}
        onConfirm={() => void confirmPendingAction()}
        onCancel={() => {
          if (!dialogBusy) setPendingAction(null);
        }}
      />
    </div>
  );
}
