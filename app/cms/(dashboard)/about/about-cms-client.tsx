"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Row = {
  id: string;
  sortOrder: number;
  published: boolean;
  title: string;
  subtitle: string | null;
  body: string;
  layout: string;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

const empty = {
  title: "",
  subtitle: "",
  body: "",
  layout: "default",
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
  sortOrder: 0,
  published: true,
};

export function AboutCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/about-sections", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
      setRows([]);
      setLoading(false);
      return;
    }
    setRows((await res.json()) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(row: Row) {
    setEditingId(row.id);
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? "",
      body: row.body,
      layout: row.layout,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      imageAlt: row.imageAlt,
      sortOrder: row.sortOrder,
      published: row.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      body: form.body,
      layout: form.layout,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId,
      imageAlt: form.imageAlt || form.title,
      sortOrder: form.sortOrder,
      published: form.published,
    };
    const res = editingId
      ? await fetch(`/api/cms/about-sections/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/about-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });
    const msg = editingId ? "Section updated" : "Section added";
    if (await handleCmsResponse(res, msg, { setErr })) {
      resetForm();
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this section?")) return;
    const res = await fetch(`/api/cms/about-sections/${id}`, { method: "DELETE", ...cmsCredentials });
    if (await handleCmsResponse(res, "Section deleted", { setErr })) {
      if (editingId === id) resetForm();
      await load();
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">About page</h1>
        <p className="mt-2 text-sm text-slate-600"> Click Edit on a section below to update it.</p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CmsSectionTitle description="Optional cover image for this block.">
            {editingId ? "Edit section" : "New section"}
          </CmsSectionTitle>
          {editingId ? (
            <CmsButton type="button" variant="ghost" onClick={resetForm}>
              Cancel edit
            </CmsButton>
          ) : null}
        </div>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={save}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Section image (optional)"
              folder="about"
              previewUrl={form.imageUrl || null}
              onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
            />
          </div>
          <label>
            <CmsFieldLabel>Image alt (if image)</CmsFieldLabel>
            <CmsInput value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Layout</CmsFieldLabel>
            <CmsInput value={form.layout} onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value }))} placeholder="default | wide" />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Title</CmsFieldLabel>
            <CmsInput required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Subtitle (optional)</CmsFieldLabel>
            <CmsInput value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Body</CmsFieldLabel>
            <CmsTextarea required rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit">{editingId ? "Save changes" : "Create section"}</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>Sections</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                {r.imageUrl ? (
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl md:h-28 md:w-44">
                    <Image src={r.imageUrl} alt={r.imageAlt || r.title} fill className="object-cover" sizes="200px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{r.body}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    order {r.sortOrder} · {r.published ? "live" : "draft"}
                  </p>
                </div>
                <CmsListActions onEdit={() => startEdit(r)} onDelete={() => void remove(r.id)} />
              </CmsCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
