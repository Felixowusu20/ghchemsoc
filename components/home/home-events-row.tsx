import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { Media, SocietyEvent } from "@prisma/client";

type EventRow = SocietyEvent & { media: Media | null };

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function HomeEventsRow({ events }: { events: EventRow[] }) {
  const list = events.filter((e) => e.media?.url).slice(0, 3);
  if (!list.length) return null;

  return (
    <section
      className="border-y border-gcs-border/50 bg-white px-6 py-16 md:px-12 md:py-20"
      data-aos="fade-up"
      data-aos-delay="50"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-6 border-b border-gcs-border/60 pb-8 md:flex-row md:items-end md:pb-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/50 px-4 py-1.5 text-sm font-medium text-gcs-muted-text">
              <Calendar className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
              Upcoming
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">Conferences &amp; events</h2>
            <p className="mt-2 max-w-xl text-sm text-gcs-muted-text md:text-base">
              Dates and venues from your CMS. Manage everything under <span className="font-mono text-xs">/cms/events</span>.
            </p>
          </div>
          <Link
            href="/events"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
          >
            Full calendar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <li key={e.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gcs-border/50 bg-gcs-surface shadow-sm ring-1 ring-gcs-border/10 transition-shadow hover:shadow-md">
                <Link href={e.href || "/events"} className="flex flex-1 flex-col">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-gcs-border/40">
                    <Image
                      src={e.media!.url}
                      alt={e.media!.alt ?? e.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    {e.badge ? (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gcs-primary shadow-sm backdrop-blur">
                        {e.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <time className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text" dateTime={e.startDate.toISOString()}>
                      {fmt(e.startDate)}
                    </time>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-gcs-foreground">{e.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gcs-muted-text">{e.excerpt}</p>
                    <p className="mt-3 flex items-start gap-2 text-sm text-gcs-muted-text">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gcs-primary" aria-hidden />
                      <span>{e.location}</span>
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-gcs-primary group-hover:text-gcs-primary-hover">
                      Details
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
