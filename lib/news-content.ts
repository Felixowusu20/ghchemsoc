import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "class",
  "style",
  "colspan",
  "rowspan",
  "colwidth",
  "width",
  "data-row-height",
];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Builds a valid slug from an optional custom value and/or title. */
export function resolveNewsSlugBase(preferred: string | null | undefined, title: string): string {
  const fromPreferred = preferred?.trim().toLowerCase() ?? "";
  if (fromPreferred && SLUG_REGEX.test(fromPreferred)) return fromPreferred.slice(0, 120);
  const fromTitle = slugFromTitle(title);
  if (fromTitle && SLUG_REGEX.test(fromTitle)) return fromTitle;
  return `article-${Date.now()}`;
}

export function isValidNewsSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

export function excerptFromHtml(html: string | null | undefined, maxLen = 220): string {
  if (!html?.trim()) return "";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function sanitizeNewsHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel", "class", "style"],
      img: ["src", "alt", "class", "style"],
      table: ["class", "style", "width"],
      thead: ["class", "style"],
      tbody: ["class", "style"],
      tr: ["class", "style", "data-row-height"],
      th: ["colspan", "rowspan", "colwidth", "class", "style", "width"],
      td: ["colspan", "rowspan", "colwidth", "class", "style", "width"],
      colgroup: ["class", "style"],
      col: ["class", "style", "width"],
      p: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      ul: ["class", "style"],
      ol: ["class", "style"],
      li: ["class", "style"],
      blockquote: ["class", "style"],
      strong: ["class", "style"],
      b: ["class", "style"],
      em: ["class", "style"],
      i: ["class", "style"],
      u: ["class", "style"],
      s: ["class", "style"],
      br: [],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    disallowedTagsMode: "discard",
  });
}

export { isNewsBodyEmpty } from "@/lib/news-body-empty";

/** True when stored body is HTML from the rich text editor (vs legacy plain text). */
export function looksLikeRichHtml(body: string | null | undefined): boolean {
  const raw = body?.trim() ?? "";
  if (!raw) return false;
  return /<[a-z][\s\S]*>/i.test(raw);
}
