import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ExecutivePublic } from "@/lib/executive-defaults";

const MAX_PORTRAITS = 5;

export function AboutExecutivesTeaser({ executives }: { executives: ExecutivePublic[] }) {
  if (executives.length === 0) return null;

  const preview = executives.slice(0, MAX_PORTRAITS);
  const remaining = executives.length - preview.length;

  return (
    <aside className="mt-12 md:mt-14" data-aos="fade-up" aria-labelledby="about-leadership-heading">
      <p
        id="about-leadership-heading"
        className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text"
      >
        Our leadership
      </p>

      <Link
        href="/executives"
        className="group flex overflow-hidden rounded-2xl border border-gcs-border/70 bg-white shadow-[0_8px_30px_-12px_rgba(29,78,216,0.12)] ring-1 ring-gcs-border/40 transition-all hover:border-gcs-primary/25 hover:shadow-[0_14px_40px_-14px_rgba(29,78,216,0.2)] sm:rounded-3xl"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto px-5 py-5 sm:gap-5 sm:px-7 sm:py-6">
          <ul className="flex items-center gap-3 sm:gap-4" aria-label="Executive officers">
            {preview.map((e) => (
              <li key={e.id} className="shrink-0">
                <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border border-gcs-border/60 bg-slate-50 shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-20 sm:w-20 sm:rounded-[1.15rem]">
                  {e.media?.url ? (
                    <Image
                      src={e.media.url}
                      alt={e.media.alt ?? e.name}
                      fill
                      className="object-cover object-top"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gcs-primary/10 text-base font-bold text-gcs-primary">
                      {e.name.charAt(0)}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {remaining > 0 ? (
              <li className="shrink-0">
                <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-dashed border-gcs-border bg-blue-50/80 text-sm font-bold text-gcs-primary sm:h-20 sm:w-20 sm:rounded-[1.15rem]">
                  +{remaining}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <span className="flex shrink-0 items-center justify-center gap-2 border-t border-gcs-border/50 bg-gradient-to-br from-blue-50/50 via-white to-white px-6 py-5 text-sm font-semibold text-gcs-foreground sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
          Leadership
          <ArrowUpRight className="h-4 w-4 text-gcs-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </aside>
  );
}
