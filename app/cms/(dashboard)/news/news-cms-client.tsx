"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  date: string;
  published: boolean;
  sortOrder: number;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const empty = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  date: toLocalInput(new Date().toISOString()),
  sortOrder: 0,
  published: false,
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
};

export function NewsCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/news-items", cmsCredentials);
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
      setErr("Upload a cover image — pasted URLs are not supported.");
      return;
    }
    const res = await fetch("/api/cms/news-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        slug: form.slug.trim().toLowerCase(),
        title: form.title,
        excerpt: form.excerpt,
        body: form.body || null,
        date: new Date(form.date).toISOString(),
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
    if (!confirm("Delete this news item?")) return;
    await fetch(`/api/cms/news-items/${id}`, { method: "DELETE", ...cmsCredentials });
    await load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">News</h1>
        <p className="mt-2 text-sm text-slate-600">
          Slug becomes <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/news/[slug]</code>. Each post needs an uploaded cover image.
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle>Add item</CmsSectionTitle>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={create}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Cover image"
              folder="news"
              required
              previewUrl={form.imageUrl || null}
              onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
              helperText="Drag and drop or choose a file. Cloudinary stores the asset."
            />
          </div>
          <label className="md:col-span-2">
            <CmsFieldLabel>Image alt</CmsFieldLabel>
            <CmsInput value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} placeholder="Describe the photo for accessibility" />
          </label>
          <label>
            <CmsFieldLabel>Slug (lowercase-kebab)</CmsFieldLabel>
            <CmsInput required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Date</CmsFieldLabel>
            <CmsInput type="datetime-local" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Title</CmsFieldLabel>
            <CmsInput required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Excerpt</CmsFieldLabel>
            <CmsTextarea required rows={3} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Body (optional)</CmsFieldLabel>
            <CmsTextarea rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published (visible on site)
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit">Create</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>All items</CmsSectionTitle>
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
                <div>
                  <p className="font-mono text-xs text-slate-500">{r.slug}</p>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {r.published ? "published" : "draft"} · sort {r.sortOrder}
                  </p>
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
