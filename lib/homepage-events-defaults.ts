/** Fallbacks when no CMS row exists yet. */
export const HOMEPAGE_EVENTS_DEFAULTS = {
  spotlightEnabled: true,
  sectionEyebrow: "Upcoming",
  sectionTitle: "Conferences & events",
  spotlightEyebrow: "Spotlight",
  headline: "Where Ghana's chemistry community meets",
  body: "Flagship symposia, technical workshops, and networking for educators, researchers, students, and partners—curated by the Ghana Chemical Society.",
  metaLine: "Accra & partner venues · Member rates available",
  imagePosition: "left" as const,
  ctaLabel: "Learn more",
  ctaHref: "/events",
  imageBadge: "Conferences",
  fallbackImageUrl:
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=80",
  fallbackImageAlt: "Conference and laboratory gathering",
} as const;
