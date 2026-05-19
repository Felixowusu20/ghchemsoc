import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-fallback";

export type CmsDashboardStats = {
  publishedNews: number;
  publishedEvents: number;
  publishedPublications: number;
  publishedHeroSlides: number;
  approvedMembers: number;
  draftAnnouncements: number;
  sentAnnouncements: number;
  /** ISO string for the most recent member announcement that was sent. */
  latestAnnouncementSentAt: string | null;
};

const emptyStats = (): CmsDashboardStats => ({
  publishedNews: 0,
  publishedEvents: 0,
  publishedPublications: 0,
  publishedHeroSlides: 0,
  approvedMembers: 0,
  draftAnnouncements: 0,
  sentAnnouncements: 0,
  latestAnnouncementSentAt: null,
});

export async function getCmsDashboardStats(): Promise<CmsDashboardStats> {
  return withDbFallback(
    "getCmsDashboardStats",
    async () => {
      const [
        publishedNews,
        publishedEvents,
        publishedPublications,
        publishedHeroSlides,
        approvedMembers,
        draftAnnouncements,
        sentAnnouncements,
        latestAnnouncement,
      ] = await Promise.all([
        prisma.newsItem.count({ where: { published: true } }),
        prisma.societyEvent.count({ where: { published: true } }),
        prisma.publication.count({ where: { published: true } }),
        prisma.heroSlide.count({ where: { published: true, mediaId: { not: null } } }),
        prisma.membershipApplication.count({
          where: { status: "approved", memberId: { not: null } },
        }),
        prisma.memberAnnouncement.count({ where: { sentAt: null } }),
        prisma.memberAnnouncement.count({ where: { sentAt: { not: null } } }),
        prisma.memberAnnouncement.findFirst({
          where: { sentAt: { not: null } },
          orderBy: { sentAt: "desc" },
          select: { sentAt: true },
        }),
      ]);

      return {
        publishedNews,
        publishedEvents,
        publishedPublications,
        publishedHeroSlides,
        approvedMembers,
        draftAnnouncements,
        sentAnnouncements,
        latestAnnouncementSentAt: latestAnnouncement?.sentAt?.toISOString() ?? null,
      };
    },
    emptyStats()
  );
}
