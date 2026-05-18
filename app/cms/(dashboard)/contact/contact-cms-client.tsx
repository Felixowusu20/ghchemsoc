"use client";

import { useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";

type Card = { icon: "phone" | "mail" | "map" | "clock"; title: string; value: string; description: string };

export function ContactCmsClient() {
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/cms/contact-settings", cmsCredentials);
      if (!res.ok) {
        setErr("Could not load settings");
        setLoading(false);
        return;
      }
      const d = (await res.json()) as { eyebrow: string; headline: string; subtext: string; cards: Card[] };
      setEyebrow(d.eyebrow);
      setHeadline(d.headline);
      setSubtext(d.subtext);
      setCards(Array.isArray(d.cards) && d.cards.length ? d.cards : []);
      setLoading(false);
    })();
  }, []);

  function updateCard(i: number, patch: Partial<Card>) {
    setCards((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaved(false);
    const res = await fetch("/api/cms/contact-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({ eyebrow, headline, subtext, cards }),
    });
    if (await handleCmsResponse(res, "Contact page saved", { setErr })) setSaved(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-slate-500">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Contact page</h1>
        <p className="mt-2 text-sm text-slate-600">Hero copy and the four detail cards on /contact (no image uploads here).</p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}
      {saved ? <p className="text-sm font-medium text-emerald-700">Saved.</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle>Intro</CmsSectionTitle>
        <form className="mt-6 space-y-5" onSubmit={save}>
          <label>
            <CmsFieldLabel>Eyebrow</CmsFieldLabel>
            <CmsInput value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </label>
          <label>
            <CmsFieldLabel>Headline</CmsFieldLabel>
            <CmsInput value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </label>
          <label>
            <CmsFieldLabel>Supporting text</CmsFieldLabel>
            <CmsTextarea rows={3} value={subtext} onChange={(e) => setSubtext(e.target.value)} />
          </label>

          <CmsSectionTitle description="Four cards shown in a row on large screens.">Contact cards</CmsSectionTitle>
          <div className="space-y-6">
            {cards.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Card {i + 1}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <CmsFieldLabel>Icon</CmsFieldLabel>
                    <select
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                      value={c.icon}
                      onChange={(e) => updateCard(i, { icon: e.target.value as Card["icon"] })}
                    >
                      <option value="phone">Phone</option>
                      <option value="mail">Email</option>
                      <option value="map">Location</option>
                      <option value="clock">Hours</option>
                    </select>
                  </label>
                  <label>
                    <CmsFieldLabel>Title</CmsFieldLabel>
                    <CmsInput value={c.title} onChange={(e) => updateCard(i, { title: e.target.value })} />
                  </label>
                  <label>
                    <CmsFieldLabel>Value</CmsFieldLabel>
                    <CmsInput value={c.value} onChange={(e) => updateCard(i, { value: e.target.value })} />
                  </label>
                  <label className="md:col-span-2">
                    <CmsFieldLabel>Description</CmsFieldLabel>
                    <CmsInput value={c.description} onChange={(e) => updateCard(i, { description: e.target.value })} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <CmsButton type="submit" className="mt-4">
            Save contact page
          </CmsButton>
        </form>
      </CmsCard>
    </div>
  );
}
