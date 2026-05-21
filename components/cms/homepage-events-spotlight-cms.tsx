"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";
import { HomepageEventsSpotlight } from "@/components/home/homepage-events-spotlight";
import type { HomepageEventsPublic } from "@/lib/homepage-events";

type Row = {
  spotlightEnabled: boolean;
  sectionEyebrow: string;
  sectionTitle: string;
  spotlightEyebrow: string;
  headline: string;
  body: string;
  metaLine: string;
  imagePosition: "left" | "right";
  ctaLabel: string;
  ctaHref: string;
  imageBadge: string;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

function formToPreview(form: Row): HomepageEventsPublic {
  return {
    spotlightEnabled: form.spotlightEnabled,
    sectionEyebrow: form.sectionEyebrow,
    sectionTitle: form.sectionTitle,
    spotlightEyebrow: form.spotlightEyebrow,
    headline: form.headline,
    body: form.body,
    metaLine: form.metaLine.trim() || null,
    imagePosition: form.imagePosition,
    ctaLabel: form.ctaLabel,
    ctaHref: form.ctaHref,
    imageBadge: form.imageBadge.trim() || null,
    imageUrl: form.imageUrl,
    imageAlt: form.imageAlt,
  };
}

export function HomepageEventsSpotlightCms() {
  const [form, setForm] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/homepage-events", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? CMS_UNAUTHORIZED_MESSAGE : await res.text());
      setForm(null);
      setLoading(false);
      return;
    }
    setForm((await res.json()) as Row);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const preview = useMemo(() => (form ? formToPreview(form) : null), [form]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setErr(null);
    if (!form.imageUrl.trim()) {
      setErr("Upload a spotlight image for the homepage events block.");
      return;
    }
    const res = await fetch("/api/cms/homepage-events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        spotlightEnabled: form.spotlightEnabled,
        sectionEyebrow: form.sectionEyebrow,
        sectionTitle: form.sectionTitle,
        spotlightEyebrow: form.spotlightEyebrow,
        headline: form.headline,
        body: form.body,
        metaLine: form.metaLine,
        imagePosition: form.imagePosition,
        ctaLabel: form.ctaLabel,
        ctaHref: form.ctaHref,
        imageBadge: form.imageBadge,
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
        imageAlt: form.imageAlt,
      }),
    });
    if (await handleCmsResponse(res, "Homepage events section saved", { setErr })) {
      setForm((await res.json()) as Row);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading homepage events…</p>;
  if (!form) return err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null;

  return (
    <CmsCard className="p-8">
      <CmsSectionTitle>Homepage · events spotlight</CmsSectionTitle>
      <p className="mt-2 text-sm text-slate-600">
        Matches the news desk layout: a large featured card (image + text) on the left, with up to three upcoming events
        stacked on the right. Pick whether the spotlight image sits on the left or the right.
      </p>
      {err ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      {preview?.spotlightEnabled ? (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live preview</p>
          <HomepageEventsSpotlight
            settings={preview}
            preview
            className="mb-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100"
          />
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Enable the spotlight below to show the image and text block on the homepage.
        </p>
      )}

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={save}>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            checked={form.spotlightEnabled}
            onChange={(e) => setForm((f) => (f ? { ...f, spotlightEnabled: e.target.checked } : f))}
          />
          Show spotlight on homepage
        </label>
        <label>
          <CmsFieldLabel>Section eyebrow</CmsFieldLabel>
          <CmsInput
            value={form.sectionEyebrow}
            onChange={(e) => setForm((f) => (f ? { ...f, sectionEyebrow: e.target.value } : f))}
          />
        </label>
        <label>
          <CmsFieldLabel>Section title</CmsFieldLabel>
          <CmsInput
            value={form.sectionTitle}
            onChange={(e) => setForm((f) => (f ? { ...f, sectionTitle: e.target.value } : f))}
          />
        </label>
        <label>
          <CmsFieldLabel>Spotlight label</CmsFieldLabel>
          <CmsInput
            value={form.spotlightEyebrow}
            onChange={(e) => setForm((f) => (f ? { ...f, spotlightEyebrow: e.target.value } : f))}
          />
        </label>
        <label>
          <CmsFieldLabel>Image position</CmsFieldLabel>
          <select
            className="mt-1 w-full rounded-xl border border-gcs-border bg-white px-3 py-2 text-sm"
            value={form.imagePosition}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, imagePosition: e.target.value as "left" | "right" } : f))
            }
          >
            <option value="left">Image left, text right</option>
            <option value="right">Image right, text left</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <CmsFieldLabel>Headline</CmsFieldLabel>
          <CmsInput
            required
            value={form.headline}
            onChange={(e) => setForm((f) => (f ? { ...f, headline: e.target.value } : f))}
          />
        </label>
        <label className="md:col-span-2">
          <CmsFieldLabel>Body</CmsFieldLabel>
          <CmsTextarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm((f) => (f ? { ...f, body: e.target.value } : f))}
          />
        </label>
        <label className="md:col-span-2">
          <CmsFieldLabel>Date or venue line (optional)</CmsFieldLabel>
          <CmsInput
            placeholder="e.g. 16 MAY 2026 or Accra · member rates"
            value={form.metaLine}
            onChange={(e) => setForm((f) => (f ? { ...f, metaLine: e.target.value } : f))}
          />
        </label>
        <label>
          <CmsFieldLabel>Button label</CmsFieldLabel>
          <CmsInput
            required
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => (f ? { ...f, ctaLabel: e.target.value } : f))}
          />
        </label>
        <label>
          <CmsFieldLabel>Button link</CmsFieldLabel>
          <CmsInput
            required
            value={form.ctaHref}
            onChange={(e) => setForm((f) => (f ? { ...f, ctaHref: e.target.value } : f))}
          />
        </label>
        <label className="md:col-span-2">
          <CmsFieldLabel>Image badge (optional)</CmsFieldLabel>
          <CmsInput
            value={form.imageBadge}
            onChange={(e) => setForm((f) => (f ? { ...f, imageBadge: e.target.value } : f))}
          />
        </label>
        <div className="md:col-span-2">
          <CmsImageUpload
            label="Spotlight image"
            folder="homepage-events"
            required
            helperText="Shown beside your headline on the homepage — use a bright conference or lab photo."
            previewUrl={form.imageUrl || null}
            onChange={(url, publicId) => setForm((f) => (f ? { ...f, imageUrl: url, imagePublicId: publicId } : f))}
            onClear={() => setForm((f) => (f ? { ...f, imageUrl: "", imagePublicId: null } : f))}
          />
        </div>
        <label className="md:col-span-2">
          <CmsFieldLabel>Image alt</CmsFieldLabel>
          <CmsInput
            value={form.imageAlt}
            onChange={(e) => setForm((f) => (f ? { ...f, imageAlt: e.target.value } : f))}
          />
        </label>
        <div className="md:col-span-2">
          <CmsButton type="submit">Save homepage events</CmsButton>
        </div>
      </form>
    </CmsCard>
  );
}
