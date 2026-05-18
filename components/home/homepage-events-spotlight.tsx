import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { HomepageEventsPublic } from "@/lib/homepage-events";
import { hasHomepageEventsImage, resolveHomepageEventsImageUrl } from "@/lib/homepage-events-image";

/** Featured card — image and copy side by side (matches news desk layout). */
export function HomepageEventsSpotlight({
  settings,
  className,
  preview,
}: {
  settings: HomepageEventsPublic;
  className?: string;
  preview?: boolean;
}) {
  if (!settings.spotlightEnabled) return null;

  const hasImage = hasHomepageEventsImage(settings.imageUrl);
  const src = resolveHomepageEventsImageUrl(settings.imageUrl);
  const imageFirst = settings.imagePosition !== "right";

  const imagePanel = (
    <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[44%] lg:min-h-[280px]">
      {hasImage ? (
        <Image
          src={src}
          alt={settings.imageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 38vw"
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-50 via-white to-sky-100/80 px-6 text-center"
          aria-hidden
        >
          <CalendarDays className="h-10 w-10 text-gcs-primary/70" strokeWidth={1.5} />
          {preview ? (
            <p className="max-w-[12rem] text-xs font-medium text-gcs-muted-text">Upload a spotlight image</p>
          ) : null}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-gcs-surface/30" />
      {settings.imageBadge ? (
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gcs-primary shadow-sm backdrop-blur">
          {settings.imageBadge}
        </span>
      ) : null}
    </div>
  );

  const textPanel = (
    <div className="flex flex-1 flex-col justify-center bg-white px-6 py-7 md:px-8 md:py-8">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gcs-muted-text">
        <span className="text-gcs-primary">{settings.spotlightEyebrow}</span>
        {settings.metaLine ? (
          <>
            <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
            <span>{settings.metaLine}</span>
          </>
        ) : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-gcs-foreground md:text-2xl">
        {settings.headline}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">{settings.body}</p>
      <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gcs-foreground transition-colors group-hover:text-gcs-primary">
        {settings.ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  );

  return (
    <article
      className={
        className ??
        "overflow-hidden rounded-[1.75rem] ring-1 ring-gcs-border/55 lg:rounded-[2rem]"
      }
    >
      <Link href={settings.ctaHref} className="group flex h-full flex-col lg:min-h-[320px] lg:flex-row">
        {imageFirst ? (
          <>
            {imagePanel}
            {textPanel}
          </>
        ) : (
          <>
            {textPanel}
            {imagePanel}
          </>
        )}
      </Link>
    </article>
  );
}
