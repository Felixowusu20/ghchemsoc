import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import type { Media, NewsItem } from "@prisma/client";

export type NewsListItem = NewsItem & { media: Media | null };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b-2 border-gcs-primary pb-2 text-xs font-bold uppercase tracking-[0.2em] text-gcs-muted-text">
      {children}
    </h2>
  );
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function NewsArticleSidebar({
  items,
  currentSlug,
}: {
  items: NewsListItem[];
  currentSlug: string;
}) {
  const others = items.filter((item) => item.slug !== currentSlug);

  return (
    <div className="space-y-6">
      <section aria-labelledby="more-news-heading">
        <SectionLabel>
          <span id="more-news-heading">More news</span>
        </SectionLabel>
        <ul className="mt-4 list-none space-y-2">
          {others.length ? (
            others.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group flex gap-3 rounded-xl border border-gcs-border/50 bg-white p-3 transition-colors hover:border-gcs-primary/40 hover:bg-sky-50/40"
                >
                  {post.media?.url ? (
                    <div className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-gcs-border/40 bg-gcs-surface">
                      <Image
                        src={post.media.url}
                        alt={post.media.alt ?? post.title}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-[4.5rem] shrink-0 items-center justify-center rounded-md bg-sky-50 text-gcs-primary">
                      <Newspaper className="h-5 w-5" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-gcs-foreground group-hover:text-gcs-primary">
                      {post.title}
                    </p>
                    <time
                      dateTime={post.date.toISOString()}
                      className="mt-1 block text-[0.65rem] font-medium uppercase tracking-wide text-gcs-muted-text"
                    >
                      {fmt(post.date)}
                    </time>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-gcs-muted-text">No other published stories yet.</li>
          )}
        </ul>
        <Link
          href="/news"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
        >
          All news
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
