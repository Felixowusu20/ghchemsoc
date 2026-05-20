"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Archive,
  Calendar,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
import { CmsPageHero } from "@/components/cms/cms-page-chrome";
import { CmsButton, CmsCard, CmsFieldLabel } from "@/components/cms/cms-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cmsCredentials } from "@/lib/cms-fetch";
import { handleCmsResponse, notifyCmsError, notifyCmsSuccess } from "@/lib/cms-toast";
import { formatGhs, MEMBERSHIP_FEE_GHS, yearRangeOptions } from "@/lib/membership-fee";
import { cn } from "@/lib/utils";

type ArchivePreview = {
  year: number;
  totalInYear: number;
  canDelete: number;
  keptApproved: number;
  keptPendingVerification: number;
  canArchiveYear: boolean;
};

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof SettingsIcon;
  children: ReactNode;
}) {
  return (
    <CmsCard>
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-gcs-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gcs-muted-text">{description}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </CmsCard>
  );
}

export function CmsSettingsDashboard() {
  const years = yearRangeOptions(10);
  const currentYear = new Date().getUTCFullYear();
  const pastYears = years.filter((y) => y < currentYear);

  const [exportYear, setExportYear] = useState(currentYear);
  const [exporting, setExporting] = useState(false);

  const [archiveYear, setArchiveYear] = useState(pastYears[0] ?? currentYear - 1);
  const [archivePreview, setArchivePreview] = useState<ArchivePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [confirmArchiveYear, setConfirmArchiveYear] = useState("");
  const [archiveBusy, setArchiveBusy] = useState(false);

  const loadArchivePreview = useCallback(async (year: number) => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/cms/membership-applications/archive?year=${year}`, cmsCredentials);
      if (!res.ok) {
        setArchivePreview(null);
        return;
      }
      setArchivePreview((await res.json()) as ArchivePreview);
    } catch {
      setArchivePreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (archiveYear >= currentYear) return;
    void loadArchivePreview(archiveYear);
  }, [archiveYear, currentYear, loadArchivePreview]);

  async function downloadExport() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/cms/membership-applications/export?year=${exportYear}&scope=payments`,
        cmsCredentials
      );
      if (!res.ok) {
        notifyCmsError("Export failed", await res.text());
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gcs-membership-payments-${exportYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      notifyCmsSuccess("Download started", `Membership payments for ${exportYear}`);
    } catch {
      notifyCmsError("Export failed", "Could not reach the server.");
    } finally {
      setExporting(false);
    }
  }

  async function runYearArchive() {
    if (confirmArchiveYear !== String(archiveYear)) {
      notifyCmsError("Confirmation required", `Type ${archiveYear} to confirm.`);
      return;
    }
    setArchiveBusy(true);
    try {
      const res = await fetch("/api/cms/membership-applications/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...cmsCredentials,
        body: JSON.stringify({ year: archiveYear, confirmYear: archiveYear }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (await handleCmsResponse(res, data?.message ?? "Clean-up complete")) {
        setConfirmArchiveYear("");
        setArchiveDialogOpen(false);
        await loadArchivePreview(archiveYear);
      }
    } finally {
      setArchiveBusy(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <CmsPageHero
        eyebrow="Administration"
        title="Settings"
        description="Membership fees, exports, record clean-up, and shortcuts to other admin areas."
        icon={SettingsIcon}
      />

      <SettingsSection
        title="Membership"
        description="Current fee and how member status is calculated on the site."
        icon={Wallet}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
            <dt className="text-xs font-medium text-gcs-muted-text">Annual membership fee</dt>
            <dd className="mt-1 text-lg font-semibold text-gcs-foreground">{formatGhs(MEMBERSHIP_FEE_GHS)}</dd>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
            <dt className="text-xs font-medium text-gcs-muted-text">Active membership period</dt>
            <dd className="mt-1 text-sm font-medium text-gcs-foreground">12 months from payment or approval</dd>
          </div>
        </dl>
        <Link
          href="/cms/membership"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gcs-primary hover:underline"
        >
          Open membership approvals
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </SettingsSection>

      <SettingsSection
        title="Export payment records"
        description="Download a spreadsheet of membership payments for your records or auditors. Export a year before removing old applications."
        icon={FileSpreadsheet}
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <CmsFieldLabel>Calendar year</CmsFieldLabel>
            <select
              value={exportYear}
              onChange={(e) => setExportYear(Number(e.target.value))}
              className="mt-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-gcs-foreground shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <CmsButton type="button" onClick={() => void downloadExport()} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            Download CSV
          </CmsButton>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Clean up old applications"
        description="Remove incomplete or declined applications from past years. Approved members are always kept."
        icon={Archive}
      >
        {pastYears.length === 0 ? (
          <p className="text-sm text-gcs-muted-text">No past years are available for clean-up yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <CmsFieldLabel>Year to clean</CmsFieldLabel>
                <select
                  value={archiveYear}
                  onChange={(e) => setArchiveYear(Number(e.target.value))}
                  className="mt-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-gcs-foreground shadow-sm"
                >
                  {pastYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <CmsButton
                type="button"
                variant="danger"
                disabled={!archivePreview?.canDelete || previewLoading}
                onClick={() => {
                  setConfirmArchiveYear("");
                  setArchiveDialogOpen(true);
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Remove old records
              </CmsButton>
            </div>

            <div
              className={cn(
                "mt-4 rounded-xl border px-4 py-3 text-sm",
                previewLoading
                  ? "border-slate-200 bg-slate-50/80 text-gcs-muted-text"
                  : archivePreview && archivePreview.canDelete > 0
                    ? "border-amber-200/80 bg-amber-50/50 text-amber-950"
                    : "border-slate-200 bg-slate-50/50 text-gcs-muted-text"
              )}
            >
              {previewLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Checking records…
                </span>
              ) : archivePreview ? (
                <ul className="space-y-1.5">
                  <li>
                    <span className="font-medium">{archivePreview.canDelete}</span> application
                    {archivePreview.canDelete === 1 ? "" : "s"} can be removed for {archiveYear}
                  </li>
                  <li>
                    {archivePreview.keptApproved} approved member
                    {archivePreview.keptApproved === 1 ? "" : "s"} will be kept
                  </li>
                  {archivePreview.keptPendingVerification > 0 ? (
                    <li>
                      {archivePreview.keptPendingVerification} awaiting approval (not removed by bulk clean-up)
                    </li>
                  ) : null}
                  {archivePreview.canDelete === 0 ? (
                    <li className="pt-1 text-gcs-muted-text">Nothing to remove for this year.</li>
                  ) : null}
                </ul>
              ) : (
                <p>Could not load preview. Try again shortly.</p>
              )}
            </div>
          </>
        )}
      </SettingsSection>

      <SettingsSection
        title="Site & inboxes"
        description="Jump to other areas of the admin panel."
        icon={Shield}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/cms/analytics", label: "Analytics" },
            { href: "/cms/membership", label: "Membership approvals" },
            { href: "/cms/contact-inquiries", label: "Contact messages" },
            { href: "/cms/registration-inbox", label: "Event sign-ups" },
            { href: "/cms/site-footer", label: "Site footer" },
            { href: "/cms/contact", label: "Contact page" },
            { href: "/cms/member-portal", label: "Member portal content" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-gcs-foreground transition hover:border-gcs-primary/25 hover:bg-gcs-primary/[0.03]"
              >
                {item.label}
                <ExternalLink className="h-3.5 w-3.5 text-gcs-muted-text" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <SettingsSection
        title="Data handling"
        description="Good practice when managing member records."
        icon={Calendar}
      >
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gcs-muted-text">
          <li>Export payment data for a year before running bulk clean-up.</li>
          <li>Remove individual applications from the membership approvals page when needed.</li>
          <li>Approved members can be removed individually from Membership approvals when necessary.</li>
        </ul>
      </SettingsSection>

      <ConfirmDialog
        open={archiveDialogOpen}
        variant="warning"
        title={`Remove old applications from ${archiveYear}?`}
        description="Only incomplete and declined applications from this year will be deleted. Approved members stay in the system."
        highlights={
          <div className="space-y-3">
            {archivePreview ? (
              <p>
                <span className="font-semibold text-slate-800">{archivePreview.canDelete}</span> record
                {archivePreview.canDelete === 1 ? "" : "s"} will be permanently removed.
              </p>
            ) : null}
            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                Type <span className="font-semibold text-slate-900">{archiveYear}</span> to confirm
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={confirmArchiveYear}
                onChange={(e) => setConfirmArchiveYear(e.target.value)}
                placeholder={String(archiveYear)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gcs-foreground shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                autoComplete="off"
              />
            </label>
          </div>
        }
        confirmLabel="Remove records"
        cancelLabel="Cancel"
        loading={archiveBusy}
        confirmDisabled={confirmArchiveYear !== String(archiveYear)}
        onConfirm={() => void runYearArchive()}
        onCancel={() => {
          if (!archiveBusy) {
            setArchiveDialogOpen(false);
            setConfirmArchiveYear("");
          }
        }}
      />
    </div>
  );
}
