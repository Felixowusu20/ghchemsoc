"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  FileText,
  FolderOpen,
  Link2,
  Play,
  Sparkles,
} from "lucide-react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsVideoSource } from "@/components/cms/cms-video-source";
import { CmsDocumentSource } from "@/components/cms/cms-document-source";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";
import { SOCIETY_RESOURCE_KINDS } from "@/lib/society-resources";
import type { SocietyResourceCmsDto } from "@/lib/society-resources-cms";
import type { SocietyResourceKind } from "@prisma/client";
import { cn } from "@/lib/utils";

type PageSettings = {
  eyebrow: string;
  headline: string;
  lead: string;
};

const emptyResource = {
  kind: "video" as SocietyResourceKind,
  title: "",
  description: "",
  url: "",
  urlPublicId: null as string | null,
  sortOrder: 0,
  published: true,
  publishedAt: "",
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
};

const KIND_ICONS = {
  video: Play,
  document: FileText,
  link: Link2,
  other: Sparkles,
} as const;

export function ResourcesCmsClient() {
  const [page, setPage] = useState<PageSettings | null>(null);
  const [rows, setRows] = useState<SocietyResourceCmsDto[]>([]);
  const [form, setForm] = useState(emptyResource);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const [pRes, rRes] = await Promise.all([
      fetch("/api/cms/resources-page", cmsCredentials),
      fetch("/api/cms/society-resources", cmsCredentials),
    ]);
    if (pRes.status === 401 || rRes.status === 401) {
      setErr(CMS_UNAUTHORIZED_MESSAGE);
      setLoading(false);
      return;
    }
    if (!pRes.ok || !rRes.ok) {
      setErr("Could not load resources.");
      setLoading(false);
      return;
    }
    setPage((await pRes.json()) as PageSettings);
    setRows((await rRes.json()) as SocietyResourceCmsDto[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    const res = await fetch("/api/cms/resources-page", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(page),
    });
    await handleCmsResponse(res, "Page intro saved", { setErr });
  }

  function startEdit(row: SocietyResourceCmsDto) {
    setEditingId(row.id);
    setForm({
      kind: row.kind,
      title: row.title,
      description: row.description,
      url: row.url,
      urlPublicId: row.urlPublicId,
      sortOrder: row.sortOrder,
      published: row.published,
      publishedAt: row.publishedAt ? row.publishedAt.slice(0, 10) : "",
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      imageAlt: row.imageAlt,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyResource);
  }

  async function saveResource(e: React.FormEvent) {
    e.preventDefault();
    if ((form.kind === "video" || form.kind === "document") && !form.url.trim()) {
      setErr(form.kind === "video" ? "Add a video upload or link." : "Add a document upload or link.");
      return;
    }

    const payload = {
      kind: form.kind,
      title: form.title,
      description: form.description,
      url: form.url.trim() || undefined,
      urlPublicId: form.urlPublicId,
      sortOrder: form.sortOrder,
      published: form.published,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      imageUrl: form.imageUrl.trim() || undefined,
      imagePublicId: form.imagePublicId,
      imageAlt: form.imageAlt.trim() || undefined,
      ...(editingId && !form.url.trim() ? { clearUrl: true } : {}),
    };

    const res = editingId
      ? await fetch(`/api/cms/society-resources/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/society-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });

    if (await handleCmsResponse(res, editingId ? "Resource updated" : "Resource added", { setErr })) {
      resetForm();
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource from the public page?")) return;
    const res = await fetch(`/api/cms/society-resources/${id}`, {
      method: "DELETE",
      ...cmsCredentials,
    });
    if (await handleCmsResponse(res, "Resource removed", { setErr })) {
      if (editingId === id) resetForm();
      await load();
    }
  }

  const publishedCount = rows.filter((r) => r.published).length;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gcs-primary border-t-transparent" />
        Loading resources…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      <header className="rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/90 p-8 shadow-sm md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public library</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Resources</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Publish conference recordings, slide decks, technical guides, and curated links. Upload videos from
              your computer or embed from YouTube and Vimeo.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-2xl font-bold tabular-nums text-slate-900">{rows.length}</p>
              <p className="text-xs font-medium text-slate-500">Total</p>
            </div>
            <div className="rounded-2xl border border-gcs-primary/20 bg-gcs-primary/5 px-5 py-4 text-center">
              <p className="text-2xl font-bold tabular-nums text-gcs-primary">{publishedCount}</p>
              <p className="text-xs font-medium text-slate-600">Live on site</p>
            </div>
          </div>
        </div>
      </header>

      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {page ? (
          <CmsCard className="h-fit p-6 md:p-8">
            <CmsSectionTitle description="Headline and introduction on the public Resources page.">
              Page intro
            </CmsSectionTitle>
            <form className="mt-6 space-y-4" onSubmit={savePage}>
              <label>
                <CmsFieldLabel>Eyebrow</CmsFieldLabel>
                <CmsInput
                  value={page.eyebrow}
                  onChange={(e) => setPage((p) => (p ? { ...p, eyebrow: e.target.value } : p))}
                />
              </label>
              <label>
                <CmsFieldLabel>Headline</CmsFieldLabel>
                <CmsInput
                  value={page.headline}
                  onChange={(e) => setPage((p) => (p ? { ...p, headline: e.target.value } : p))}
                />
              </label>
              <label>
                <CmsFieldLabel>Introduction</CmsFieldLabel>
                <CmsTextarea
                  rows={4}
                  value={page.lead}
                  onChange={(e) => setPage((p) => (p ? { ...p, lead: e.target.value } : p))}
                />
              </label>
              <CmsButton type="submit" variant="ghost">
                Save page intro
              </CmsButton>
            </form>
          </CmsCard>
        ) : (
          <div />
        )}

        <CmsCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CmsSectionTitle description="Choose a type, add your file or link, then publish.">
              {editingId ? "Edit resource" : "New resource"}
            </CmsSectionTitle>
            {editingId ? (
              <CmsButton type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </CmsButton>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SOCIETY_RESOURCE_KINDS.map((k) => {
              const Icon = KIND_ICONS[k.value];
              const active = form.kind === k.value;
              return (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, kind: k.value }))}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border px-3 py-3 text-left transition",
                    active
                      ? "border-gcs-primary bg-gcs-primary/5 ring-2 ring-gcs-primary/20"
                      : "border-slate-200 bg-white hover:border-gcs-primary/30"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-gcs-primary" : "text-slate-400")} aria-hidden />
                  <span className="text-sm font-semibold text-slate-900">{k.label}</span>
                  <span className="text-[10px] leading-snug text-slate-500">{k.description}</span>
                </button>
              );
            })}
          </div>

          <form className="mt-8 space-y-6" onSubmit={saveResource}>
            <label>
              <CmsFieldLabel>Title</CmsFieldLabel>
              <CmsInput required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </label>
            <label>
              <CmsFieldLabel>Description</CmsFieldLabel>
              <CmsTextarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>

            {form.kind === "video" ? (
              <div>
                <CmsFieldLabel>Video</CmsFieldLabel>
                <div className="mt-2">
                  <CmsVideoSource
                    url={form.url}
                    urlPublicId={form.urlPublicId}
                    onChange={(url, publicId) => setForm((f) => ({ ...f, url, urlPublicId: publicId }))}
                    onClear={() => setForm((f) => ({ ...f, url: "", urlPublicId: null }))}
                  />
                </div>
              </div>
            ) : form.kind === "document" ? (
              <div>
                <CmsFieldLabel>Document</CmsFieldLabel>
                <div className="mt-2">
                  <CmsDocumentSource
                    url={form.url}
                    urlPublicId={form.urlPublicId}
                    onChange={(url, publicId) => setForm((f) => ({ ...f, url, urlPublicId: publicId }))}
                    onClear={() => setForm((f) => ({ ...f, url: "", urlPublicId: null }))}
                  />
                </div>
              </div>
            ) : (
              <label>
                <CmsFieldLabel>URL</CmsFieldLabel>
                <CmsInput
                  type="url"
                  placeholder="https://…"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value, urlPublicId: null }))}
                />
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <CmsFieldLabel>Sort order</CmsFieldLabel>
                <CmsInput
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                />
              </label>
              <label>
                <CmsFieldLabel>Date (optional)</CmsFieldLabel>
                <CmsInput
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="rounded border-slate-300"
              />
              Published on public site
            </label>

            <CmsImageUpload
              label="Cover image (optional)"
              folder="resources"
              previewUrl={form.imageUrl || null}
              showUrlPaste={false}
              onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null, imageAlt: "" }))}
              helperText="Shown on cards when the item is not a video with its own player"
            />
            {form.imageUrl ? (
              <label>
                <CmsFieldLabel>Image alt text</CmsFieldLabel>
                <CmsInput value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
              </label>
            ) : null}

            <CmsButton type="submit">{editingId ? "Save changes" : "Publish resource"}</CmsButton>
          </form>
        </CmsCard>
      </div>

      <div>
        <CmsSectionTitle description="Drag sort order with the number field; lower appears first.">
          Library ({rows.length})
        </CmsSectionTitle>
        {rows.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
            <FolderOpen className="h-10 w-10 text-slate-300" aria-hidden />
            <p className="text-sm text-slate-500">No resources yet. Add your first video or document above.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {rows.map((r) => {
              const Icon = KIND_ICONS[r.kind];
              return (
                <li
                  key={r.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white shadow-sm transition",
                    editingId === r.id ? "border-gcs-primary ring-2 ring-gcs-primary/15" : "border-slate-200"
                  )}
                >
                  {r.imageUrl ? (
                    <div className="relative h-28 w-full bg-slate-100">
                      <Image src={r.imageUrl} alt="" fill className="object-cover" sizes="400px" />
                    </div>
                  ) : r.kind === "video" && r.url ? (
                    <div className="h-28 bg-slate-900" />
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gcs-primary/10 text-gcs-primary">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {SOCIETY_RESOURCE_KINDS.find((k) => k.value === r.kind)?.label}
                            {!r.published ? " · Draft" : ""}
                            {r.sortOrder !== 0 ? ` · #${r.sortOrder}` : ""}
                          </p>
                          <p className="font-semibold text-slate-900">{r.title}</p>
                        </div>
                      </div>
                      <CmsListActions onEdit={() => startEdit(r)} onDelete={() => void remove(r.id)} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{r.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
