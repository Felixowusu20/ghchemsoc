import type { HomepagePartnershipsSettings, Media, PartnershipCard } from "@prisma/client";
import {
  HOMEPAGE_PARTNERSHIPS_DEFAULTS,
  PARTNERSHIP_CARD_SEEDS,
} from "@/lib/homepage-partnerships-defaults";

export const HOMEPAGE_PARTNERSHIPS_ID = "homepage_partnerships" as const;

export type PartnershipCardPublic = {
  id: string;
  tag: string;
  title: string;
  accentPill: string | null;
  href: string | null;
  imageUrl: string;
  imageAlt: string;
};

export type HomepagePartnershipsPublic = {
  eyebrow: string;
  title: string;
  searchPlaceholder: string;
  showSearch: boolean;
  ctaLabel: string;
  ctaHref: string;
  footerNote: string | null;
  cards: PartnershipCardPublic[];
};

export function homepagePartnershipsSettingsCreateData() {
  const d = HOMEPAGE_PARTNERSHIPS_DEFAULTS;
  return {
    id: HOMEPAGE_PARTNERSHIPS_ID,
    eyebrow: d.eyebrow,
    title: d.title,
    searchPlaceholder: d.searchPlaceholder,
    showSearch: d.showSearch,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    footerNote: d.footerNote,
  };
}

export function mapPartnershipCard(row: PartnershipCard & { media: Media | null }): PartnershipCardPublic | null {
  if (!row.media?.url) return null;
  return {
    id: row.id,
    tag: row.tag,
    title: row.title,
    accentPill: row.accentPill,
    href: row.href,
    imageUrl: row.media.url,
    imageAlt: row.media.alt ?? row.title,
  };
}

export function homepagePartnershipsDefaults(): HomepagePartnershipsPublic {
  const d = HOMEPAGE_PARTNERSHIPS_DEFAULTS;
  return {
    eyebrow: d.eyebrow,
    title: d.title,
    searchPlaceholder: d.searchPlaceholder,
    showSearch: d.showSearch,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    footerNote: d.footerNote,
    cards: PARTNERSHIP_CARD_SEEDS.map((c, i) => ({
      id: `seed-${i}`,
      tag: c.tag,
      title: c.title,
      accentPill: c.accentPill,
      href: c.href,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
    })),
  };
}

export function buildHomepagePartnershipsPublic(
  settings: HomepagePartnershipsSettings,
  cards: (PartnershipCard & { media: Media | null })[]
): HomepagePartnershipsPublic {
  const d = HOMEPAGE_PARTNERSHIPS_DEFAULTS;
  return {
    eyebrow: settings.eyebrow,
    title: settings.title,
    searchPlaceholder: settings.searchPlaceholder,
    showSearch: settings.showSearch,
    ctaLabel: settings.ctaLabel,
    ctaHref: settings.ctaHref,
    footerNote: settings.footerNote,
    cards: cards.map(mapPartnershipCard).filter((c): c is PartnershipCardPublic => c !== null),
  };
}
