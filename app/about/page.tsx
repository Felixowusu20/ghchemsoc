import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { getPublishedAboutSections } from "@/lib/cms-queries";
import { ArrowUpRight, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Ghana Chemical Society",
  description: "Mission, programmes, and values of the Ghana Chemical Society.",
};

export default async function AboutPage() {
  const sections = await getPublishedAboutSections();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gcs-foreground" data-aos="fade-up">
        {/* Intro band — white, crisp top */}
        <div className="border-b border-gcs-border/50 bg-white">
          <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-28 sm:px-6 md:px-12 md:pb-16 md:pt-32">
            <header className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-1.5 text-sm font-medium text-gcs-muted-text shadow-sm">
                <Landmark className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
                About the society
              </div>
              <h1 className="text-3xl font-medium tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Who we are
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gcs-muted-text md:text-base">
                The Ghana Chemical Society brings together educators, researchers, students, and partners to strengthen
                chemical sciences across the country — from classrooms and laboratories to policy and industry.
              </p>
            </header>
          </div>
        </div>

        {/* Content — light neutral strip so white cards read clearly */}
        <div className="border-b border-gcs-border/40 bg-slate-50/60">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:px-12 md:py-20">
            {sections.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-gcs-border bg-white px-8 py-14 text-center shadow-sm">
                <p className="text-base font-medium text-gcs-foreground">Content coming soon</p>
                <p className="mt-2 text-sm text-gcs-muted-text">
                  Society sections will appear here once they are published in the admin.
                </p>
              </div>
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-8 md:gap-10">
                {sections.map((s, i) => {
                  const hasMedia = Boolean(s.media);
                  const isWide = s.layout === "wide";

                  if (isWide) {
                    return (
                      <article
                        key={s.id}
                        className="overflow-hidden rounded-2xl border border-gcs-border/60 bg-white shadow-sm ring-1 ring-slate-900/[0.04] md:rounded-[1.75rem]"
                      >
                        {hasMedia ? (
                          <div className="relative aspect-[21/9] w-full min-h-[200px] border-b border-gcs-border/50 bg-slate-100">
                            <Image
                              src={s.media!.url}
                              alt={s.media!.alt ?? s.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 896px"
                              priority={i === 0}
                            />
                          </div>
                        ) : null}
                        <div className="px-6 py-8 md:px-10 md:py-10">
                          <h2 className="text-xl font-semibold tracking-tight text-gcs-foreground md:text-2xl">{s.title}</h2>
                          {s.subtitle ? <p className="mt-2 text-base font-medium text-gcs-primary md:text-lg">{s.subtitle}</p> : null}
                          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gcs-muted-text md:text-base">
                            {s.body.split("\n\n").map((block, j) => (
                              <p key={j}>{block}</p>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  }

                  const imageFirst = i % 2 === 0;

                  return (
                    <article
                      key={s.id}
                      className="overflow-hidden rounded-2xl border border-gcs-border/60 bg-white shadow-sm ring-1 ring-slate-900/[0.04] md:rounded-[1.75rem]"
                    >
                      <div
                        className={`grid gap-0 md:grid-cols-2 md:items-stretch ${!hasMedia ? "md:grid-cols-1" : ""}`}
                      >
                        {hasMedia ? (
                          <div
                            className={`relative min-h-[220px] border-gcs-border/50 bg-slate-100 md:min-h-[280px] ${
                              imageFirst ? "border-b md:order-1 md:border-b-0 md:border-r" : "border-b md:order-2 md:border-b-0 md:border-l"
                            }`}
                          >
                            <Image
                              src={s.media!.url}
                              alt={s.media!.alt ?? s.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority={i === 0}
                            />
                          </div>
                        ) : null}
                        <div
                          className={`flex flex-col justify-center px-6 py-8 md:px-10 md:py-10 ${
                            hasMedia ? (imageFirst ? "md:order-2" : "md:order-1") : ""
                          }`}
                        >
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gcs-muted-text">
                            Section {String(i + 1).padStart(2, "0")}
                          </p>
                          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gcs-foreground md:text-2xl">{s.title}</h2>
                          {s.subtitle ? (
                            <p className="mt-2 text-base font-medium text-gcs-primary md:text-lg">{s.subtitle}</p>
                          ) : null}
                          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">
                            {s.body.split("\n\n").map((block, j) => (
                              <p key={j}>{block}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA — solid white panel */}
        <div className="bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:px-12 md:py-16">
            <aside className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gcs-border/55 bg-white px-6 py-10 shadow-sm ring-1 ring-gcs-border/15 md:flex md:items-center md:justify-between md:gap-10 md:rounded-[1.75rem] md:px-10 md:py-12">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">Get involved</p>
                <p className="mt-3 text-lg font-medium tracking-tight text-gcs-foreground md:text-xl">
                  Collaborate with GCS or explore membership
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text md:text-base">
                  Whether you are joining as an individual, institution, or partner, we will point you to the right
                  pathway.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full bg-gcs-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gcs-primary-hover"
                >
                  Membership
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-6 py-3 text-sm font-semibold text-gcs-foreground transition-colors hover:border-gcs-primary hover:bg-slate-50"
                >
                  Contact
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
