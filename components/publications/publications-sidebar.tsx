import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Media, Publication } from "@prisma/client";
import { formatPublicationDate } from "@/lib/publication-format";

type ArchiveRow = Publication & { media: Media | null };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b-2 border-gcs-primary pb-2 text-xs font-bold uppercase tracking-[0.2em] text-gcs-muted-text">
      {children}
    </h2>
  );
}

export function PublicationsSidebar({
  archives,
  currentId,
}: {
  archives: ArchiveRow[];
  currentId?: string;
}) {
  const others = archives.filter((a) => a.id !== currentId);

  return (
    <div className="space-y-10">
      <section aria-labelledby="current-issue-nav">
        <SectionLabel>
          <span id="current-issue-nav">Archives</span>
        </SectionLabel>
        <ul className="mt-4 list-none space-y-2">
          {others.length ? (
            others.map((issue) => (
              <li key={issue.id}>
                <Link
                  href={`/publications/${issue.id}`}
                  className="group flex gap-3 rounded-xl border border-gcs-border/50 bg-white p-3 transition-colors hover:border-gcs-primary/40 hover:bg-sky-50/40"
                >
                  {issue.media?.url ? (
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md border border-gcs-border/40 bg-gcs-surface">
                      <Image
                        src={issue.media.url}
                        alt={issue.media.alt ?? issue.title}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-gcs-primary">
                      <BookOpen className="h-5 w-5" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-gcs-foreground group-hover:text-gcs-primary">
                      {issue.title}
                    </p>
                    {issue.publishedAt ? (
                      <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-wide text-gcs-muted-text">
                        {formatPublicationDate(issue.publishedAt)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-gcs-muted-text">More issues will appear here as they are published.</li>
          )}
        </ul>
        <Link
          href="/publications"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
        >
          All issues
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
}
