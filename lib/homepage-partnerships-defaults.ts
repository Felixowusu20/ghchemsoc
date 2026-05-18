export const HOMEPAGE_PARTNERSHIPS_DEFAULTS = {
  eyebrow: "Partnerships",
  title: "Our partners",
  searchPlaceholder: "Search partners…",
  showSearch: true,
  ctaLabel: "View all",
  ctaHref: "/contact",
  footerNote:
    "Industry, academia, and government collaborators helping advance chemistry education, research, and outreach across Ghana.",
} as const;

export const PARTNERSHIP_CARD_SEEDS = [
  {
    sortOrder: 0,
    tag: "Industry",
    title: "Industrial R&D and quality labs",
    accentPill: null as string | null,
    href: "/contact",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1723708841860-5b00cc402a62?w=800&auto=format&fit=crop&q=60",
    imageAlt: "Laboratory and industrial partnership",
  },
  {
    sortOrder: 1,
    tag: "Universities",
    title: "Campus chapters and research networks",
    accentPill: null,
    href: "/membership",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop",
    imageAlt: "University collaboration",
  },
  {
    sortOrder: 2,
    tag: "Government",
    title: "Policy, standards, and national programmes",
    accentPill: "National voice",
    href: "/about",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop",
    imageAlt: "Science policy partnership",
  },
  {
    sortOrder: 3,
    tag: "Sponsors",
    title: "Conference and outreach supporters",
    accentPill: null,
    href: "/events",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop",
    imageAlt: "Sponsor partnership",
  },
] as const;
