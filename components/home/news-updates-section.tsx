"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import type { HomeDeskCard, HomeNewsUpdatesData } from "@/lib/home-news-updates";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function CardLink({
  card,
  className,
  children,
}: {
  card: HomeDeskCard;
  className?: string;
  children: React.ReactNode;
}) {
  if (card.external) {
    return (
      <a href={card.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={card.href} className={className}>
      {children}
    </Link>
  );
}

function FeaturedCard({ card }: { card: HomeDeskCard }) {
  return (
    <motion.article
      custom={0}
      variants={fade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="overflow-hidden rounded-[1.75rem] ring-1 ring-gcs-border/55 lg:col-span-7 lg:rounded-[2rem]"
    >
      <CardLink card={card} className="group flex h-full flex-col lg:min-h-[320px] lg:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[44%] lg:min-h-[280px]">
          <Image
            src={card.imageUrl}
            alt={card.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 38vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-gcs-surface/30" />
        </div>
        <div className="flex flex-1 flex-col justify-center bg-white px-6 py-7 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gcs-muted-text">
            <span className="text-gcs-primary">{card.category}</span>
            <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
            <time dateTime={card.dateIso}>{card.dateLabel}</time>
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-gcs-foreground md:text-2xl">{card.title}</h3>
          {card.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">{card.excerpt}</p>
          ) : null}
          <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gcs-foreground transition-colors group-hover:text-gcs-primary">
            {card.kind === "publication" ? "View publication" : "Read article"}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </CardLink>
    </motion.article>
  );
}

function SideCard({ card, index }: { card: HomeDeskCard; index: number }) {
  return (
    <motion.article
      custom={index + 1}
      variants={fade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="group overflow-hidden rounded-[1.5rem] border border-gcs-border/50 bg-white ring-1 ring-gcs-border/20 transition-colors hover:border-gcs-border hover:bg-neutral-50/80 lg:rounded-2xl"
    >
      <CardLink card={card} className="flex gap-4 p-3.5 md:gap-5 md:p-4">
        <div className="relative h-[88px] w-[100px] shrink-0 overflow-hidden rounded-xl md:h-[96px] md:w-[112px] md:rounded-2xl">
          <Image
            src={card.imageUrl}
            alt={card.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="112px"
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
            <span className="text-gcs-primary">{card.category}</span>
            <span className="text-gcs-border">·</span>
            <time dateTime={card.dateIso}>{card.dateLabel}</time>
          </div>
          <h3 className="mt-2 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-gcs-foreground md:text-base">{card.title}</h3>
        </div>
        <div className="hidden shrink-0 self-center sm:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gcs-border bg-white text-gcs-primary shadow-sm transition-all group-hover:border-gcs-primary group-hover:bg-gcs-primary group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </CardLink>
    </motion.article>
  );
}

export function NewsUpdatesSection({ data }: { data: HomeNewsUpdatesData }) {
  const { featured, side } = data;
  if (!featured && side.length === 0) return null;

  return (
    <section className="w-full border-t border-gcs-border/60 bg-gcs-surface px-4 py-20 sm:px-6 md:px-12 md:py-24" data-aos="fade-up" data-aos-delay="40">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col items-start gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-1.5 text-sm font-medium text-gcs-muted-text shadow-sm">
              <Newspaper className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
              News &amp; updates
            </div>
            <h2 className="max-w-xl text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
              From the society desk
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-gcs-muted-text md:text-lg">
              Conferences, calls, outreach, and member resources—curated for the GCS community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
            >
              All news
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/publications"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gcs-muted-text transition-colors hover:text-gcs-primary"
            >
              Publications
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {featured ? <FeaturedCard card={featured} /> : null}
          {side.length ? (
            <div className={`flex flex-col gap-4 lg:gap-5 ${featured ? "lg:col-span-5" : "lg:col-span-12"}`}>
              {side.map((post, i) => (
                <SideCard key={post.id} card={post} index={i} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
