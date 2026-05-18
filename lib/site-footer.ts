import type { Media, SiteFooterSettings } from "@prisma/client";
import {
  SITE_FOOTER_DEFAULTS,
  SITE_FOOTER_ID,
  type FooterNavLink,
  type FooterSocialLink,
} from "@/lib/site-footer-defaults";

export type SiteFooterRow = SiteFooterSettings & {
  leftImageMedia: Media | null;
  rightImageMedia: Media | null;
};

export type SiteFooterPublic = {
  headlineLine1: string;
  headlineLine2: string;
  helplineText: string;
  description: string;
  copyrightText: string;
  trademarkLabel: string;
  trademarkHref: string;
  trademarkNotice: string | null;
  navLinks: FooterNavLink[];
  socialLinks: FooterSocialLink[];
  leftImageUrl: string;
  leftImageAlt: string;
  rightImageUrl: string;
  rightImageAlt: string;
};

const SOCIAL_PLATFORMS = new Set<FooterSocialLink["platform"]>([
  "linkedin",
  "instagram",
  "twitter",
  "facebook",
  "youtube",
  "globe",
]);

function parseNavLinks(raw: unknown): FooterNavLink[] {
  if (!Array.isArray(raw)) return [...SITE_FOOTER_DEFAULTS.navLinks];
  const out: FooterNavLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label.trim() : "";
    const href = typeof o.href === "string" ? o.href.trim() : "";
    if (label && href) out.push({ label, href });
  }
  return out.length ? out : [...SITE_FOOTER_DEFAULTS.navLinks];
}

function parseSocialLinks(raw: unknown): FooterSocialLink[] {
  if (!Array.isArray(raw)) return [...SITE_FOOTER_DEFAULTS.socialLinks];
  const out: FooterSocialLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const platform = o.platform;
    const href = typeof o.href === "string" ? o.href.trim() : "";
    if (typeof platform !== "string" || !SOCIAL_PLATFORMS.has(platform as FooterSocialLink["platform"]) || !href) {
      continue;
    }
    out.push({
      platform: platform as FooterSocialLink["platform"],
      href,
      label: typeof o.label === "string" ? o.label.trim() : undefined,
    });
  }
  return out.length ? out : [...SITE_FOOTER_DEFAULTS.socialLinks];
}

export function siteFooterDefaults(): SiteFooterPublic {
  const d = SITE_FOOTER_DEFAULTS;
  return {
    headlineLine1: d.headlineLine1,
    headlineLine2: d.headlineLine2,
    helplineText: d.helplineText,
    description: d.description,
    copyrightText: d.copyrightText,
    trademarkLabel: d.trademarkLabel,
    trademarkHref: d.trademarkHref,
    trademarkNotice: d.trademarkNotice,
    navLinks: [...d.navLinks],
    socialLinks: [...d.socialLinks],
    leftImageUrl: d.leftImageUrl,
    leftImageAlt: d.leftImageAlt,
    rightImageUrl: d.rightImageUrl,
    rightImageAlt: d.rightImageAlt,
  };
}

export function mapSiteFooterRow(row: SiteFooterRow): SiteFooterPublic {
  const d = SITE_FOOTER_DEFAULTS;
  return {
    headlineLine1: row.headlineLine1,
    headlineLine2: row.headlineLine2,
    helplineText: row.helplineText,
    description: row.description,
    copyrightText: row.copyrightText,
    trademarkLabel: row.trademarkLabel ?? d.trademarkLabel,
    trademarkHref: row.trademarkHref ?? d.trademarkHref,
    trademarkNotice: row.trademarkNotice?.trim() || null,
    navLinks: parseNavLinks(row.navLinks),
    socialLinks: parseSocialLinks(row.socialLinks),
    leftImageUrl: row.leftImageMedia?.url ?? d.leftImageUrl,
    leftImageAlt: row.leftImageMedia?.alt ?? d.leftImageAlt,
    rightImageUrl: row.rightImageMedia?.url ?? d.rightImageUrl,
    rightImageAlt: row.rightImageMedia?.alt ?? d.rightImageAlt,
  };
}

export { SITE_FOOTER_ID } from "@/lib/site-footer-defaults";

export function siteFooterCreateData() {
  const d = SITE_FOOTER_DEFAULTS;
  return {
    id: SITE_FOOTER_ID,
    headlineLine1: d.headlineLine1,
    headlineLine2: d.headlineLine2,
    helplineText: d.helplineText,
    description: d.description,
    copyrightText: d.copyrightText,
    trademarkLabel: d.trademarkLabel,
    trademarkHref: d.trademarkHref,
    trademarkNotice: d.trademarkNotice,
    navLinks: d.navLinks,
    socialLinks: d.socialLinks,
    leftImageMedia: {
      create: {
        url: d.leftImageUrl,
        alt: d.leftImageAlt,
      },
    },
    rightImageMedia: {
      create: {
        url: d.rightImageUrl,
        alt: d.rightImageAlt,
      },
    },
  };
}

export function serializeSiteFooterCms(row: SiteFooterRow) {
  const d = SITE_FOOTER_DEFAULTS;
  return {
    id: row.id,
    headlineLine1: row.headlineLine1 ?? d.headlineLine1,
    headlineLine2: row.headlineLine2 ?? d.headlineLine2,
    helplineText: row.helplineText ?? d.helplineText,
    description: row.description ?? d.description,
    copyrightText: row.copyrightText ?? d.copyrightText,
    trademarkLabel: row.trademarkLabel ?? d.trademarkLabel,
    trademarkHref: row.trademarkHref ?? d.trademarkHref,
    trademarkNotice: row.trademarkNotice?.trim() ?? "",
    navLinks: parseNavLinks(row.navLinks),
    socialLinks: parseSocialLinks(row.socialLinks),
    leftImageUrl: row.leftImageMedia?.url ?? "",
    leftImagePublicId: row.leftImageMedia?.publicId ?? null,
    leftImageAlt: row.leftImageMedia?.alt ?? "",
    rightImageUrl: row.rightImageMedia?.url ?? "",
    rightImagePublicId: row.rightImageMedia?.publicId ?? null,
    rightImageAlt: row.rightImageMedia?.alt ?? "",
  };
}
