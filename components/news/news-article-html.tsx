import { sanitizeNewsHtml } from "@/lib/news-content";
import { cn } from "@/lib/utils";

export function NewsArticleHtml({ html, className }: { html: string; className?: string }) {
  const safe = sanitizeNewsHtml(html);
  if (!safe) return null;

  return (
    <div
      className={cn(
        "news-article-prose gcs-rich-html max-w-none overflow-x-auto text-base leading-relaxed text-gcs-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
