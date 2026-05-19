"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cmsCredentials } from "@/lib/cms-fetch";
import {
  CmsButton,
  CmsCard,
  CmsFieldLabel,
  CmsInput,
  CmsTextarea,
} from "@/components/cms/cms-ui";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { readCmsErrorResponse } from "@/lib/cms-api-errors";
import { handleCmsResponse } from "@/lib/cms-toast";
import type { MemberBenefitSection } from "@/lib/member-portal";

type PortalSettings = {
  dashboardEyebrow: string;
  dashboardTitle: string;
  dashboardLead: string;
  benefitsTitle: string;
  benefitsLead: string;
  resourcesTitle: string;
  resourcesLead: string;
};

type BenefitRow = {
  id: string;
  section: MemberBenefitSection;
  title: string;
  description: string;
  body: string | null;
  href: string | null;
  iconKey: string;
  hint: string | null;
  sortOrder: number;
  published: boolean;
};

const SECTIONS: { id: MemberBenefitSection; label: string }[] = [
  { id: "dashboard", label: "Overview highlights" },
  { id: "benefits", label: "Benefits page" },
  { id: "resources", label: "Resources page" },
];

const emptyBenefit = {
  section: "benefits" as MemberBenefitSection,
  title: "",
  description: "",
  body: "",
  href: "",
  iconKey: "book",
  hint: "",
  sortOrder: 0,
  published: true,
};

