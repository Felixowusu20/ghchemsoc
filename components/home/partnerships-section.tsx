"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Handshake, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HomepagePartnershipsPublic } from "@/lib/homepage-partnerships";

function CardShell({
  card,
  className,
}: {
  card: HomepagePartnershipsPublic["cards"][0];
  className?: string;
}) {
  const inner = (
    <>
      <Image
        src={card.imageUrl}
        alt={card.imageAlt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-70 transition-opacity group-hover:opacity-85" />
      <div className="absolute right-5 top-5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        {card.tag}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start gap-3 p-6 md:p-8">
        {card.accentPill ? (
          <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-md">
            {card.accentPill}
          </span>
        ) : null}
        <h3 className="max-w-[95%] text-xl font-medium leading-snug text-white md:text-2xl">{card.title}</h3>
        <span className="absolute bottom-6 right-6 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gcs-primary text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 md:bottom-8 md:right-8 md:h-12 md:w-12">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </>
  );

  const boxClass = `group relative h-[350px] overflow-hidden rounded-[1.5rem] shadow-sm ring-1 ring-gcs-border/30 transition-shadow hover:shadow-xl md:h-[500px] md:rounded-[2rem] ${className ?? ""}`;

  if (card.href) {
    const external = /^https?:\/\//i.test(card.href);
    if (external) {
      return (
        <a href={card.href} target="_blank" rel="noopener noreferrer" className={boxClass}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={card.href} className={boxClass}>
        {inner}
      </Link>
    );
  }

  return <article className={boxClass}>{inner}</article>;
}

export function PartnershipsSection({ data }: { data: HomepagePartnershipsPublic }) {
  const [query, setQuery] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.cards;
    return data.cards.filter(
      (c) => c.title.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q) || (c.accentPill?.toLowerCase().includes(q) ?? false)
    );
  }, [data.cards, query]);

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (!data.cards.length) return null;

  return (
    <section className="w-full bg-[#F8F9FB] px-6 py-24 text-gcs-foreground md:px-12" data-aos="fade-up">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex w-full flex-col items-center justify-between gap-6 lg:mb-12 lg:flex-row">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-1.5 text-sm font-medium text-gcs-muted-text shadow-sm">
              <Handshake className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
              {data.eyebrow}
            </div>
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">{data.title}</h2>
          </div>

          <div className="flex w-full flex-col items-center gap-4 sm:flex-row lg:w-auto">
            {data.showSearch ? (
              <div className="relative w-full sm:w-80">
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={data.searchPlaceholder}
                  className="h-12 w-full rounded-full border-gcs-border bg-white pl-5 pr-10 shadow-sm focus:bg-white"
                />
                <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gcs-muted-text" aria-hidden />
              </div>
            ) : null}
            <Button
              asChild
              className="h-12 w-full shrink-0 gap-3 rounded-full bg-gcs-primary pl-6 pr-2 text-sm text-white hover:bg-gcs-primary-hover sm:w-auto"
            >
              <Link href={data.ctaHref}>
                {data.ctaLabel}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {filtered.length ? (
          <div
            ref={scrollerRef}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:flex lg:snap-x lg:snap-mandatory lg:gap-6 lg:overflow-x-auto lg:pb-2"
          >
            {filtered.map((card) => (
              <CardShell key={card.id} card={card} className="lg:min-w-[min(100%,320px)] lg:flex-1 lg:snap-start" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gcs-border bg-white px-6 py-10 text-center text-sm text-gcs-muted-text">
            No partners match your search.
          </p>
        )}

        <div className="mt-12 flex items-center justify-between text-sm text-gcs-muted-text">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gcs-border hover:bg-gcs-primary hover:text-white"
              onClick={() => scrollBy(-360)}
              aria-label="Scroll partners left"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gcs-border hover:bg-gcs-primary hover:text-white"
              onClick={() => scrollBy(360)}
              aria-label="Scroll partners right"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          {data.footerNote ? (
            <p className="hidden max-w-sm text-right leading-relaxed md:block">{data.footerNote}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
