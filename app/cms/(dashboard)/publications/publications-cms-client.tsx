"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cmsCredentials, CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-fetch";
import { CmsButton, CmsCard } from "@/components/cms/cms-ui";
import { CmsListActions } from "@/components/cms/cms-list-actions";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { handleCmsResponse } from "@/lib/cms-toast";
import { formatContactEmailsForTextarea, parseContactEmails } from "@/lib/publication-contact-emails";
import { toLocalDateInput } from "@/lib/publication-format";
import {
  emptyIssueForm,
  PublicationIssueEditor,
  type IssueFormState,
} from "@/components/cms/publication-issue-editor";

type ApiRow = {
  id: string;
  title: string;
  journalTitle: string | null;
  meta: string | null;
  description: string;
  issue: string | null;
  href: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  sortOrder: number;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
  readerEmails: string[];
  authorEmails: string[];
  articles: { id: string; title: string; authors: string; pdfHref: string | null }[];
};

function rowToForm(row: ApiRow): IssueFormState {
  return {
    title: row.title,
    journalTitle: row.journalTitle ?? "",
    description: row.description,
    meta: row.meta ?? "",
    issue: row.issue ?? "",
    href: row.href ?? "",
    publishedAt: toLocalDateInput(row.publishedAt),
    sortOrder: row.sortOrder,
    published: row.published,
    featured: row.featured,
    imageUrl: row.imageUrl,
    imagePublicId: row.imagePublicId,
    imageAlt: row.imageAlt,
    readerEmailsText: formatContactEmailsForTextarea(row.readerEmails),
    authorEmailsText: formatContactEmailsForTextarea(row.authorEmails),
    articles: row.articles.map((a) => ({
      id: a.id,
      title: a.title,
      authors: a.authors,
      pdfHref: a.pdfHref ?? "",
    })),
  };
}

function formPayload(form: IssueFormState) {
  return {
    title: form.title,
    journalTitle: form.journalTitle || null,
    description: form.description,
    meta: form.meta || null,
    issue: form.issue || null,
    href: form.href || null,
    published: form.published,
    featured: form.featured,
    publishedAt: form.publishedAt || null,
    sortOrder: form.sortOrder,
    imageUrl: form.imageUrl,
    imagePublicId: form.imagePublicId,
    imageAlt: form.imageAlt || form.title,
    readerEmails: parseContactEmails(form.readerEmailsText),
    authorEmails: parseContactEmails(form.authorEmailsText),
    articles: form.articles.map((a, i) => ({
      id: a.id,
      title: a.title,
      authors: a.authors,
      pdfHref: a.pdfHref || null,
      sortOrder: i,
    })),
  };
}

export function PublicationsCmsClient() {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<IssueFormState>(emptyIssueForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/cms/publications", cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? CMS_UNAUTHORIZED_MESSAGE : await res.text());
      setRows([]);
      setLoading(false);
      return;
    }
    setRows((await res.json()) as ApiRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyIssueForm());
  }

  function startEdit(row: ApiRow) {
    setEditingId(row.id);
    setForm(rowToForm(row));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.imageUrl) {
      setErr("Upload a journal cover image.");
      return;
    }

    const payload = formPayload(form);
    const res = editingId
      ? await fetch(`/api/cms/publications/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        })
      : await fetch("/api/cms/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...cmsCredentials,
          body: JSON.stringify(payload),
        });

    const msg = editingId ? "Issue updated" : "Issue created";
    if (await handleCmsResponse(res, msg, { setErr })) {
      setEditingId(null);
      setForm(emptyIssueForm());
      await load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/cms/publications/${id}`, { method: "DELETE", ...cmsCredentials });
    if (await handleCmsResponse(res, "Issue deleted", { setErr })) {
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyIssueForm());
      }
      await load();
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Publications</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Manage journal issues for the public site: cover and published date, plus a table of articles with PDF links.
          Visitors see them on the Publications page.
        </p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <CmsCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CmsSectionTitle>{editingId ? "Edit issue" : "New journal issue"}</CmsSectionTitle>
          {editingId ? (
            <CmsButton type="button" variant="ghost" onClick={startCreate}>
              + New instead
            </CmsButton>
          ) : null}
        </div>
        <PublicationIssueEditor
          form={form}
          setForm={setForm}
          submitLabel={editingId ? "Save changes" : "Create issue"}
          onSubmit={save}
          onCancel={editingId ? startCreate : undefined}
        />
      </CmsCard>

      <div>
        <CmsSectionTitle>All issues</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                {r.imageUrl ? (
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <Image src={r.imageUrl} alt={r.imageAlt || r.title} fill className="object-cover" sizes="80px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gcs-primary">
                    {r.featured ? "Current issue · " : ""}
                    {r.published ? "Live" : "Draft"} · {r.articles.length} article{r.articles.length === 1 ? "" : "s"}
                  </p>
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{r.description}</p>
                  {(r.readerEmails.length > 0 || r.authorEmails.length > 0) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {r.readerEmails.length} reader · {r.authorEmails.length} author email
                      {r.authorEmails.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <CmsListActions
                  onEdit={() => startEdit(r)}
                  onDelete={() => remove(r.id)}
                  confirm={{
                    title: "Delete this journal issue?",
                    description: (
                      <>
                        <span className="font-semibold text-slate-900">&ldquo;{r.title}&rdquo;</span>{" "}
                        will be removed from the public Publications page.
                      </>
                    ),
                    highlights: (
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <span>
                            All {r.articles.length} attached article{r.articles.length === 1 ? "" : "s"} will be
                            deleted with the issue.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <span>This action cannot be undone.</span>
                        </li>
                      </ul>
                    ),
                    confirmLabel: "Delete issue",
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
