import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { getPublishedPublications } from "@/lib/cms-queries";

export const metadata: Metadata = {
  title: "Research & publications | Ghana Chemical Society",
  description: "Journals, bulletins, and technical outputs from the Ghana Chemical Society.",
};

export default async function PublicationsPage() {
  const rows = await getPublishedPublications();
  const list = rows.filter((r) => r.media);
  const featured = list[0];
  const rest = list.slice(1);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gcs-muted-bg/40 pb-24 pt-28 md:pb-32 md:pt-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12">
          <header className="flex flex-col gap-10 border-b border-gcs-border pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
            <div className="max-w-2xl md:max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/50 px-4 py-1.5 text-sm font-medium text-gcs-muted-text">
                <BookOpen className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
                Research &amp; publications
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Journals, bulletins, and society outputs
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-gcs-muted-text md:text-base">
                Managed in <span className="font-mono text-xs">/cms/publications</span>.
              </p>
            </div>
            <Link
              href="/news"
              className="group inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover md:self-auto"
            >
              News &amp; calls
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </header>

          {!featured ? (
            <p className="mt-12 text-gcs-muted-text">No published items with images yet.</p>
          ) : (
            <>
              <section className="mt-12 lg:mt-14" aria-labelledby="featured-pub-heading">
                <h2 id="featured-pub-heading" className="sr-only">
                  Featured publication
                </h2>
                <article className="overflow-hidden rounded-[1.75rem] border border-gcs-border/55 bg-gcs-surface ring-1 ring-gcs-border/20 lg:rounded-[2rem]">
                  <div className="flex flex-col lg:min-h-[300px] lg:flex-row">
                    <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[46%] lg:min-h-[300px]">
                      <Image
                        src={featured.media!.url}
                        alt={featured.media!.alt ?? featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 44vw"
                        priority
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center border-t border-gcs-border/60 bg-gcs-surface px-6 py-8 md:px-10 lg:border-l lg:border-t-0">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
                        {featured.meta ? <span className="text-gcs-primary">{featured.meta}</span> : null}
                        {featured.issue ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
                            <span>{featured.issue}</span>
                          </>
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-[1.65rem] md:leading-snug">
                        {featured.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">{featured.description}</p>
                      {featured.href ? (
                        <a
                          href={featured.href}
                          className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/40 px-5 py-2.5 text-sm font-semibold text-gcs-foreground transition-colors hover:border-gcs-primary hover:bg-gcs-primary hover:text-white"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open resource
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </section>

              <section className="mt-14 lg:mt-16">
                <h2 className="text-xl font-semibold tracking-tight text-gcs-foreground md:text-2xl">More publications</h2>
                <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((pub) => (
                    <li key={pub.id}>
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gcs-border/50 bg-gcs-surface ring-1 ring-gcs-border/15">
                        <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden border-b border-gcs-border/40">
                          <Image
                            src={pub.media!.url}
                            alt={pub.media!.alt ?? pub.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gcs-primary">{pub.meta ?? "Publication"}</p>
                          <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-gcs-foreground">{pub.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gcs-muted-text">{pub.description}</p>
                          {pub.href ? (
                            <a
                              href={pub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
                            >
                              Open
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
