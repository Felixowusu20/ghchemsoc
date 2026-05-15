import type { PublicHeroSlide } from "@/lib/fetch-public-hero";
import type { HeroCarouselSlide } from "@/lib/hero-carousel-data";

function inferVariant(imageUrl: string): "logo" | "photo" {
  if (imageUrl.startsWith("/")) return "logo";
  try {
    const path = new URL(imageUrl).pathname;
    if (path.includes("/logo/") || path.includes("ghana-chemical-society-logo")) return "logo";
  } catch {
    /* relative or invalid */
  }
  return "photo";
}

export function mapPublicHeroToCarousel(slides: PublicHeroSlide[]): HeroCarouselSlide[] {
  return slides.map((s) => {
    const [a, b] = s.headline;
    const title = [a, b].filter(Boolean).join(" ").trim() || s.eyebrow;
    return {
      id: s.id,
      title,
      description: s.description,
      variant: inferVariant(s.imageUrl),
      imageSrc: s.imageUrl,
      imageAlt: s.imageAlt,
    };
  });
}
