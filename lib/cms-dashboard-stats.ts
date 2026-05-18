import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-fallback";

export type CmsDashboardStats = {
  publishedNews: number;
  publishedEvents: number;
  publishedPublications: number;
  publishedHeroSlides: number;
};

const emptyStats = (): CmsDashboardStats => ({
  publishedNews: 0,
  publishedEvents: 0,
  publishedPublications: 0,
  publishedHeroSlides: 0,
});

export async function getCmsDashboardStats(): Promise<CmsDashboardStats> {
  return withDbFallback(
    "getCmsDashboardStats",
    async () => {
      const [publishedNews, publishedEvents, publishedPublications, publishedHeroSlides] = await Promise.all([
        prisma.newsItem.count({ where: { published: true } }),
        prisma.societyEvent.count({ where: { published: true } }),
        prisma.publication.count({ where: { published: true } }),
        prisma.heroSlide.count({ where: { published: true, mediaId: { not: null } } }),
      ]);
      return { publishedNews, publishedEvents, publishedPublications, publishedHeroSlides };
    },
    emptyStats()
  );
}
