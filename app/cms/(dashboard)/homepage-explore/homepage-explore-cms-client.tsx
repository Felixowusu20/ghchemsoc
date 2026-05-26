"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Row = {
  missionEyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  aboutEyebrow: string;
  aboutBody: string;
  imageBadge: string;
  imageHoverQuote: string;
  locationLabel: string;
  secondaryBadge: string;
  bottomBlurb: string;
  mainImageUrl: string;
  mainImagePublicId: string | null;
  mainImageAlt: string;
  secondaryImageUrl: string;
  secondaryImagePublicId: string | null;
  secondaryImageAlt: string;
};

export function HomepageExploreCmsClient() {
  const [form, setForm] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/homepage-explore", cmsCredentials);
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setErr(null);
    setSaved(false);
    const res = await fetch("/api/cms/homepage-explore", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        missionEyebrow: form.missionEyebrow,
        headlineLine1: form.headlineLine1,
        headlineLine2: form.headlineLine2,
        aboutEyebrow: form.aboutEyebrow,
        aboutBody: form.aboutBody,
        imageBadge: form.imageBadge,
        imageHoverQuote: form.imageHoverQuote,
        locationLabel: form.locationLabel,
        secondaryBadge: form.secondaryBadge,
        bottomBlurb: form.bottomBlurb,
        mainImageUrl: form.mainImageUrl || undefined,
        mainImagePublicId: form.mainImagePublicId,
        mainImageAlt: form.mainImageAlt,
        secondaryImageUrl: form.secondaryImageUrl || undefined,
        secondaryImagePublicId: form.secondaryImagePublicId,
        secondaryImageAlt: form.secondaryImageAlt,
      }),
    });
    if (await handleCmsResponse(res, "Homepage section saved", { setErr })) {
      setSaved(true);
      setForm((await res.json()) as Row);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-slate-500">{loading ? "Loading…" : "Could not load."}</p>;
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public homepage</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Mission strip</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Headline, supporting copy, and imagery below the hero on the homepage. The same headline and About column also
          appear at the top of the About page. Line 1 and line 2 form the large title (a line break is added on desktop
          between them).
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}
      {saved ? <p className="text-sm font-medium text-emerald-700">Saved.</p> : null}

      <form onSubmit={save} className="space-y-10">
        <CmsCard className="p-8">
          <CmsSectionTitle>Headline</CmsSectionTitle>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <CmsFieldLabel>Pill label (e.g. Our mission)</CmsFieldLabel>
              <CmsInput value={form.missionEyebrow} onChange={(e) => setForm({ ...form, missionEyebrow: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Title line 1</CmsFieldLabel>
              <CmsInput value={form.headlineLine1} onChange={(e) => setForm({ ...form, headlineLine1: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Title line 2</CmsFieldLabel>
              <CmsInput value={form.headlineLine2} onChange={(e) => setForm({ ...form, headlineLine2: e.target.value })} />
            </label>
          </div>
        </CmsCard>

        <CmsCard className="p-8">
          <CmsSectionTitle>About column</CmsSectionTitle>
          <div className="mt-6 space-y-5">
            <label>
              <CmsFieldLabel>Small label</CmsFieldLabel>
              <CmsInput value={form.aboutEyebrow} onChange={(e) => setForm({ ...form, aboutEyebrow: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Mission text (left column)</CmsFieldLabel>
              <CmsTextarea
                rows={5}
                placeholder="One paragraph per block. Leave a blank line between paragraphs."
                value={form.aboutBody}
                onChange={(e) => setForm({ ...form, aboutBody: e.target.value })}
              />
            </label>
          </div>
        </CmsCard>

        <CmsCard className="p-8">
          <CmsSectionTitle>Large image (centre column)</CmsSectionTitle>
          <div className="mt-6 space-y-5">
            <CmsImageUpload
              label="Main image"
              folder="homepage-explore"
              previewUrl={form.mainImageUrl || null}
              onChange={(url, publicId) => setForm({ ...form, mainImageUrl: url, mainImagePublicId: publicId })}
              onClear={() => setForm({ ...form, mainImageUrl: "", mainImagePublicId: null })}
            />
            <label>
              <CmsFieldLabel>Image alt</CmsFieldLabel>
              <CmsInput value={form.mainImageAlt} onChange={(e) => setForm({ ...form, mainImageAlt: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Top badge on image</CmsFieldLabel>
              <CmsInput value={form.imageBadge} onChange={(e) => setForm({ ...form, imageBadge: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Hover quote (right on image)</CmsFieldLabel>
              <CmsTextarea rows={2} value={form.imageHoverQuote} onChange={(e) => setForm({ ...form, imageHoverQuote: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Location pill</CmsFieldLabel>
              <CmsInput value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} />
            </label>
          </div>
        </CmsCard>

        <CmsCard className="p-8">
          <CmsSectionTitle>Secondary image (right column)</CmsSectionTitle>
          <div className="mt-6 space-y-5">
            <CmsImageUpload
              label="Secondary image"
              folder="homepage-explore"
              previewUrl={form.secondaryImageUrl || null}
              onChange={(url, publicId) => setForm({ ...form, secondaryImageUrl: url, secondaryImagePublicId: publicId })}
              onClear={() => setForm({ ...form, secondaryImageUrl: "", secondaryImagePublicId: null })}
            />
            <label>
              <CmsFieldLabel>Image alt</CmsFieldLabel>
              <CmsInput value={form.secondaryImageAlt} onChange={(e) => setForm({ ...form, secondaryImageAlt: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Badge on secondary image</CmsFieldLabel>
              <CmsInput value={form.secondaryBadge} onChange={(e) => setForm({ ...form, secondaryBadge: e.target.value })} />
            </label>
            <label>
              <CmsFieldLabel>Mission text (right column, below image)</CmsFieldLabel>
              <CmsTextarea
                rows={5}
                placeholder="One paragraph per block. Leave a blank line between paragraphs."
                value={form.bottomBlurb}
                onChange={(e) => setForm({ ...form, bottomBlurb: e.target.value })}
              />
            </label>
          </div>
        </CmsCard>

        <CmsButton type="submit">Save homepage mission</CmsButton>
      </form>
    </div>
  );
}
