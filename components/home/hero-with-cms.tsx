import { fetchPublicHeroSlides } from "@/lib/fetch-public-hero";
import { Hero } from "@/components/home/hero";

export async function HeroWithCms() {
  const cmsSlides = await fetchPublicHeroSlides();
  return <Hero cmsSlides={cmsSlides} />;
}
