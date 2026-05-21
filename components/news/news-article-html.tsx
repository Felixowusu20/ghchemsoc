import { sanitizeNewsHtml } from "@/lib/news-content";

export function NewsArticleHtml({ html }: { html: string }) {
  const safe = sanitizeNewsHtml(html);
  if (!safe) return null;

  return (
    <div
      className="news-article-prose gcs-rich-html mt-10 max-w-none overflow-x-auto text-base leading-relaxed text-gcs-foreground"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
