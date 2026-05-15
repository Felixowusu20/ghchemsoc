import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { getPublishedSocietyEvents } from "@/lib/cms-queries";
import { ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Conferences & events | Ghana Chemical Society",
  description:
    "GCS symposia, workshops, and member gatherings—dates, venues, and how to take part.",
};

function formatEventDates(start: Date, end: Date | null) {
  const sameDay =
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (end && !sameDay) {
    const a = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const b = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${a}–${b}`;
  }
  return start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function EventsPage() {
  const rows = await getPublishedSocietyEvents();
  const featured = rows.find((r) => r.featured) ?? rows[0] ?? null;
  const others = featured ? rows.filter((r) => r.id !== featured.id) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gcs-muted-bg/40 pb-24 pt-28 md:pb-32 md:pt-32" data-aos="fade-up">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12">
          <header className="flex flex-col gap-10 border-b border-gcs-border pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
            <div className="max-w-2xl md:max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/50 px-4 py-1.5 text-sm font-medium text-gcs-muted-text">
                <Calendar className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
                Conferences &amp; events
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Meet the community in person and online
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-gcs-muted-text md:text-base">
                Symposia, technical workshops, and networking built around Ghana&rsquo;s chemistry educators, researchers,
                students, and partners.
              </p>
            </div>
            <Link
              href="/membership"
              className="group inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover md:self-auto"
            >
              Member rates &amp; alerts
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </header>

          {!rows.length ? (
            <div className="mt-16 rounded-[1.75rem] border border-dashed border-gcs-border bg-gcs-surface/80 px-8 py-16 text-center">
              <p className="text-lg font-medium text-gcs-foreground">No published events yet</p>
              <p className="mt-2 text-sm text-gcs-muted-text">
                Editors can add conferences and meetings in the CMS under Events. They will appear here automatically.
              </p>
            </div>
          ) : null}

          {featured ? (
            <section className="mt-12 lg:mt-14" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="sr-only">
                Featured event
              </h2>
              <article className="overflow-hidden rounded-[1.75rem] border border-gcs-border/55 bg-gcs-surface ring-1 ring-gcs-border/20 lg:rounded-[2rem]">
                <div className="flex flex-col lg:min-h-[300px] lg:flex-row">
                  {featured.media?.url ? (
                    <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[46%] lg:min-h-[300px]">
                      <Image
                        src={featured.media.url}
                        alt={featured.media.alt ?? featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 44vw"
                        priority
                      />
                    </div>
                  ) : null}
                  <div
                    className={`flex flex-1 flex-col justify-center border-t border-gcs-border/60 bg-gcs-surface px-6 py-8 md:px-10 lg:border-t-0 ${
                      featured.media?.url ? "lg:border-l" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
                      {featured.badge ? (
                        <>
                          <span className="rounded-full bg-gcs-muted-bg px-3 py-1 text-gcs-primary">{featured.badge}</span>
                          <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
                        </>
                      ) : null}
                      <time dateTime={featured.startDate.toISOString()}>
                        {formatEventDates(featured.startDate, featured.endDate)}
                      </time>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-[1.65rem] md:leading-snug">
                      {featured.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">{featured.excerpt}</p>
                    <ul className="mt-6 flex flex-col gap-2 text-sm text-gcs-foreground">
                      <li className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
                        <span>{featured.timeLabel}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
                        <span>{featured.location}</span>
                      </li>
                    </ul>
                    <Link
                      href={featured.href || "#"}
                      className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/40 px-5 py-2.5 text-sm font-semibold text-gcs-foreground transition-colors hover:border-gcs-primary hover:bg-gcs-primary hover:text-white"
                    >
                      View details
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </section>
          ) : null}

          {others.length ? (
            <section className="mt-14 lg:mt-16" aria-labelledby="upcoming-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 id="upcoming-heading" className="text-xl font-semibold tracking-tight text-gcs-foreground md:text-2xl">
                  {featured ? "More dates" : "Upcoming"}
                </h2>
                <p className="max-w-md text-sm text-gcs-muted-text">
                  Dates subject to final confirmation. Members receive calendar invites and discounted registration where
                  applicable.
                </p>
              </div>

              <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {others.map((event) => {
                  const img = event.media?.url;
                  return (
                    <li key={event.id}>
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gcs-border/50 bg-gcs-surface ring-1 ring-gcs-border/15 transition-colors hover:border-gcs-border hover:bg-gcs-muted-bg/20">
                        <Link href={event.href || "#"} className="flex flex-1 flex-col">
                          <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden border-b border-gcs-border/40 bg-gcs-muted-bg/30">
                            {img ? (
                              <Image
                                src={img}
                                alt={event.media?.alt ?? event.title}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                              />
                            ) : null}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">
                              <time dateTime={event.startDate.toISOString()}>
                                {formatEventDates(event.startDate, event.endDate)}
                              </time>
                              <span className="text-gcs-border">·</span>
                              <span>{event.timeLabel}</span>
                            </div>
                            <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-gcs-foreground">
                              {event.title}
                            </h3>
                            <p className="mt-2 flex items-start gap-2 text-sm text-gcs-muted-text">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gcs-primary" aria-hidden />
                              <span>{event.location}</span>
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-gcs-primary transition-colors group-hover:text-gcs-primary-hover">
                              Details
                              <ArrowUpRight className="h-4 w-4" />
                            </span>
                          </div>
                        </Link>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <aside className="mt-16 rounded-2xl border border-gcs-border bg-gcs-surface px-6 py-8 md:flex md:items-center md:justify-between md:gap-10 md:px-10 md:py-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">Secretariat</p>
              <p className="mt-3 text-base font-medium text-gcs-foreground md:text-lg">Hosting or sponsoring an event with GCS?</p>
              <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text">
                Reach out for partnership slots, technical programmes, and student outreach coordinated with the society
                calendar.
              </p>
            </div>
            <Link
              href="/contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gcs-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gcs-primary-hover md:mt-0 md:shrink-0"
            >
              Contact us
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
