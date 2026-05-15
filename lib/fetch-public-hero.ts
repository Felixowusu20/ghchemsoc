import { headers } from "next/headers";

/** Shape returned by `GET /api/public/hero`. */
export type PublicHeroSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  headline: readonly [string, string];
  description: string;
  tags: string[];
  highlights: string[];
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stat?: { value: string; label: string };
};

/** Server-side fetch to the public hero API (per CMS integration notes). */
export async function fetchPublicHeroSlides(): Promise<PublicHeroSlide[]> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return [];
    const proto = h.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${proto}://${host}/api/public/hero`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as PublicHeroSlide[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
