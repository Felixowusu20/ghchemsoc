import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

type Props = {
  count: number;
};

export function ExecutivesPageHero({ count }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-gcs-border/60 bg-gradient-to-b from-blue-50/50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(29,78,216,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,#1e40af_1px,transparent_0)] [background-size:24px_24px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:px-10 md:pb-16 md:pt-32">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to about
        </Link>
        <header className="mx-auto mt-8 max-w-3xl text-center md:mt-10" data-aos="fade-up">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/95 px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
            <Users className="h-4 w-4 text-gcs-primary" aria-hidden />
            Leadership
          </div>
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-gcs-foreground sm:text-3xl md:text-4xl lg:text-[2.65rem]">
            Executive officers
          </h1>
          <p className="gcs-lead mx-auto mt-5 max-w-2xl">
            Meet the elected and appointed leaders who steward programmes, governance, and representation for
            chemists and chemical professionals across Ghana.
          </p>
          {count > 0 ? (
            <p className="mt-4 text-sm font-medium text-gcs-muted-text">
              {count} {count === 1 ? "profile" : "profiles"} · select an officer to read more
            </p>
          ) : null}
        </header>
      </div>
    </section>
  );
}
