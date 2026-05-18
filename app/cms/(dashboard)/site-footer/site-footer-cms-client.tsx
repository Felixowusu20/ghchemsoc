"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";
import type { FooterSocialLink } from "@/lib/site-footer-defaults";
import {
  normalizeSiteFooterCmsForm,
  prepareSiteFooterSavePayload,
  validateSiteFooterFormBeforeSave,
  type SiteFooterCmsForm,
} from "@/lib/site-footer-cms-payload";

const PLATFORMS: FooterSocialLink["platform"][] = [
  "linkedin",
  "instagram",
  "twitter",
  "facebook",
  "youtube",
  "globe",
];

export function SiteFooterCmsClient() {
  const [form, setForm] = useState<SiteFooterCmsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/site-footer", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
      setForm(null);
      setLoading(false);
      return;
    }
    setForm(normalizeSiteFooterCmsForm((await res.json()) as Partial<SiteFooterCmsForm>));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setErr(null);
    const payload = prepareSiteFooterSavePayload(form);
    const validationError = validateSiteFooterFormBeforeSave(payload);
    if (validationError) {
      setErr(validationError);
      return;
    }
    const res = await fetch("/api/cms/site-footer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify(payload),
    });
    if (await handleCmsResponse(res, "Footer saved", { setErr })) await load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!form) return <p className="text-sm text-red-700">{err ?? "Could not load footer settings."}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Site footer</h1>
        <p className="mt-2 text-sm text-slate-600">
          Shown at the bottom of the homepage, about page, and other pages that include the site footer. Updates appear
          after you save.
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle description="Large display headline and decorative images.">Footer display</CmsSectionTitle>
        <form className="mt-8 space-y-8" onSubmit={save}>
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <CmsFieldLabel>Headline line 1</CmsFieldLabel>
              <CmsInput
                required
                value={form.headlineLine1}
                onChange={(e) => setForm((f) => (f ? { ...f, headlineLine1: e.target.value } : f))}
              />
            </label>
            <label>
              <CmsFieldLabel>Headline line 2</CmsFieldLabel>
              <CmsInput
                required
                value={form.headlineLine2}
                onChange={(e) => setForm((f) => (f ? { ...f, headlineLine2: e.target.value } : f))}
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CmsImageUpload
              label="Left accent image"
              folder="footer"
              required
              previewUrl={form.leftImageUrl || null}
              onChange={(url, publicId) =>
                setForm((f) => (f ? { ...f, leftImageUrl: url, leftImagePublicId: publicId } : f))
              }
              onClear={() => setForm((f) => (f ? { ...f, leftImageUrl: "", leftImagePublicId: null } : f))}
            />
            <CmsImageUpload
              label="Right accent image"
              folder="footer"
              required
              previewUrl={form.rightImageUrl || null}
              onChange={(url, publicId) =>
                setForm((f) => (f ? { ...f, rightImageUrl: url, rightImagePublicId: publicId } : f))
              }
              onClear={() => setForm((f) => (f ? { ...f, rightImageUrl: "", rightImagePublicId: null } : f))}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <CmsFieldLabel>Left image alt</CmsFieldLabel>
              <CmsInput
                value={form.leftImageAlt}
                onChange={(e) => setForm((f) => (f ? { ...f, leftImageAlt: e.target.value } : f))}
              />
            </label>
            <label>
              <CmsFieldLabel>Right image alt</CmsFieldLabel>
              <CmsInput
                value={form.rightImageAlt}
                onChange={(e) => setForm((f) => (f ? { ...f, rightImageAlt: e.target.value } : f))}
              />
            </label>
          </div>

          <CmsSectionTitle description="Contact line shown in the navy bar.">Contact &amp; legal</CmsSectionTitle>

          <label>
            <CmsFieldLabel>Helpline / secretariat line</CmsFieldLabel>
            <CmsInput
              required
              value={form.helplineText}
              onChange={(e) => setForm((f) => (f ? { ...f, helplineText: e.target.value } : f))}
            />
          </label>
          <label>
            <CmsFieldLabel>About blurb</CmsFieldLabel>
            <CmsTextarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : f))}
            />
          </label>
          <label>
            <CmsFieldLabel>Copyright</CmsFieldLabel>
            <CmsInput
              required
              value={form.copyrightText}
              onChange={(e) => setForm((f) => (f ? { ...f, copyrightText: e.target.value } : f))}
            />
          </label>

          <CmsSectionTitle description="Trademark link and optional ® notice in the footer bar.">
            Trademark
          </CmsSectionTitle>
          <label>
            <CmsFieldLabel>Trademark link label</CmsFieldLabel>
            <CmsInput
              required
              placeholder="Trademark & legal"
              value={form.trademarkLabel}
              onChange={(e) => setForm((f) => (f ? { ...f, trademarkLabel: e.target.value } : f))}
            />
          </label>
          <label>
            <CmsFieldLabel>Trademark link URL</CmsFieldLabel>
            <CmsInput
              required
              placeholder="/legal/trademark or https://…"
              value={form.trademarkHref}
              onChange={(e) => setForm((f) => (f ? { ...f, trademarkHref: e.target.value } : f))}
            />
            <span className="mt-1 block text-xs text-slate-500">
              Use a path like /contact or a full URL to your trademark page.
            </span>
          </label>
          <label className="md:col-span-2">
            <CmsFieldLabel>Trademark notice (optional)</CmsFieldLabel>
            <CmsTextarea
              rows={2}
              placeholder="Ghana Chemical Society® and the GCS logo are trademarks of the society."
              value={form.trademarkNotice}
              onChange={(e) => setForm((f) => (f ? { ...f, trademarkNotice: e.target.value } : f))}
            />
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">Navigation links</p>
              <CmsButton
                type="button"
                variant="ghost"
                onClick={() =>
                  setForm((f) => (f ? { ...f, navLinks: [...f.navLinks, { label: "", href: "/" }] } : f))
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add link
              </CmsButton>
            </div>
            <ul className="space-y-3">
              {form.navLinks.map((link, i) => (
                <li key={i} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <label className="min-w-[120px] flex-1">
                    <CmsFieldLabel>Label</CmsFieldLabel>
                    <CmsInput
                      value={link.label}
                      onChange={(e) =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                navLinks: f.navLinks.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)),
                              }
                            : f
                        )
                      }
                    />
                  </label>
                  <label className="min-w-[160px] flex-[2]">
                    <CmsFieldLabel>Path or URL</CmsFieldLabel>
                    <CmsInput
                      value={link.href}
                      onChange={(e) =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                navLinks: f.navLinks.map((l, j) => (j === i ? { ...l, href: e.target.value } : l)),
                              }
                            : f
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="mb-1 text-slate-500 hover:text-red-600"
                    onClick={() =>
                      setForm((f) => (f ? { ...f, navLinks: f.navLinks.filter((_, j) => j !== i) } : f))
                    }
                    aria-label="Remove link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">Social links</p>
              <CmsButton
                type="button"
                variant="ghost"
                onClick={() =>
                  setForm((f) =>
                    f
                      ? {
                          ...f,
                          socialLinks: [...f.socialLinks, { platform: "linkedin", href: "https://", label: "" }],
                        }
                      : f
                  )
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add social
              </CmsButton>
            </div>
            <ul className="space-y-3">
              {form.socialLinks.map((s, i) => (
                <li key={i} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <label>
                      <CmsFieldLabel>Platform</CmsFieldLabel>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        value={s.platform}
                        onChange={(e) =>
                          setForm((f) =>
                            f
                              ? {
                                  ...f,
                                  socialLinks: f.socialLinks.map((x, j) =>
                                    j === i ? { ...x, platform: e.target.value as FooterSocialLink["platform"] } : x
                                  ),
                                }
                              : f
                          )
                        }
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="md:col-span-2">
                      <CmsFieldLabel>URL</CmsFieldLabel>
                      <CmsInput
                        value={s.href}
                        onChange={(e) =>
                          setForm((f) =>
                            f
                              ? {
                                  ...f,
                                  socialLinks: f.socialLinks.map((x, j) =>
                                    j === i ? { ...x, href: e.target.value } : x
                                  ),
                                }
                              : f
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-red-600 hover:underline"
                    onClick={() =>
                      setForm((f) => (f ? { ...f, socialLinks: f.socialLinks.filter((_, j) => j !== i) } : f))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <CmsButton type="submit">Save footer</CmsButton>
        </form>
      </CmsCard>
    </div>
  );
}
