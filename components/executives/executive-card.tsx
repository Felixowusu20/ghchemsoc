import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ExecutivePublic } from "@/lib/executive-defaults";
import { ExecutivePortrait } from "@/components/executives/executive-portrait";

export function ExecutiveCard({ executive }: { executive: ExecutivePublic }) {
  const excerpt =
    executive.bio && executive.bio.length > 160 ? `${executive.bio.slice(0, 157).trim()}…` : executive.bio;

  return (
    <Link
      href={`/executives/${executive.id}`}
      className="group flex h-full flex-row items-stretch overflow-hidden rounded-2xl border border-gcs-border/80 bg-white shadow-[0_10px_40px_-18px_rgba(29,78,216,0.18)] ring-1 ring-gcs-border/30 transition-all duration-300 hover:border-gcs-primary/30 active:scale-[0.99] sm:flex-col sm:hover:-translate-y-0.5 sm:hover:shadow-[0_20px_50px_-20px_rgba(29,78,216,0.28)] sm:rounded-3xl"
    >
      {/* Mobile: compact portrait column · Desktop: full-width hero image */}
      <div className="relative w-[min(36vw,10.5rem)] max-w-[10.5rem] shrink-0 self-stretch overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 sm:aspect-[4/5] sm:w-full sm:max-w-none">
        <ExecutivePortrait
          name={executive.name}
          imageUrl={executive.media?.url}
          imageAlt={executive.media?.alt}
          variant="card"
          className="min-h-[8.75rem] sm:min-h-0"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-20 bg-gradient-to-t from-black/30 to-transparent sm:block"
          aria-hidden
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4 sm:p-7">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gcs-primary sm:text-xs sm:tracking-[0.16em]">
          {executive.role}
        </p>
        <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-gcs-foreground transition-colors group-hover:text-gcs-primary sm:mt-2 sm:text-xl sm:leading-tight md:text-[1.35rem]">
          {executive.name}
        </h2>
        {excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:mt-3 sm:line-clamp-none">{excerpt}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500 sm:mt-3">View profile</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gcs-primary sm:mt-5">
          Read profile
          <ArrowUpRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
