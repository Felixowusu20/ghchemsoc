"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Settings = {
  eyebrow: string;
  title: string;
  searchPlaceholder: string;
  showSearch: boolean;
  ctaLabel: string;
  ctaHref: string;
  footerNote: string;
};

type CardRow = {
  id: string;
  published: boolean;
  sortOrder: number;
  tag: string;
  title: string;
  accentPill: string;
  href: string;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

const emptyCard = {
  tag: "",
  title: "",
  accentPill: "",
  href: "",
  sortOrder: 0,
  published: true,
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
};

export function PartnershipsCmsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [form, setForm] = useState(emptyCard);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const [sRes, cRes] = await Promise.all([
      fetch("/api/cms/homepage-partnerships", cmsCredentials),
      fetch("/api/cms/partnership-cards", cmsCredentials),
    ]);
    if (!sRes.ok || !cRes.ok) {
      setErr(sRes.status === 401 || cRes.status === 401 ? "Sign in at /cms/login" : "Could not load partnerships");
      setLoading(false);
      return;
    }
    const s = (await sRes.json()) as Settings & { showSearch: boolean };
    setSettings({
      ...s,
      showSearch: s.showSearch,
    });
    setRows((await cRes.json()) as CardRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/cms/homepage-partnerships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(settings),
    });
    await handleCmsResponse(res, "Section settings saved", { setErr });
  }

  function startEdit(row: CardRow) {
    setEditingId(row.id);
    setForm({
      tag: row.tag,
      title: row.title,
      accentPill: row.accentPill,
      href: row.href,
      sortOrder: row.sortOrder,
      published: row.published,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      imageAlt: row.imageAlt,
    });
  }

  function resetCardForm() {
    setEditingId(null);
    setForm(emptyCard);
  }

  async function saveCard(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) {
      setErr("Upload a card image.");
      return;
    }
    const payload = {
      tag: form.tag,
      title: form.title,
      accentPill: form.accentPill || null,
      href: form.href || null,
      published: form.published,
      sortOrder: form.sortOrder,
      imageUrl: form.imageUrl,
      imagePublicId: form.imagePublicId,
      imageAlt: form.imageAlt || form.title,
    };
    const res = editingId
      ? await fetch(`/api/cms/partnership-cards/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/partnership-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });
    if (await handleCmsResponse(res, editingId ? "Partner card updated" : "Partner card added", { setErr })) {
      resetCardForm();
      await load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/cms/partnership-cards/${id}`, { method: "DELETE", ...cmsCredentials });
    if (await handleCmsResponse(res, "Partner card deleted", { setErr })) {
      if (editingId === id) resetCardForm();
      await load();
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public homepage</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Partnership cards</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Image cards with category tags — shown on the homepage where facilities used to appear.
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      {settings ? (
        <CmsCard className="p-8">
          <CmsSectionTitle>Section header</CmsSectionTitle>
          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={saveSettings}>
            <label>
              <CmsFieldLabel>Eyebrow</CmsFieldLabel>
              <CmsInput value={settings.eyebrow} onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Search placeholder</CmsFieldLabel>
              <CmsInput
                value={settings.searchPlaceholder}
                onChange={(e) => setSettings({ ...settings, searchPlaceholder: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={settings.showSearch}
                onChange={(e) => setSettings({ ...settings, showSearch: e.target.checked })}
              />
              Show search bar
            </label>
            <label>
              <CmsFieldLabel>Button label</CmsFieldLabel>
              <CmsInput value={settings.ctaLabel} onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Button link</CmsFieldLabel>
              <CmsInput value={settings.ctaHref} onChange={(e) => setSettings({ ...settings, ctaHref: e.target.value })} />
            </label>
            <label className="md:col-span-2">
              <CmsFieldLabel>Footer note (optional)</CmsFieldLabel>
              <CmsTextarea
                rows={2}
                value={settings.footerNote}
                onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
              />
            </label>
            <div className="md:col-span-2">
              <CmsButton type="submit">Save section settings</CmsButton>
            </div>
          </form>
        </CmsCard>
      ) : null}

      <CmsCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CmsSectionTitle>{editingId ? "Edit partner card" : "Add partner card"}</CmsSectionTitle>
          {editingId ? (
            <CmsButton type="button" variant="ghost" onClick={resetCardForm}>
              Cancel edit
            </CmsButton>
          ) : null}
        </div>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={saveCard}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Card image"
              folder="partnerships"
              required
              previewUrl={form.imageUrl || null}
              onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
            />
          </div>
          <label className="md:col-span-2">
            <CmsFieldLabel>Image alt</CmsFieldLabel>
            <CmsInput value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Category tag</CmsFieldLabel>
            <CmsInput
              required
              placeholder="Industry"
              value={form.tag}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
            />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Card title</CmsFieldLabel>
            <CmsInput
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label>
            <CmsFieldLabel>Accent pill (optional)</CmsFieldLabel>
            <CmsInput
              placeholder="National voice"
              value={form.accentPill}
              onChange={(e) => setForm((f) => ({ ...f, accentPill: e.target.value }))}
            />
          </label>
          <label>
            <CmsFieldLabel>Link (optional)</CmsFieldLabel>
            <CmsInput
              placeholder="/contact or https://…"
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Published on homepage
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit">{editingId ? "Save card" : "Add card"}</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>Partner cards</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                {r.imageUrl ? (
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={r.imageUrl} alt={r.imageAlt || r.title} fill className="object-cover" sizes="80px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gcs-primary">
                    {r.published ? "Live" : "Draft"} · {r.tag} · sort {r.sortOrder}
                  </p>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                </div>
                <CmsListActions
                  onEdit={() => startEdit(r)}
                  onDelete={() => remove(r.id)}
                  confirm={{
                    title: "Delete this partner card?",
                    description: (
                      <>
                        <span className="font-semibold text-slate-900">&ldquo;{r.title}&rdquo;</span>{" "}
                        will be removed from the homepage Partnerships strip.
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
                          <span>Prefer to keep it? Edit the card and uncheck <em>Published</em> instead.</span>
                        </li>
                      </ul>
                    ),
                    confirmLabel: "Delete card",
                  }}
                />
              </CmsCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
