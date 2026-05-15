"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";

type Row = {
  id: string;
  title: string;
  meta: string | null;
  description: string;
  issue: string | null;
  href: string | null;
  published: boolean;
  sortOrder: number;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

const empty = {
  title: "",
  meta: "",
  description: "",
  issue: "",
  href: "",
  sortOrder: 0,
  published: true,
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
};

export function PublicationsCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/publications", cmsCredentials);
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

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.imageUrl) {
      setErr("Upload a cover image for this publication.");
      return;
    }
    const res = await fetch("/api/cms/publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        meta: form.meta || null,
        issue: form.issue || null,
        href: form.href || null,
        published: form.published,
        sortOrder: form.sortOrder,
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
        imageAlt: form.imageAlt || form.title,
      }),
    });
    if (!res.ok) setErr(await res.text());
    else {
      setForm(empty);
      await load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this publication?")) return;
    await fetch(`/api/cms/publications/${id}`, { method: "DELETE", ...cmsCredentials });
    await load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Publications</h1>
        <p className="mt-2 text-sm text-slate-600">Research &amp; publications page. Cover art must be uploaded.</p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle>Add publication</CmsSectionTitle>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={create}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Cover image"
              folder="publications"
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
          <label className="md:col-span-2">
            <CmsFieldLabel>Title</CmsFieldLabel>
            <CmsInput required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Description</CmsFieldLabel>
            <CmsTextarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Meta (e.g. Quarterly · May 2026)</CmsFieldLabel>
            <CmsInput value={form.meta} onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Issue</CmsFieldLabel>
            <CmsInput value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>External link (PDF or page)</CmsFieldLabel>
            <CmsInput value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="https://…" />
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
            <CmsButton type="submit">Create</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>All publications</CmsSectionTitle>
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{r.description}</p>
                </div>
                <CmsButton variant="danger" className="shrink-0 self-start" type="button" onClick={() => void remove(r.id)}>
                  Delete
                </CmsButton>
              </CmsCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
