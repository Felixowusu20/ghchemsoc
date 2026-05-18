import {
  SITE_FOOTER_DEFAULTS,
  type FooterNavLink,
  type FooterSocialLink,
} from "@/lib/site-footer-defaults";

const SOCIAL_PLATFORMS = new Set<FooterSocialLink["platform"]>([
  "linkedin",
  "instagram",
  "twitter",
  "facebook",
  "youtube",
  "globe",
]);

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Ensures every input `value` is a defined string (never undefined). */
export function normalizeSiteFooterCmsForm(raw: Partial<SiteFooterCmsForm>): SiteFooterCmsForm {
  const d = SITE_FOOTER_DEFAULTS;

  const navLinks: FooterNavLink[] = Array.isArray(raw.navLinks)
    ? raw.navLinks.map((link) => ({
        label: str(link?.label),
        href: str(link?.href),
      }))
    : [...d.navLinks];

  const socialLinks: FooterSocialLink[] = Array.isArray(raw.socialLinks)
    ? raw.socialLinks.map((link) => {
        const platform = link?.platform;
        return {
          platform:
            typeof platform === "string" && SOCIAL_PLATFORMS.has(platform as FooterSocialLink["platform"])
              ? (platform as FooterSocialLink["platform"])
              : "linkedin",
          href: str(link?.href),
        };
      })
    : [...d.socialLinks];

  return {
    id: typeof raw.id === "string" ? raw.id : undefined,
    headlineLine1: str(raw.headlineLine1) || d.headlineLine1,
    headlineLine2: str(raw.headlineLine2) || d.headlineLine2,
    helplineText: str(raw.helplineText) || d.helplineText,
    description: str(raw.description) || d.description,
    copyrightText: str(raw.copyrightText) || d.copyrightText,
    trademarkLabel: str(raw.trademarkLabel) || d.trademarkLabel,
    trademarkHref: str(raw.trademarkHref) || d.trademarkHref,
    trademarkNotice: str(raw.trademarkNotice ?? ""),
    navLinks,
    socialLinks,
    leftImageUrl: str(raw.leftImageUrl),
    leftImagePublicId: raw.leftImagePublicId ?? null,
    leftImageAlt: str(raw.leftImageAlt),
    rightImageUrl: str(raw.rightImageUrl),
    rightImagePublicId: raw.rightImagePublicId ?? null,
    rightImageAlt: str(raw.rightImageAlt),
  };
}

export type SiteFooterCmsForm = {
  id?: string;
  headlineLine1: string;
  headlineLine2: string;
  helplineText: string;
  description: string;
  copyrightText: string;
  trademarkLabel: string;
  trademarkHref: string;
  trademarkNotice: string;
  navLinks: FooterNavLink[];
  socialLinks: FooterSocialLink[];
  leftImageUrl: string;
  leftImagePublicId: string | null;
  leftImageAlt: string;
  rightImageUrl: string;
  rightImagePublicId: string | null;
  rightImageAlt: string;
};

function isHttpUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Normalize CMS form values before PATCH validation. */
export function prepareSiteFooterSavePayload(form: SiteFooterCmsForm) {
  const navLinks = form.navLinks
    .map((l) => ({ label: l.label.trim(), href: l.href.trim() }))
    .filter((l) => l.label && l.href);

  const socialLinks = form.socialLinks
    .map((s) => ({
      platform: s.platform,
      href: s.href.trim(),
      ...(s.label?.trim() ? { label: s.label.trim() } : {}),
    }))
    .filter((s) => isHttpUrl(s.href));

  const notice = form.trademarkNotice.trim();

  return {
    headlineLine1: form.headlineLine1.trim(),
    headlineLine2: form.headlineLine2.trim(),
    helplineText: form.helplineText.trim(),
    description: form.description.trim(),
    copyrightText: form.copyrightText.trim(),
    trademarkLabel: form.trademarkLabel.trim(),
    trademarkHref: form.trademarkHref.trim(),
    trademarkNotice: notice ? notice : null,
    navLinks,
    socialLinks,
    leftImageUrl: form.leftImageUrl.trim(),
    leftImagePublicId: form.leftImagePublicId,
    leftImageAlt: form.leftImageAlt.trim(),
    rightImageUrl: form.rightImageUrl.trim(),
    rightImagePublicId: form.rightImagePublicId,
    rightImageAlt: form.rightImageAlt.trim(),
  };
}

export function validateSiteFooterFormBeforeSave(
  payload: ReturnType<typeof prepareSiteFooterSavePayload>
): string | null {
  if (!payload.leftImageUrl || !payload.rightImageUrl) {
    return "Upload both footer accent images.";
  }
  if (payload.navLinks.length < 1) {
    return "Add at least one navigation link with a label and path.";
  }
  for (const link of payload.navLinks) {
    if (!link.label || !link.href) {
      return "Each navigation link needs a label and path.";
    }
  }
  for (const s of payload.socialLinks) {
    if (!isHttpUrl(s.href)) {
      return "Each social link needs a full URL starting with https://";
    }
  }
  return null;
}
