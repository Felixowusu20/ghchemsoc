const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parse one email per line or comma-separated; invalid tokens are dropped. */
export function parseContactEmails(text: string): string[] {
  const raw = text
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of raw) {
    if (!EMAIL_RE.test(e) || seen.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

export function formatContactEmailsForTextarea(emails: unknown): string {
  if (!Array.isArray(emails)) return "";
  return emails.filter((x): x is string => typeof x === "string" && EMAIL_RE.test(x.trim())).join("\n");
}

export function contactEmailsFromDb(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && EMAIL_RE.test(x.trim()));
}
