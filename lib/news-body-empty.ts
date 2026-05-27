/** Client-safe body empty check (no DOMPurify — safe for CMS bundles). */
export function isNewsBodyEmpty(html: string | null | undefined): boolean {
  const raw = html?.trim() ?? "";
  if (!raw) return true;
  const text = raw.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
  return text.length === 0;
}
