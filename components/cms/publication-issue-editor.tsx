"use client";

import { CmsButton, CmsFieldLabel, CmsInput, CmsTextarea } from "@/components/cms/cms-ui";
import { CmsImageUpload } from "@/components/cms/cms-image-upload";
import { Plus, Trash2 } from "lucide-react";

export type ArticleFormRow = {
  id?: string;
  title: string;
  authors: string;
  pdfHref: string;
};

export type IssueFormState = {
  title: string;
  journalTitle: string;
  description: string;
  meta: string;
  issue: string;
  href: string;
  publishedAt: string;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  imageUrl: string;
  imagePublicId: string | null;
  imageAlt: string;
  /** One email per line (readers correspondence). */
  readerEmailsText: string;
  /** One email per line (authors correspondence). */
  authorEmailsText: string;
  articles: ArticleFormRow[];
};

export const emptyIssueForm = (): IssueFormState => ({
  title: "",
  journalTitle: "",
  description: "",
  meta: "",
  issue: "",
  href: "",
  publishedAt: "",
  sortOrder: 0,
  published: true,
  featured: false,
  imageUrl: "",
  imagePublicId: null,
  imageAlt: "",
  readerEmailsText: "",
  authorEmailsText: "",
  articles: [],
});

export function emptyArticleRow(): ArticleFormRow {
  return { title: "", authors: "", pdfHref: "" };
}

export function PublicationIssueEditor({
  form,
  setForm,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  form: IssueFormState;
  setForm: React.Dispatch<React.SetStateAction<IssueFormState>>;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
}) {
  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="md:col-span-2">
        <CmsImageUpload
          label="Journal cover"
          folder="publications"
          required
          helperText="Portrait cover image shown beside the published date on the issue page."
          previewUrl={form.imageUrl || null}
          onChange={(url, publicId) => setForm((f) => ({ ...f, imageUrl: url, imagePublicId: publicId }))}
          onClear={() => setForm((f) => ({ ...f, imageUrl: "", imagePublicId: null }))}
        />
      </div>
      <label className="md:col-span-2">
        <CmsFieldLabel>Cover alt text</CmsFieldLabel>
        <CmsInput value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
      </label>
      <label className="md:col-span-2">
        <CmsFieldLabel>Issue title</CmsFieldLabel>
        <CmsInput
          required
          placeholder="Vol. 51 No. 2 (2026): J. Chem. Soc. Nigeria"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </label>
      <label className="md:col-span-2">
        <CmsFieldLabel>Journal subtitle (optional)</CmsFieldLabel>
        <CmsInput
          placeholder="Journal of the Chemical Society of Nigeria"
          value={form.journalTitle}
          onChange={(e) => setForm((f) => ({ ...f, journalTitle: e.target.value }))}
        />
      </label>
      <label className="md:col-span-2">
        <CmsFieldLabel>Issue introduction</CmsFieldLabel>
        <CmsTextarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </label>
      <label>
        <CmsFieldLabel>Published date</CmsFieldLabel>
        <CmsInput
          type="date"
          value={form.publishedAt}
          onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
        />
      </label>
      <label>
        <CmsFieldLabel>Meta tag (optional)</CmsFieldLabel>
        <CmsInput
          placeholder="Quarterly · 2026"
          value={form.meta}
          onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
        />
      </label>
      <label>
        <CmsFieldLabel>Volume label (optional)</CmsFieldLabel>
        <CmsInput value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} />
      </label>
      <label>
        <CmsFieldLabel>Sort order</CmsFieldLabel>
        <CmsInput
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
        />
      </label>
      <label className="md:col-span-2">
        <CmsFieldLabel>External issue link (optional)</CmsFieldLabel>
        <CmsInput value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="https://…" />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
        Published on site
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
        Current issue (featured on archives)
      </label>

      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <p className="text-sm font-semibold text-slate-900">Readers &amp; authors (contact emails)</p>
        <p className="mt-1 text-sm text-slate-600">
          Stored for editorial correspondence only — not shown as links on the public publications page.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <CmsFieldLabel>Reader emails</CmsFieldLabel>
            <CmsTextarea
              rows={4}
              placeholder={"readers@example.org\nsubscriptions@example.org"}
              value={form.readerEmailsText}
              onChange={(e) => setForm((f) => ({ ...f, readerEmailsText: e.target.value }))}
            />
            <span className="mt-1 block text-xs text-slate-500">One address per line</span>
          </label>
          <label className="block">
            <CmsFieldLabel>Author emails</CmsFieldLabel>
            <CmsTextarea
              rows={4}
              placeholder={"authors@example.org\neditorial@example.org"}
              value={form.authorEmailsText}
              onChange={(e) => setForm((f) => ({ ...f, authorEmailsText: e.target.value }))}
            />
            <span className="mt-1 block text-xs text-slate-500">One address per line</span>
          </label>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-900">Articles in this issue</p>
          <CmsButton
            type="button"
            variant="ghost"
            onClick={() => setForm((f) => ({ ...f, articles: [...f.articles, emptyArticleRow()] }))}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add article
          </CmsButton>
        </div>
        <ul className="mt-4 space-y-4">
          {form.articles.map((article, i) => (
            <li key={i} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Article {i + 1}</span>
                <button
                  type="button"
                  className="text-slate-500 hover:text-red-600"
                  onClick={() => setForm((f) => ({ ...f, articles: f.articles.filter((_, j) => j !== i) }))}
                  aria-label="Remove article"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <label className="block">
                <CmsFieldLabel>Title</CmsFieldLabel>
                <CmsTextarea
                  rows={2}
                  value={article.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      articles: f.articles.map((a, j) => (j === i ? { ...a, title: e.target.value } : a)),
                    }))
                  }
                />
              </label>
              <label className="mt-3 block">
                <CmsFieldLabel>Authors</CmsFieldLabel>
                <CmsInput
                  placeholder="A. Author, B. Author, C. Author"
                  value={article.authors}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      articles: f.articles.map((a, j) => (j === i ? { ...a, authors: e.target.value } : a)),
                    }))
                  }
                />
              </label>
              <label className="mt-3 block">
                <CmsFieldLabel>PDF link</CmsFieldLabel>
                <CmsInput
                  placeholder="https://…/article.pdf"
                  value={article.pdfHref}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      articles: f.articles.map((a, j) => (j === i ? { ...a, pdfHref: e.target.value } : a)),
                    }))
                  }
                />
              </label>
            </li>
          ))}
          {!form.articles.length ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              No articles yet. Add at least one for the issue table of contents.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <CmsButton type="submit">{submitLabel}</CmsButton>
        {onCancel ? (
          <CmsButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </CmsButton>
        ) : null}
      </div>
    </form>
  );
}
