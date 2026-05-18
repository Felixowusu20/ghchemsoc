export function formatPublicationDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
}

export function formatPublicationDateIso(d: Date | null | undefined): string | undefined {
  if (!d) return undefined;
  return d.toISOString().slice(0, 10);
}

export function toLocalDateInput(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type PublicationArticleInput = {
  id?: string;
  title: string;
  authors: string;
  pdfHref?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export function normalizePublicationArticles(raw: PublicationArticleInput[]): PublicationArticleInput[] {
  return raw
    .map((a, i) => ({
      title: a.title.trim(),
      authors: a.authors.trim(),
      pdfHref: a.pdfHref?.trim() ? a.pdfHref.trim() : null,
      sortOrder: a.sortOrder ?? i,
      published: a.published ?? true,
    }))
    .filter((a) => a.title.length > 0 && a.authors.length > 0);
}
