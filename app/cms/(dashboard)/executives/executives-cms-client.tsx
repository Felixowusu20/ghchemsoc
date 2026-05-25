"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Row = {
  id: string;
  sortOrder: number;
  published: boolean;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

const empty = {
  name: "",
  role: "",
  bio: "",
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
  sortOrder: 0,
  published: true,
};

export function ExecutivesCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/executives", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? CMS_UNAUTHORIZED_MESSAGE : await res.text());
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
      name: row.name,
      role: row.role,
      bio: row.bio ?? "",
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
      name: form.name,
      role: form.role,
      bio: form.bio.trim() ? form.bio.trim() : null,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId,
      imageAlt: form.imageAlt || form.name,
      sortOrder: form.sortOrder,
      published: form.published,
    };
    const res = editingId
      ? await fetch(`/api/cms/executives/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/executives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });
    const msg = editingId ? "Executive updated" : "Executive added";
    if (await handleCmsResponse(res, msg, { setErr })) {
      resetForm();
      await load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/cms/executives/${id}`, { method: "DELETE", ...cmsCredentials });
    if (await handleCmsResponse(res, "Executive removed", { setErr })) {
      if (editingId === id) resetForm();
      await load();
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Executives</h1>
        <p className="mt-2 text-sm text-slate-600">
          Officers and leadership shown on the Executives page. Recommended portrait: 560×720px (full image visible on
          the site).
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CmsSectionTitle description="Portrait photo — upload square or portrait; nothing is cropped on the public page.">
            {editingId ? "Edit executive" : "Add executive"}
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
              label="Portrait (recommended)"
              folder="executives"
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
            <CmsFieldLabel>Name</CmsFieldLabel>
            <CmsInput required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Role / title</CmsFieldLabel>
            <CmsInput required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Bio (optional)</CmsFieldLabel>
            <CmsTextarea rows={4} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
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
            <CmsButton type="submit">{editingId ? "Save changes" : "Add executive"}</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>Current executives</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                {r.imageUrl ? (
                  <div className="relative mx-auto h-36 w-28 shrink-0 rounded-xl bg-slate-100 sm:mx-0">
                    <Image src={r.imageUrl} alt={r.imageAlt || r.name} fill className="object-contain object-center p-1" sizes="112px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="text-sm text-gcs-primary">{r.role}</p>
                  {r.bio ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{r.bio}</p> : null}
                  <p className="mt-2 text-xs text-slate-400">
                    order {r.sortOrder} · {r.published ? "live" : "draft"}
                  </p>
                </div>
                <CmsListActions
                  onEdit={() => startEdit(r)}
                  onDelete={() => remove(r.id)}
                  confirm={{
                    title: "Remove this executive?",
                    description: (
                      <>
                        <span className="font-semibold text-slate-900">{r.name}</span> will be removed from the public
                        Executives page.
                      </>
                    ),
                    confirmLabel: "Remove",
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
