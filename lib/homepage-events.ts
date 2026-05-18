import type { HomepageEventsSettings, Media } from "@prisma/client";
import { HOMEPAGE_EVENTS_DEFAULTS } from "@/lib/homepage-events-defaults";
import { resolveHomepageEventsImageUrl } from "@/lib/homepage-events-image";

export const HOMEPAGE_EVENTS_ID = "homepage_events" as const;

export type HomepageEventsImagePosition = "left" | "right";

export type HomepageEventsPublic = {
  spotlightEnabled: boolean;
  sectionEyebrow: string;
  sectionTitle: string;
  spotlightEyebrow: string;
  headline: string;
  body: string;
  metaLine: string | null;
  imagePosition: HomepageEventsImagePosition;
  ctaLabel: string;
  ctaHref: string;
  imageBadge: string | null;
  imageUrl: string;
  imageAlt: string;
};

export type HomepageEventsRow = HomepageEventsSettings & {
  imageMedia: Media | null;
};

export function homepageEventsCreateData() {
  const d = HOMEPAGE_EVENTS_DEFAULTS;
  return {
    id: HOMEPAGE_EVENTS_ID,
    spotlightEnabled: d.spotlightEnabled,
    sectionEyebrow: d.sectionEyebrow,
    sectionTitle: d.sectionTitle,
    spotlightEyebrow: d.spotlightEyebrow,
    headline: d.headline,
    body: d.body,
    metaLine: d.metaLine,
    imagePosition: d.imagePosition,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    imageBadge: d.imageBadge,
  };
}

export function normalizeImagePosition(value: string): HomepageEventsImagePosition {
  return value === "right" ? "right" : "left";
}

export function mapHomepageEventsRow(row: HomepageEventsRow): HomepageEventsPublic {
  const d = HOMEPAGE_EVENTS_DEFAULTS;
  return {
    spotlightEnabled: row.spotlightEnabled,
    sectionEyebrow: row.sectionEyebrow,
    sectionTitle: row.sectionTitle,
    spotlightEyebrow: row.spotlightEyebrow,
    headline: row.headline,
    body: row.body,
    metaLine: row.metaLine,
    imagePosition: normalizeImagePosition(row.imagePosition),
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    imageBadge: row.imageBadge,
    imageUrl: resolveHomepageEventsImageUrl(row.imageMedia?.url),
    imageAlt: row.imageMedia?.alt?.trim() || d.fallbackImageAlt,
  };
}

export function homepageEventsDefaults(): HomepageEventsPublic {
  const d = HOMEPAGE_EVENTS_DEFAULTS;
  return {
    spotlightEnabled: d.spotlightEnabled,
    sectionEyebrow: d.sectionEyebrow,
    sectionTitle: d.sectionTitle,
    spotlightEyebrow: d.spotlightEyebrow,
    headline: d.headline,
    body: d.body,
    metaLine: d.metaLine,
    imagePosition: d.imagePosition,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    imageBadge: d.imageBadge,
    imageUrl: d.fallbackImageUrl,
    imageAlt: d.fallbackImageAlt,
  };
}
