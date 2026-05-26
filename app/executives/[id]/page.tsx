import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ContactFooter } from "@/components/home/contact-footer";
import { ExecutiveCard } from "@/components/executives/executive-card";
import { ExecutivePortrait } from "@/components/executives/executive-portrait";
import { getPublishedExecutiveById, getPublishedExecutives } from "@/lib/cms-queries";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const executives = await getPublishedExecutives();
  return executives.map((e) => ({ id: e.id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const executive = await getPublishedExecutiveById(id);
  if (!executive) return { title: "Executive not found" };
  return {
    title: `${executive.name} — ${executive.role} | Ghana Chemical Society`,
    description: executive.bio ?? `${executive.name}, ${executive.role} of the Ghana Chemical Society.`,
  };
}

export default async function ExecutiveProfilePage(props: PageProps) {
  const { id } = await props.params;
  const executive = await getPublishedExecutiveById(id);
  if (!executive) notFound();

  const all = await getPublishedExecutives();
  const others = all.filter((e) => e.id !== executive.id);
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gcs-foreground">
        <div className="relative overflow-hidden border-b border-gcs-border/60 bg-gradient-to-b from-blue-50/40 via-white to-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(29,78,216,0.08),transparent_55%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-[1200px] px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 md:px-10 md:pb-20 md:pt-32">
            <nav
              className="flex flex-wrap items-center gap-2 text-sm text-gcs-muted-text"
              aria-label="Breadcrumb"
              data-aos="fade-down"
            >
              <Link
                href="/executives"
                className="inline-flex items-center gap-1.5 font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                All executives
              </Link>
              <span className="text-gcs-border" aria-hidden>
                /
              </span>
              <span className="max-w-[min(100%,20rem)] truncate font-medium text-gcs-foreground">{executive.name}</span>
            </nav>

            <div className="mt-8 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,26rem)_1fr]">
              <div className="mx-auto w-full max-w-[min(100%,19rem)] sm:max-w-sm lg:mx-0 lg:max-w-none" data-aos="fade-right">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-gcs-border/70 bg-slate-100 shadow-[0_16px_40px_-20px_rgba(29,78,216,0.35)] ring-1 ring-gcs-border/40 sm:rounded-3xl sm:shadow-[0_20px_50px_-24px_rgba(29,78,216,0.35)]">
                  <ExecutivePortrait
                    name={executive.name}
                    imageUrl={executive.media?.url}
                    imageAlt={executive.media?.alt}
                    variant="detail"
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center" data-aos="fade-up" data-aos-delay="80">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gcs-primary">{executive.role}</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gcs-foreground sm:mt-3 sm:text-3xl md:text-4xl">
                  {executive.name}
                </h1>
                <div className="mt-6 rounded-2xl border border-gcs-border/70 bg-white/80 p-5 shadow-sm sm:mt-8 sm:p-8">
                  {executive.bio ? (
                    <div className="space-y-4 text-base leading-relaxed text-slate-700">
                      {executive.bio.split(/\n\n+/).map((paragraph) => (
                        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base leading-relaxed text-slate-600">
                      Profile details for {executive.name} will be published here soon.
                    </p>
                  )}
                </div>
                <Link
                  href="/executives"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-gcs-border bg-white px-5 py-2.5 text-sm font-semibold text-gcs-foreground shadow-sm transition-colors hover:border-gcs-primary/40 hover:text-gcs-primary"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to all officers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <section className="border-t border-gcs-border/60 bg-gradient-to-b from-slate-50/80 to-white py-16 md:py-20">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">Leadership</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gcs-foreground">Other executive officers</h2>
                </div>
                <Link
                  href="/executives"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
                >
                  View full directory
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-9">
                {others.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <ExecutiveCard executive={e} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <ContactFooter />
      </main>
    </>
  );
}