export function MemberPortalCmsClient() {
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [benefits, setBenefits] = useState<BenefitRow[]>([]);
  const [iconOptions, setIconOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [benefitForm, setBenefitForm] = useState(emptyBenefit);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<MemberBenefitSection>("dashboard");
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setStorageWarning(null);
    const res = await fetch("/api/cms/member-portal", cmsCredentials);
    if (!res.ok) {
      setErr(await readCmsErrorResponse(res));
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      settings: PortalSettings;
      benefits: BenefitRow[];
      iconOptions?: string[];
      meta?: { dbReady: boolean; message?: string };
    };
    setSettings(data.settings);
    setBenefits(data.benefits);
    setIconOptions(data.iconOptions ?? []);
    if (data.meta && data.meta.dbReady === false && data.meta.message) {
      setStorageWarning(data.meta.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/cms/member-portal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(settings),
    });
    if (await handleCmsResponse(res, "Member portal copy saved", { setErr })) await load();
  }

  function startEditBenefit(row: BenefitRow) {
    setEditingBenefitId(row.id);
    setBenefitForm({
      section: row.section,
      title: row.title,
      description: row.description,
      body: row.body ?? "",
      href: row.href ?? "",
      iconKey: row.iconKey,
      hint: row.hint ?? "",
      sortOrder: row.sortOrder,
      published: row.published,
    });
    setActiveSection(row.section);
  }

  function resetBenefitForm() {
    setEditingBenefitId(null);
    setBenefitForm({ ...emptyBenefit, section: activeSection });
  }

  async function saveBenefit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      section: benefitForm.section,
      title: benefitForm.title.trim(),
      description: benefitForm.description.trim(),
      body: benefitForm.body.trim() || null,
      href: benefitForm.href.trim() || null,
      iconKey: benefitForm.iconKey,
      hint: benefitForm.hint.trim() || null,
      sortOrder: benefitForm.sortOrder,
      published: benefitForm.published,
    };

    const res = editingBenefitId
      ? await fetch(`/api/cms/member-benefits/${editingBenefitId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/member-benefits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });

    if (await handleCmsResponse(res, editingBenefitId ? "Benefit updated" : "Benefit added", { setErr })) {
      resetBenefitForm();
      await load();
    }
  }

  async function deleteBenefit(id: string) {
    const res = await fetch(`/api/cms/member-benefits/${id}`, {
      method: "DELETE",
      ...cmsCredentials,
    });
    if (await handleCmsResponse(res, "Benefit removed", { setErr })) {
      await load();
    }
  }

  const sectionBenefits = benefits.filter((b) => b.section === activeSection);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!settings) return <p className="text-sm text-red-700">{err ?? "Could not load settings."}</p>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Members</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Member portal</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Copy and benefit cards shown after members sign in at{" "}
            <Link href="/membership/account" className="font-medium text-gcs-primary hover:underline" target="_blank">
              /membership/account
            </Link>
            .
          </p>
        </div>
        <Link
          href="/membership/account"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-gcs-border px-4 py-2 text-sm font-medium text-gcs-primary hover:bg-gcs-primary/5"
        >
          Preview portal
          <ExternalLink className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      {storageWarning ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {storageWarning} You can preview default content below, but saving will not work until the database is ready.
        </p>
      ) : null}
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle description="Headlines and intro text on each member sub-page.">Page copy</CmsSectionTitle>
        <form className="mt-8 space-y-8" onSubmit={saveSettings}>
          <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-5">
            <p className="text-sm font-semibold text-slate-800">Overview (dashboard)</p>
            <label className="block">
              <CmsFieldLabel>Eyebrow</CmsFieldLabel>
              <CmsInput
                value={settings.dashboardEyebrow}
                onChange={(e) => setSettings((s) => (s ? { ...s, dashboardEyebrow: e.target.value } : s))}
              />
            </label>
            <label className="block">
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput
                value={settings.dashboardTitle}
                onChange={(e) => setSettings((s) => (s ? { ...s, dashboardTitle: e.target.value } : s))}
              />
            </label>
            <label className="block">
              <CmsFieldLabel>Lead paragraph</CmsFieldLabel>
              <CmsTextarea
                rows={3}
                value={settings.dashboardLead}
                onChange={(e) => setSettings((s) => (s ? { ...s, dashboardLead: e.target.value } : s))}
              />
            </label>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-5">
            <p className="text-sm font-semibold text-slate-800">Benefits page</p>
            <label className="block">
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput
                value={settings.benefitsTitle}
                onChange={(e) => setSettings((s) => (s ? { ...s, benefitsTitle: e.target.value } : s))}
              />
            </label>
            <label className="block">
              <CmsFieldLabel>Lead paragraph</CmsFieldLabel>
              <CmsTextarea
                rows={3}
                value={settings.benefitsLead}
                onChange={(e) => setSettings((s) => (s ? { ...s, benefitsLead: e.target.value } : s))}
              />
            </label>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-5">
            <p className="text-sm font-semibold text-slate-800">Resources page</p>
            <label className="block">
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput
                value={settings.resourcesTitle}
                onChange={(e) => setSettings((s) => (s ? { ...s, resourcesTitle: e.target.value } : s))}
              />
            </label>
            <label className="block">
              <CmsFieldLabel>Lead paragraph</CmsFieldLabel>
              <CmsTextarea
                rows={3}
                value={settings.resourcesLead}
                onChange={(e) => setSettings((s) => (s ? { ...s, resourcesLead: e.target.value } : s))}
              />
            </label>
          </div>

          <CmsButton type="submit">Save copy</CmsButton>
        </form>
      </CmsCard>

      <CmsCard className="p-8">
        <CmsSectionTitle description="Cards grouped by which member page they appear on.">
          Benefit &amp; resource cards
        </CmsSectionTitle>

        <div className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveSection(id);
                if (!editingBenefitId) setBenefitForm((f) => ({ ...f, section: id }));
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeSection === id
                  ? "bg-gcs-primary text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-gcs-primary/30"
              }`}
            >
              {label}
              <span className="ml-2 opacity-80">({benefits.filter((b) => b.section === id).length})</span>
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-4">
          {sectionBenefits.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No cards in this section yet.
            </li>
          ) : (
            sectionBenefits.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{row.title}</p>
                    {!row.published ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        Draft
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{row.description}</p>
                  {row.href ? <p className="mt-1 font-mono text-xs text-slate-500">{row.href}</p> : null}
                </div>
                <CmsListActions
                  onEdit={() => startEditBenefit(row)}
                  onDelete={() => deleteBenefit(row.id)}
                  confirm={{
                    title: "Delete this benefit card?",
                    description: (
                      <>
                        The card{" "}
                        <span className="font-semibold text-slate-900">&ldquo;{row.title}&rdquo;</span>{" "}
                        will be removed from the member portal immediately.
                      </>
                    ),
                    highlights: (
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <span>This action cannot be undone.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <span>
                            Tip: you can also keep it but uncheck <em>Published on live site</em> to hide it
                            temporarily.
                          </span>
                        </li>
                      </ul>
                    ),
                    confirmLabel: "Delete card",
                  }}
                />
              </li>
            ))
          )}
        </ul>

        <form className="mt-8 space-y-5 border-t border-slate-200 pt-8" onSubmit={saveBenefit}>
          <p className="text-sm font-semibold text-slate-800">
            {editingBenefitId ? "Edit card" : "Add card"} — {SECTIONS.find((s) => s.id === benefitForm.section)?.label}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <CmsFieldLabel>Section</CmsFieldLabel>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={benefitForm.section}
                onChange={(e) => {
                  const section = e.target.value as MemberBenefitSection;
                  setBenefitForm((f) => ({ ...f, section }));
                  setActiveSection(section);
                }}
              >
                {SECTIONS.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <CmsFieldLabel>Icon</CmsFieldLabel>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={benefitForm.iconKey}
                onChange={(e) => setBenefitForm((f) => ({ ...f, iconKey: e.target.value }))}
              >
                {iconOptions.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput
                required
                value={benefitForm.title}
                onChange={(e) => setBenefitForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="md:col-span-2">
              <CmsFieldLabel>Short description</CmsFieldLabel>
              <CmsTextarea
                required
                rows={2}
                value={benefitForm.description}
                onChange={(e) => setBenefitForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="md:col-span-2">
              <CmsFieldLabel>Extra body (optional)</CmsFieldLabel>
              <CmsTextarea
                rows={3}
                value={benefitForm.body}
                onChange={(e) => setBenefitForm((f) => ({ ...f, body: e.target.value }))}
              />
            </label>
            <label>
              <CmsFieldLabel>Link URL (optional)</CmsFieldLabel>
              <CmsInput
                value={benefitForm.href}
                onChange={(e) => setBenefitForm((f) => ({ ...f, href: e.target.value }))}
                placeholder="/events"
              />
            </label>
            <label>
              <CmsFieldLabel>Badge hint (optional)</CmsFieldLabel>
              <CmsInput
                value={benefitForm.hint}
                onChange={(e) => setBenefitForm((f) => ({ ...f, hint: e.target.value }))}
                placeholder="Member rates"
              />
            </label>
            <label>
              <CmsFieldLabel>Sort order</CmsFieldLabel>
              <CmsInput
                type="number"
                value={benefitForm.sortOrder}
                onChange={(e) => setBenefitForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={benefitForm.published}
                onChange={(e) => setBenefitForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Published on live site</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <CmsButton type="submit">{editingBenefitId ? "Update card" : "Add card"}</CmsButton>
            {editingBenefitId ? (
              <CmsButton type="button" variant="ghost" onClick={resetBenefitForm}>
                Cancel edit
              </CmsButton>
            ) : null}
          </div>
        </form>
      </CmsCard>
    </div>
  );
}
