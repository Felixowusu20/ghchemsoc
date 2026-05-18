"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { Media, SocietyEvent } from "@prisma/client";
import type { HomepageEventsPublic } from "@/lib/homepage-events";
import { HomepageEventsSpotlight } from "@/components/home/homepage-events-spotlight";

type EventRow = SocietyEvent & { media: Media | null };

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function fmtDesk(d: Date) {
  return d
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/ /g, " ");
}

function EventSideCard({ event, index }: { event: EventRow; index: number }) {
  const category = event.badge?.trim() || "Event";

  return (
    <motion.article
      custom={index + 1}
      variants={fade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="group overflow-hidden rounded-[1.5rem] border border-gcs-border/50 bg-white ring-1 ring-gcs-border/20 transition-colors hover:border-gcs-border hover:bg-neutral-50/80 lg:rounded-2xl"
    >
      <Link href={`/events/${event.id}`} className="flex gap-4 p-3.5 md:gap-5 md:p-4">
        <div className="relative h-[88px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-white md:h-[96px] md:w-[112px] md:rounded-2xl">
          <Image
            src={event.media!.url}
            alt={event.media!.alt ?? event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="112px"
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
            <span className="text-gcs-primary">{category}</span>
            <span className="text-gcs-border">·</span>
            <time dateTime={event.startDate.toISOString()}>{fmtDesk(event.startDate)}</time>
          </div>
          <h3 className="mt-2 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-gcs-foreground md:text-base">
            {event.title}
          </h3>
        </div>
        <div className="hidden shrink-0 self-center sm:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gcs-border bg-white text-gcs-primary shadow-sm transition-all group-hover:border-gcs-primary group-hover:bg-gcs-primary group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function HomeEventsRow({
  events,
  settings,
}: {
  events: EventRow[];
  settings: HomepageEventsPublic;
}) {
  const side = events.filter((e) => e.media?.url).slice(0, 3);
  const showSpotlight = settings.spotlightEnabled;
  if (!showSpotlight && !side.length) return null;

  return (
    <section
      className="w-full border-y border-gcs-border/60 bg-gcs-surface px-4 py-20 sm:px-6 md:px-12 md:py-24"
      data-aos="fade-up"
      data-aos-delay="50"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col items-start gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-1.5 text-sm font-medium text-gcs-muted-text shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
              {settings.sectionEyebrow}
            </div>
            <h2 className="max-w-xl text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
              {settings.sectionTitle}
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
          >
            Full calendar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {showSpotlight ? (
            <motion.div
              custom={0}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="lg:col-span-7"
            >
              <HomepageEventsSpotlight settings={settings} className="w-full lg:rounded-[2rem]" />
            </motion.div>
          ) : null}
          {side.length ? (
            <div className={`flex flex-col gap-4 lg:gap-5 ${showSpotlight ? "lg:col-span-5" : "lg:col-span-12"}`}>
              {side.map((e, i) => (
                <EventSideCard key={e.id} event={e} index={i} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
