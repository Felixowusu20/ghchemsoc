"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";

type Row = {
  id: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  title: string;
  excerpt: string;
  startDate: string;
  endDate: string | null;
  timeLabel: string;
  location: string;
  href: string | null;
  badge: string | null;
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
  title: "",
  excerpt: "",
  startDate: toLocalInput(new Date().toISOString()),
  endDate: "" as string,
  timeLabel: "",
  location: "",
  href: "",
  badge: "",
  featured: false,
  published: true,
  sortOrder: 0,
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
};

export function EventsCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/society-events", cmsCredentials);
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
      setErr("Upload an event image — pasted URLs are not supported here.");
      return;
    }
    const res = await fetch("/api/cms/society-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        title: form.title,
        excerpt: form.excerpt,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        timeLabel: form.timeLabel,
        location: form.location,
        href: form.href || null,
        badge: form.badge || null,
        featured: form.featured,
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
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/cms/society-events/${id}`, { method: "DELETE", ...cmsCredentials });
    await load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Events</h1>
        <p className="mt-2 text-sm text-slate-600">
          Conferences and meetings on <span className="font-medium text-slate-800">/events</span>. Mark one as featured for the large hero card.
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle>Add event</CmsSectionTitle>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={create}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Event image"
              folder="events"
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
            <CmsFieldLabel>Excerpt</CmsFieldLabel>
            <CmsTextarea required rows={3} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Start</CmsFieldLabel>
            <CmsInput type="datetime-local" required value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>End (optional)</CmsFieldLabel>
            <CmsInput type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Time label (display)</CmsFieldLabel>
            <CmsInput required placeholder="09:00 – 17:00 GMT" value={form.timeLabel} onChange={(e) => setForm((f) => ({ ...f, timeLabel: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Location</CmsFieldLabel>
            <CmsInput required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Badge (optional)</CmsFieldLabel>
            <CmsInput placeholder="Flagship" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Details link</CmsFieldLabel>
            <CmsInput value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="https://… or /news/…" />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
            Featured (large card on /events when set)
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit">Create event</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>Scheduled events</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row">
                {r.imageUrl ? (
                  <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl md:h-24 md:w-40">
                    <Image src={r.imageUrl} alt={r.imageAlt || r.title} fill className="object-cover" sizes="160px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gcs-primary">
                    {r.featured ? "Featured · " : ""}
                    {r.published ? "Live" : "Draft"} · sort {r.sortOrder}
                  </p>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{new Date(r.startDate).toLocaleString()} · {r.location}</p>
                </div>
                <CmsButton variant="danger" className="self-start" type="button" onClick={() => void remove(r.id)}>
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
