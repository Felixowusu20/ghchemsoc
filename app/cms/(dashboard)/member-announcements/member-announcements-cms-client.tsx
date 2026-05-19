"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Megaphone, Send } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse, notifyCmsError, notifyCmsSuccess } from "@/lib/cms-toast";
import type { MemberAnnouncementDto } from "@/lib/member-announcements";

const emptyForm = {
  title: "",
  subject: "",
  preview: "",
  bodyText: "",
  publicHref: "",
  goLiveAt: "",
};

export function MemberAnnouncementsCmsClient() {
  const [announcements, setAnnouncements] = useState<MemberAnnouncementDto[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/member-announcements", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      announcements: MemberAnnouncementDto[];
      approvedMemberCount: number;
    };
    setAnnouncements(data.announcements);
    setApprovedCount(data.approvedMemberCount);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/cms/member-announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({
        title: form.title,
        subject: form.subject,
        preview: form.preview,
        bodyText: form.bodyText,
        publicHref: form.publicHref.trim() || null,
        goLiveAt: form.goLiveAt.trim() ? new Date(form.goLiveAt).toISOString() : null,
      }),
    });
    setSaving(false);
    if (await handleCmsResponse(res, "Draft saved", { setErr })) {
      setForm(emptyForm);
      await load();
    }
  }

  async function sendToMembers(id: string, title: string) {
    if (
      !window.confirm(
        `Send “${title}” to ${approvedCount} approved member(s)? They will receive email and a portal notification before the public sees this.`
      )
    ) {
      return;
    }
    setSendingId(id);
    const res = await fetch(`/api/cms/member-announcements/${id}/send`, {
      method: "POST",
      ...cmsCredentials,
    });
    setSendingId(null);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      notifyCmsError("Send failed", data.error);
      return;
    }
    const data = (await res.json()) as {
      send: { recipientCount: number; emailSuccessCount: number; errors: string[] };
    };
    notifyCmsSuccess("Sent to members", {
      description: `${data.send.emailSuccessCount} of ${data.send.recipientCount} emails delivered. All members have a portal notification.`,
    });
    if (data.send.errors.length > 0) {
      notifyCmsError("Some emails failed", data.send.errors.slice(0, 3).join(" · "));
    }
    await load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <motion.div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Membership</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Member announcements</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Send bulletins to <strong>{approvedCount}</strong> approved member(s) by email and their private portal{" "}
          <em>before</em> the same content goes public.{" "}
          <Link href="/cms/membership" className="font-medium text-gcs-primary hover:underline">
            Back to membership admin
          </Link>
        </p>
      </motion.div>

      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <CmsSectionTitle description="Members see this in email and under Announcements in their portal.">
          Compose bulletin
        </CmsSectionTitle>
        <form className="mt-8 space-y-5" onSubmit={saveDraft}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <CmsFieldLabel>Headline (portal &amp; email)</CmsFieldLabel>
              <CmsInput
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="block md:col-span-2">
              <CmsFieldLabel>Email subject</CmsFieldLabel>
              <CmsInput
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </label>
            <label className="block md:col-span-2">
              <CmsFieldLabel>Short preview (portal list)</CmsFieldLabel>
              <CmsTextarea
                required
                rows={2}
                value={form.preview}
                onChange={(e) => setForm((f) => ({ ...f, preview: e.target.value }))}
              />
            </label>
            <label className="block md:col-span-2">
              <CmsFieldLabel>Message body</CmsFieldLabel>
              <CmsTextarea
                required
                rows={8}
                value={form.bodyText}
                onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
                placeholder="Write the full announcement. Paragraphs are separated by blank lines."
              />
            </label>
            <label>
              <CmsFieldLabel>Public link (optional)</CmsFieldLabel>
              <CmsInput
                value={form.publicHref}
                onChange={(e) => setForm((f) => ({ ...f, publicHref: e.target.value }))}
                placeholder="https://…/news/… when live"
              />
            </label>
            <label>
              <CmsFieldLabel>Public go-live (optional)</CmsFieldLabel>
              <CmsInput
                type="datetime-local"
                value={form.goLiveAt}
                onChange={(e) => setForm((f) => ({ ...f, goLiveAt: e.target.value }))}
              />
            </label>
          </div>
          <CmsButton type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
          </CmsButton>
        </form>
      </CmsCard>

      <CmsCard className="p-8">
        <CmsSectionTitle description="Drafts can be sent once. Sent bulletins cannot be edited.">
          History
        </CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {announcements.length === 0 ? (
            <li className="text-sm text-slate-500">No announcements yet.</li>
          ) : (
            announcements.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Megaphone className="h-4 w-4 text-gcs-primary" aria-hidden />
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    {a.sentAt ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        Sent
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{a.preview}</p>
                  {a.sentAt ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {a.emailSuccessCount}/{a.recipientCount} emails ·{" "}
                      {new Date(a.sentAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                </div>
                {!a.sentAt ? (
                  <CmsButton
                    type="button"
                    disabled={sendingId === a.id || approvedCount === 0}
                    onClick={() => void sendToMembers(a.id, a.title)}
                    className="shrink-0"
                  >
                    {sendingId === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send to members
                      </>
                    )}
                  </CmsButton>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                    Portal + email delivered
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </CmsCard>
    </motion.div>
  );
}
