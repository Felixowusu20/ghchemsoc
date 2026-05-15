import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHomepageExploreForPublic } from "@/lib/cms-queries";

export async function ExploreSection() {
  const s = await getHomepageExploreForPublic();

  return (
    <section
      className="w-full overflow-hidden bg-gcs-surface px-6 py-20 text-gcs-foreground md:px-12 md:py-24"
      data-aos="fade-up"
    >
      <div className="mb-14 flex flex-col items-center text-center md:mb-16" data-aos="fade-up" data-aos-delay="80">
        <div className="mb-6 inline-flex cursor-default items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/50 px-4 py-1.5 text-sm font-medium text-gcs-muted-text transition-colors">
          {s.missionEyebrow} <ArrowRight className="h-3.5 w-3.5 text-gcs-primary" />
        </div>
        <h2 className="mx-auto max-w-4xl text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl lg:text-[2.75rem] lg:leading-[1.08]">
          {s.headlineLine1} <br className="hidden md:block" />
          {s.headlineLine2}
        </h2>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col justify-start pt-1 lg:col-span-3" data-aos="fade-up" data-aos-delay="100">
          <div className="mb-6 inline-block self-start rounded-full border border-gcs-border bg-gcs-muted-bg/40 px-4 py-1.5 text-sm font-medium text-gcs-muted-text">
            {s.aboutEyebrow}
          </div>
          <p className="mb-8 text-xl font-medium leading-relaxed text-gcs-foreground md:text-2xl">{s.aboutBody}</p>
          <Button
            asChild
            className="group mt-auto h-12 w-fit gap-3 rounded-full border-0 bg-gcs-primary px-6 text-base text-white shadow-sm hover:bg-gcs-primary-hover"
          >
            <Link href="/about">
              Learn more
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors group-hover:bg-white/90">
                <ArrowUpRight className="h-4 w-4 text-gcs-primary" />
              </span>
            </Link>
          </Button>
        </div>

        <div className="group relative h-[420px] overflow-hidden rounded-[2.5rem] sm:h-[480px] lg:col-span-5 lg:h-[500px]" data-aos="fade-up" data-aos-delay="120">
          <Image
            src={s.mainImageUrl}
            alt={s.mainImageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

          <div className="absolute left-6 top-6 rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            {s.imageBadge}
          </div>

          <p className="absolute right-8 top-8 max-w-[220px] text-right text-lg font-medium leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {s.imageHoverQuote}
          </p>

          <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gcs-foreground shadow-sm">
            <MapPin className="h-4 w-4 shrink-0 text-gcs-primary" />
            {s.locationLabel}
          </div>

          <Link
            href="/about"
            className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gcs-foreground shadow-md transition-colors hover:bg-gcs-muted-bg"
            aria-label="About the society"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4" data-aos="fade-up" data-aos-delay="160">
          <div className="group relative h-[260px] w-full overflow-hidden rounded-[2.5rem] sm:h-[300px]">
            <Image
              src={s.secondaryImageUrl}
              alt={s.secondaryImageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
            <div className="absolute left-6 top-6 rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              {s.secondaryBadge}
            </div>
            <Link
              href="/events"
              className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gcs-foreground shadow-md transition-colors hover:bg-gcs-muted-bg"
              aria-label="Conferences and events"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-5">
            <p className="max-w-md text-sm leading-relaxed text-gcs-muted-text md:text-base">{s.bottomBlurb}</p>
            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t border-gcs-border/80 pt-5">
              <Link
                href="/publications"
                className="text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
              >
                Publications
                <ArrowRight className="ml-1 inline h-4 w-4 align-middle" />
              </Link>
              <Link
                href="/events"
                className="text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
              >
                Events &amp; symposia
                <ArrowRight className="ml-1 inline h-4 w-4 align-middle" />
              </Link>
              <Link
                href="/membership"
                className="text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
              >
                Membership
                <ArrowRight className="ml-1 inline h-4 w-4 align-middle" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
