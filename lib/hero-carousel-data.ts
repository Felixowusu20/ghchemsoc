/** Fallback hero slides when CMS returns no published slides (`GET /api/public/hero` → `[]`). */
export type HeroCarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  variant: "logo" | "photo";
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export const FALLBACK_HERO_SLIDES: HeroCarouselSlide[] = [
  {
    id: "welcome",
    eyebrow: "Ghana Chemical Society",
    title: "Welcome to the Ghana Chemical Society",
    description:
      "Your hub for chemistry education, professional growth, and national scientific dialogue.",
    variant: "logo",
    imageSrc: "/logo/ghana-chemical-society-logo.png",
    imageAlt: "Ghana Chemical Society official logo",
    ctaLabel: "Become a member",
    ctaHref: "/membership",
  },
  {
    id: "conference",
    eyebrow: "Ghana Chemical Society",
    title: "Upcoming Annual Chemistry Conference",
    description:
      "Connect with researchers, educators, and industry partners shaping the future of chemistry in Ghana.",
    variant: "photo",
    imageSrc:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Conference hall with audience and stage lighting",
    ctaLabel: "Become a member",
    ctaHref: "/membership",
  },
  {
    id: "advancing",
    eyebrow: "Ghana Chemical Society",
    title: "Advancing chemical sciences in Ghana",
    description:
      "Supporting discovery, safety, and innovation from the classroom to the laboratory and beyond.",
    variant: "photo",
    imageSrc:
      "https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Scientific glassware and chemistry laboratory setup",
  },
  {
    id: "community",
    title: "Join our community of researchers",
    description:
      "Collaborate across universities, industry, and public institutions to strengthen chemistry for society.",
    variant: "photo",
    imageSrc:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Researchers working with laboratory equipment",
    ctaLabel: "Become a member",
    ctaHref: "/membership",
  },
];
