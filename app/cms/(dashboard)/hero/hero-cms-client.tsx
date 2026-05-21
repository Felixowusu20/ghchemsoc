"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Slide = {
  id: string;
  sortOrder: number;
  published: boolean;
  imagePublicId: string | null;
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  tagsJson: string;
  highlightsJson: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string | null;
  secondaryHref: string | null;
  statValue: string | null;
  statLabel: string | null;
};

const emptyForm = {
  imageUrl: "",
  imagePublicId: "" as string | null,
  imageAlt: "",
  eyebrow: "",
  headlineLine1: "",
  headlineLine2: "",
  description: "",
  tags: "",
  highlights: "",
  ctaLabel: "",
  ctaHref: "",
  secondaryLabel: "",
  secondaryHref: "",
  statValue: "",
  statLabel: "",
  sortOrder: 0,
  published: true,
};

export function HeroCmsClient() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  function slideToForm(s: Slide) {
    let tags = "";
    let highlights = "";
    try {
      tags = (JSON.parse(s.tagsJson) as string[]).join(", ");
      highlights = (JSON.parse(s.highlightsJson) as string[]).join("\n");
    } catch {
      tags = "";
      highlights = "";
    }
    return {
      imageUrl: s.imageUrl,
      imagePublicId: s.imagePublicId,
      imageAlt: s.imageAlt,
      eyebrow: s.eyebrow,
      headlineLine1: s.headlineLine1,
      headlineLine2: s.headlineLine2,
      description: s.description,
      tags,
      highlights,
      ctaLabel: s.ctaLabel,
      ctaHref: s.ctaHref,
      secondaryLabel: s.secondaryLabel ?? "",
      secondaryHref: s.secondaryHref ?? "",
      statValue: s.statValue ?? "",
      statLabel: s.statLabel ?? "",
      sortOrder: s.sortOrder,
      published: s.published,
    };
  }

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/hero-slides?admin=1", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? CMS_UNAUTHORIZED_MESSAGE : await res.text());
      setSlides([]);
      setLoading(false);
      return;
    }
    setSlides((await res.json()) as Slide[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(s: Slide) {
    setEditingId(s.id);
    setForm(slideToForm(s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveSlide(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.imageUrl) {
      setErr("Please upload a slide image (drag & drop or file picker).");
      return;
    }
    const tags = form.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const highlights = form.highlights
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      imageUrl: form.imageUrl,
      imagePublicId: form.imagePublicId || null,
      imageAlt: form.imageAlt,
      eyebrow: form.eyebrow,
      headlineLine1: form.headlineLine1,
      headlineLine2: form.headlineLine2,
      description: form.description,
      tags,
      highlights,
      ctaLabel: form.ctaLabel,
      ctaHref: form.ctaHref,
      secondaryLabel: form.secondaryLabel || null,
      secondaryHref: form.secondaryHref || null,
      statValue: form.statValue || null,
      statLabel: form.statLabel || null,
      sortOrder: form.sortOrder,
      published: form.published,
    };
    const res = editingId
      ? await fetch(`/api/cms/hero-slides/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });
    if (!(await handleCmsResponse(res, editingId ? "Slide updated" : "Hero slide saved", { setErr }))) return;
    resetForm();
    await load();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/cms/hero-slides/${id}`, { method: "DELETE", ...cmsCredentials });
    if (await handleCmsResponse(res, "Slide deleted", { setErr, failureTitle: "Delete failed" })) {
      if (editingId === id) resetForm();
      await load();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Loading hero…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Homepage</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Hero carousel</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Upload slide images here (pasted image links are not used). Each published slide appears on the public homepage.
        </p>
      </div>

      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100">{err}</p> : null}

      <CmsCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CmsSectionTitle description="Upload cover art, then add copy and CTAs.">
            {editingId ? "Edit slide" : "New slide"}
          </CmsSectionTitle>
          {editingId ? (
            <CmsButton type="button" variant="ghost" onClick={resetForm}>
              Cancel edit
            </CmsButton>
          ) : null}
        </div>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={saveSlide}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Slide image"
              folder="hero"
              required
              previewUrl={form.imageUrl || null}
              onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
              helperText="PNG or JPG recommended · at least 1600px wide for best quality"
            />
          </div>
          <label>
            <CmsFieldLabel>Image alt text</CmsFieldLabel>
            <CmsInput required value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Eyebrow</CmsFieldLabel>
            <CmsInput required value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Headline line 1</CmsFieldLabel>
            <CmsInput required value={form.headlineLine1} onChange={(e) => setForm((f) => ({ ...f, headlineLine1: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Headline line 2</CmsFieldLabel>
            <CmsInput required value={form.headlineLine2} onChange={(e) => setForm((f) => ({ ...f, headlineLine2: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Description</CmsFieldLabel>
            <CmsTextarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Tags (comma-separated)</CmsFieldLabel>
            <CmsInput value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Highlights (one per line)</CmsFieldLabel>
            <CmsTextarea rows={3} value={form.highlights} onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Primary CTA label</CmsFieldLabel>
            <CmsInput required value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Primary CTA link</CmsFieldLabel>
            <CmsInput required value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Secondary CTA label</CmsFieldLabel>
            <CmsInput value={form.secondaryLabel} onChange={(e) => setForm((f) => ({ ...f, secondaryLabel: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Secondary CTA link</CmsFieldLabel>
            <CmsInput value={form.secondaryHref} onChange={(e) => setForm((f) => ({ ...f, secondaryHref: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Stat value</CmsFieldLabel>
            <CmsInput value={form.statValue} onChange={(e) => setForm((f) => ({ ...f, statValue: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Stat label</CmsFieldLabel>
            <CmsInput value={form.statLabel} onChange={(e) => setForm((f) => ({ ...f, statLabel: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published on site
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit" className="min-w-[160px]">
              {editingId ? "Save changes" : "Create slide"}
            </CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle description="Use sort order to control slide sequence. Deleting a slide removes it from the homepage.">
          Published slides
        </CmsSectionTitle>
        {slides.length === 0 ? <p className="mt-4 text-sm text-slate-500">No slides yet.</p> : null}
        <ul className="mt-6 space-y-4">
          {slides.map((s) => (
            <li key={s.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl md:h-28 md:w-44">
                  <Image src={s.imageUrl} alt={s.imageAlt} fill className="object-cover" sizes="200px" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-slate-900">
                    {s.headlineLine1} — {s.headlineLine2}
                  </p>
                  <p className="text-slate-600">{s.eyebrow}</p>
                  <p className="mt-1 line-clamp-2 text-slate-500">{s.description}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order {s.sortOrder} · {s.published ? "Live" : "Draft"}
                  </p>
                </div>
                <CmsListActions
                  onEdit={() => startEdit(s)}
                  onDelete={() => remove(s.id)}
                  confirm={{
                    title: "Delete this hero slide?",
                    description: (
                      <>
                        The slide{" "}
                        <span className="font-semibold text-slate-900">
                          &ldquo;{s.headlineLine1} — {s.headlineLine2}&rdquo;
                        </span>{" "}
                        will be removed from the homepage carousel.
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
                          <span>Tip: uncheck <em>Published</em> instead to hide it without losing the content.</span>
                        </li>
                      </ul>
                    ),
                    confirmLabel: "Delete slide",
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
