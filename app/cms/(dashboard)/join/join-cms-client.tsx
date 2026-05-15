"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";

type Header = {
  id: string;
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

type Step = {
  id: string;
  sortOrder: number;
  published: boolean;
  stepKey: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
};

const emptyStep = {
  stepKey: "",
  title: "",
  description: "",
  imageUrl: "",
  imagePublicId: null as string | null,
  imageAlt: "",
  sortOrder: 0,
  published: true,
};

export function JoinCmsClient() {
  const [header, setHeader] = useState<Header | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState(emptyStep);

  const load = useCallback(async () => {
    setErr(null);
    const [hRes, sRes] = await Promise.all([
      fetch("/api/cms/join-header", cmsCredentials),
      fetch("/api/cms/join-steps", cmsCredentials),
    ]);
    if (!hRes.ok || !sRes.ok) {
      setErr("Unauthorized or load failed — sign in at /cms/login");
      setLoading(false);
      return;
    }
    setHeader((await hRes.json()) as Header);
    setSteps((await sRes.json()) as Step[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveHeader(e: React.FormEvent) {
    e.preventDefault();
    if (!header) return;
    setErr(null);
    const res = await fetch("/api/cms/join-header", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        eyebrow: header.eyebrow,
        title: header.title,
        subtitle: header.subtitle,
        imageUrl: header.imageUrl || undefined,
        imagePublicId: header.imagePublicId,
        imageAlt: header.imageAlt || undefined,
      }),
    });
    if (!res.ok) setErr(await res.text());
    else setHeader((await res.json()) as Header);
  }

  async function createStep(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/cms/join-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        stepKey: stepForm.stepKey,
        title: stepForm.title,
        description: stepForm.description,
        imageUrl: stepForm.imageUrl || undefined,
        imagePublicId: stepForm.imagePublicId,
        imageAlt: stepForm.imageAlt || stepForm.title,
        sortOrder: stepForm.sortOrder,
        published: stepForm.published,
      }),
    });
    if (!res.ok) setErr(await res.text());
    else {
      setStepForm(emptyStep);
      await load();
    }
  }

  async function removeStep(id: string) {
    if (!confirm("Delete this step?")) return;
    await fetch(`/api/cms/join-steps/${id}`, { method: "DELETE", ...cmsCredentials });
    await load();
  }

  if (loading || !header) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Join / membership</h1>
        <p className="mt-2 text-sm text-slate-600">Homepage join block and /membership hero. Images must be uploaded — no external image URLs.</p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle description="Replace the hero by uploading a new file.">Page header</CmsSectionTitle>
        <form className="mt-8 space-y-5" onSubmit={saveHeader}>
          <CmsImageUpload
            label="Hero image"
            folder="join"
            previewUrl={header.imageUrl || null}
            onChange={(url, publicId) => setHeader({ ...header, imageUrl: url, imagePublicId: publicId })}
            onClear={() => setHeader({ ...header, imageUrl: "", imagePublicId: null })}
            helperText="Shown beside the membership headline on the site."
          />
          <label>
            <CmsFieldLabel>Hero image alt</CmsFieldLabel>
            <CmsInput value={header.imageAlt} onChange={(e) => setHeader({ ...header, imageAlt: e.target.value })} />
          </label>
          <label>
            <CmsFieldLabel>Eyebrow</CmsFieldLabel>
            <CmsInput value={header.eyebrow} onChange={(e) => setHeader({ ...header, eyebrow: e.target.value })} />
          </label>
          <label>
            <CmsFieldLabel>Title</CmsFieldLabel>
            <CmsInput value={header.title} onChange={(e) => setHeader({ ...header, title: e.target.value })} />
          </label>
          <label>
            <CmsFieldLabel>Subtitle</CmsFieldLabel>
            <CmsInput value={header.subtitle} onChange={(e) => setHeader({ ...header, subtitle: e.target.value })} />
          </label>
          <CmsButton type="submit">Save header</CmsButton>
        </form>
      </CmsCard>

      <CmsCard className="p-8">
        <CmsSectionTitle description="Optional illustration per step.">Add step</CmsSectionTitle>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={createStep}>
          <div className="md:col-span-2">
            <CmsImageUpload
              label="Step image (optional)"
              folder="join"
              previewUrl={stepForm.imageUrl || null}
              onChange={(url, publicId) => setStepForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
              onClear={() => setStepForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
            />
          </div>
          <label className="md:col-span-2">
            <CmsFieldLabel>Image alt (if image)</CmsFieldLabel>
            <CmsInput value={stepForm.imageAlt} onChange={(e) => setStepForm((f) => ({ ...f, imageAlt: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Step key (e.g. 01)</CmsFieldLabel>
            <CmsInput required value={stepForm.stepKey} onChange={(e) => setStepForm((f) => ({ ...f, stepKey: e.target.value }))} />
          </label>
          <label>
            <CmsFieldLabel>Sort order</CmsFieldLabel>
            <CmsInput
              type="number"
              value={stepForm.sortOrder}
              onChange={(e) => setStepForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Title</CmsFieldLabel>
            <CmsInput required value={stepForm.title} onChange={(e) => setStepForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Description</CmsFieldLabel>
            <CmsTextarea required rows={3} value={stepForm.description} onChange={(e) => setStepForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <input type="checkbox" checked={stepForm.published} onChange={(e) => setStepForm((f) => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          <div className="md:col-span-2">
            <CmsButton type="submit">Add step</CmsButton>
          </div>
        </form>
      </CmsCard>

      <div>
        <CmsSectionTitle>Steps</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {steps.map((s) => (
            <li key={s.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                {s.imageUrl ? (
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:w-32">
                    <Image src={s.imageUrl} alt={s.imageAlt || s.title} fill className="object-cover" sizes="128px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gcs-primary">{s.stepKey}</p>
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{s.description}</p>
                </div>
                <CmsButton variant="danger" className="shrink-0 self-start" type="button" onClick={() => void removeStep(s.id)}>
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
