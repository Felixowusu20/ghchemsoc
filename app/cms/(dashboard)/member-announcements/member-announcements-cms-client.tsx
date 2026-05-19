"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Mail,
  Megaphone,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { handleCmsResponse, notifyCmsError, notifyCmsSuccess } from "@/lib/cms-toast";
import type { MemberAnnouncementDto, MemberResourceKind } from "@/lib/member-announcements";

type ResourceDraft = {
  label: string;
  url: string;
  kind: MemberResourceKind;
};

type FormState = {
  title: string;
  subject: string;
  preview: string;
  bodyText: string;
  publicHref: string;
  goLiveAt: string;
  resources: ResourceDraft[];
};

const RESOURCE_KINDS: { value: MemberResourceKind; label: string }[] = [
  { value: "conference", label: "Conference" },
  { value: "video", label: "Video" },
  { value: "summary", label: "Summary" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
];

const emptyForm: FormState = {
  title: "",
  subject: "",
  preview: "",
  bodyText: "",
  publicHref: "",
  goLiveAt: "",
  resources: [],
};

function emptyResource(): ResourceDraft {
  return { label: "", url: "", kind: "link" };
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function announcementToForm(a: MemberAnnouncementDto): FormState {
  return {
    title: a.title,
    subject: a.subject,
    preview: a.preview,
    bodyText: a.bodyText,
    publicHref: a.publicHref ?? "",
    goLiveAt: toDatetimeLocal(a.goLiveAt),
    resources: a.resourceLinks.map((r) => ({
      label: r.label,
      url: r.url,
      kind: r.kind ?? "link",
    })),
  };
}

export function MemberAnnouncementsCmsClient() {
  const [announcements, setAnnouncements] = useState<MemberAnnouncementDto[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MemberAnnouncementDto | null>(null);
  const [pendingSend, setPendingSend] = useState<MemberAnnouncementDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);

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

  function buildPayload() {
    const cleanedResources = form.resources
      .map((r) => ({ label: r.label.trim(), url: r.url.trim(), kind: r.kind }))
      .filter((r) => r.label.length > 0 && r.url.length > 0);
    return {
      title: form.title,
      subject: form.subject,
      preview: form.preview,
      bodyText: form.bodyText,
      publicHref: form.publicHref.trim() || null,
      goLiveAt: form.goLiveAt.trim() ? new Date(form.goLiveAt).toISOString() : null,
      resourceLinks: cleanedResources,
    };
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const payload = buildPayload();
    const isEdit = editingId !== null;
    const res = await fetch(
      isEdit ? `/api/cms/member-announcements/${editingId}` : "/api/cms/member-announcements",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        ...cmsCredentials,
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (
      await handleCmsResponse(res, isEdit ? "Announcement updated" : "Draft saved", { setErr })
    ) {
      setForm(emptyForm);
      setEditingId(null);
      await load();
    }
  }

  function startEdit(a: MemberAnnouncementDto) {
    setEditingId(a.id);
    setForm(announcementToForm(a));
    setErr(null);
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErr(null);
  }

  async function confirmDeleteAnnouncement() {
    const a = pendingDelete;
    if (!a) return;
    setDeletingId(a.id);
    const res = await fetch(`/api/cms/member-announcements/${a.id}`, {
      method: "DELETE",
      ...cmsCredentials,
    });
    setDeletingId(null);
    if (await handleCmsResponse(res, "Announcement deleted", { setErr })) {
      if (editingId === a.id) cancelEdit();
      setPendingDelete(null);
      await load();
    }
  }

  async function confirmSendToMembers() {
    const a = pendingSend;
    if (!a) return;
    setSendingId(a.id);
    const res = await fetch(`/api/cms/member-announcements/${a.id}/send`, {
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
    notifyCmsSuccess(
      "Sent to members",
      `${data.send.emailSuccessCount} of ${data.send.recipientCount} emails delivered. Every member also has an inbox message.`
    );
    if (data.send.errors.length > 0) {
      notifyCmsError("Some emails failed", data.send.errors.slice(0, 3).join(" · "));
    }
    setPendingSend(null);
    await load();
  }

  function addResource() {
    setForm((f) => ({ ...f, resources: [...f.resources, emptyResource()] }));
  }
  function updateResource(index: number, patch: Partial<ResourceDraft>) {
    setForm((f) => ({
      ...f,
      resources: f.resources.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }
  function removeResource(index: number) {
    setForm((f) => ({ ...f, resources: f.resources.filter((_, i) => i !== index) }));
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  const editingAnnouncement = editingId
    ? announcements.find((a) => a.id === editingId) ?? null
    : null;

  return (
    <motion.div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Members &amp; community</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Member announcements</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Share bulletins, conference resources, videos, summaries, and other members-only content with all{" "}
          <strong>{approvedCount}</strong> registered member(s). When you click <em>Send to members</em>, every
          registered member receives an email and a message in their portal inbox at the same time.{" "}
          <Link href="/cms/membership" className="font-medium text-gcs-primary hover:underline">
            Back to membership approvals
          </Link>
        </p>
      </div>

      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <div ref={formCardRef}>
        <CmsCard className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CmsSectionTitle description="Members see this in their email inbox and in the Inbox section of the member portal.">
              {editingAnnouncement ? "Edit bulletin" : "Compose bulletin"}
            </CmsSectionTitle>
            {editingAnnouncement ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Cancel edit
              </button>
            ) : null}
          </div>

          {editingAnnouncement?.sentAt ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              You are editing a bulletin that was already sent on{" "}
              {new Date(editingAnnouncement.sentAt).toLocaleString("en-GB")}. Saving updates the version members see
              in their portal inbox — the original email that was delivered cannot be changed or recalled.
            </p>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={submitForm}>
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
                <CmsFieldLabel>Short preview (portal inbox list)</CmsFieldLabel>
                <CmsTextarea
                  required
                  rows={2}
                  value={form.preview}
                  onChange={(e) => setForm((f) => ({ ...f, preview: e.target.value }))}
                />
              </label>
              <label className="block md:col-span-2">
                <CmsFieldLabel>
                  Message body — shared across all {approvedCount} registered member(s)
                </CmsFieldLabel>
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

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Paperclip className="h-4 w-4 text-gcs-primary" aria-hidden />
                    Members-only resources
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Attach conference recordings, slide decks, videos, or summary documents. Only registered members
                    receive these links in the email and inbox.
                  </p>
                </div>
                <CmsButton type="button" variant="ghost" onClick={addResource} className="gap-2">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add resource
                </CmsButton>
              </div>

              {form.resources.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">No resources attached.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {form.resources.map((res, index) => (
                    <li
                      key={index}
                      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_2fr_8rem_2.5rem]"
                    >
                      <label className="block">
                        <CmsFieldLabel>Label</CmsFieldLabel>
                        <CmsInput
                          value={res.label}
                          onChange={(e) => updateResource(index, { label: e.target.value })}
                          placeholder="2026 Annual Conference recap"
                        />
                      </label>
                      <label className="block">
                        <CmsFieldLabel>URL</CmsFieldLabel>
                        <CmsInput
                          value={res.url}
                          onChange={(e) => updateResource(index, { url: e.target.value })}
                          placeholder="https://drive.google.com/…"
                        />
                      </label>
                      <label className="block">
                        <CmsFieldLabel>Kind</CmsFieldLabel>
                        <select
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={res.kind}
                          onChange={(e) =>
                            updateResource(index, { kind: e.target.value as MemberResourceKind })
                          }
                        >
                          {RESOURCE_KINDS.map((k) => (
                            <option key={k.value} value={k.value}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-lg text-red-600 transition hover:bg-red-50"
                        aria-label="Remove resource"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CmsButton type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingAnnouncement ? (
                  "Save changes"
                ) : (
                  "Save draft"
                )}
              </CmsButton>
              {editingAnnouncement ? (
                <CmsButton type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </CmsButton>
              ) : null}
            </div>
          </form>
        </CmsCard>
      </div>

      <CmsCard className="p-8">
        <CmsSectionTitle description="Edit a sent bulletin to update what members see in their portal inbox, or delete it to remove it from their inbox entirely.">
          History
        </CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {announcements.length === 0 ? (
            <li className="text-sm text-slate-500">No announcements yet.</li>
          ) : (
            announcements.map((a) => {
              const isEditing = editingId === a.id;
              return (
                <li
                  key={a.id}
                  className={`flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-start sm:justify-between ${
                    isEditing ? "border-gcs-primary/40 ring-2 ring-gcs-primary/10" : "border-slate-200/80"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Megaphone className="h-4 w-4 text-gcs-primary" aria-hidden />
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      {a.sentAt ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          Sent to members
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          Draft
                        </span>
                      )}
                      {isEditing ? (
                        <span className="rounded-full bg-gcs-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-gcs-primary">
                          Editing
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{a.preview}</p>
                    {a.resourceLinks.length > 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {a.resourceLinks.length} members-only resource(s) attached
                      </p>
                    ) : null}
                    {a.sentAt ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {a.emailSuccessCount}/{a.recipientCount} emails ·{" "}
                        {new Date(a.sentAt).toLocaleString("en-GB")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    {!a.sentAt ? (
                      <CmsButton
                        type="button"
                        disabled={sendingId === a.id || approvedCount === 0}
                        onClick={() => setPendingSend(a)}
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
                        Inbox + email delivered
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <CmsButton
                        type="button"
                        variant="ghost"
                        onClick={() => startEdit(a)}
                        disabled={isEditing}
                        className="gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </CmsButton>
                      <CmsButton
                        type="button"
                        variant="danger"
                        onClick={() => setPendingDelete(a)}
                        disabled={deletingId === a.id}
                        className="gap-1.5"
                      >
                        {deletingId === a.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        )}
                        Delete
                      </CmsButton>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </CmsCard>

      <ConfirmDialog
        open={pendingDelete !== null}
        variant="danger"
        title={
          pendingDelete?.sentAt
            ? "Delete this sent bulletin?"
            : "Delete this draft?"
        }
        description={
          pendingDelete ? (
            <>
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">&ldquo;{pendingDelete.title}&rdquo;</span>.
              {pendingDelete.sentAt
                ? " It will disappear from every member's portal inbox."
                : " This draft will be permanently removed."}
            </>
          ) : null
        }
        highlights={
          pendingDelete ? (
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>This action cannot be undone.</span>
              </li>
              {pendingDelete.sentAt ? (
                <>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      Emails already delivered to {pendingDelete.recipientCount} member(s) cannot be recalled.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>Members will lose the inbox copy and any attached members-only resources.</span>
                  </li>
                </>
              ) : (
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>No emails or inbox messages have been sent yet.</span>
                </li>
              )}
            </ul>
          ) : null
        }
        confirmLabel="Delete announcement"
        cancelLabel="Keep it"
        loading={deletingId !== null}
        onConfirm={confirmDeleteAnnouncement}
        onCancel={() => {
          if (deletingId === null) setPendingDelete(null);
        }}
      />

      <ConfirmDialog
        open={pendingSend !== null}
        variant="primary"
        title="Send this bulletin to every registered member?"
        description={
          pendingSend ? (
            <>
              <span className="font-semibold text-slate-900">&ldquo;{pendingSend.title}&rdquo;</span> will
              be emailed and posted to the portal inbox of every approved member.
            </>
          ) : null
        }
        highlights={
          pendingSend ? (
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gcs-primary" />
                <span>
                  Reaching <span className="font-semibold text-slate-900">{approvedCount}</span> registered
                  member(s).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gcs-primary" />
                <span>
                  Each recipient receives an email <em>and</em> a copy in their portal inbox.
                </span>
              </li>
              {pendingSend.resourceLinks.length > 0 ? (
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gcs-primary" />
                  <span>{pendingSend.resourceLinks.length} members-only resource(s) attached.</span>
                </li>
              ) : null}
            </ul>
          ) : null
        }
        confirmLabel={`Send to ${approvedCount} member${approvedCount === 1 ? "" : "s"}`}
        cancelLabel="Not yet"
        loading={sendingId !== null}
        onConfirm={confirmSendToMembers}
        onCancel={() => {
          if (sendingId === null) setPendingSend(null);
        }}
      />
    </motion.div>
  );
}
