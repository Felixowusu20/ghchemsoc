import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-fallback";
import { countMembershipAnnualStatuses } from "@/lib/membership-annual-status";

export type CmsDashboardStats = {
  publishedNews: number;
  publishedEvents: number;
  publishedPublications: number;
  publishedHeroSlides: number;
  approvedMembers: number;
  activeMembers: number;
  inactiveMembers: number;
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
  activeMembers: 0,
  inactiveMembers: 0,
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
        approvedMemberRows,
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
        prisma.membershipApplication.findMany({
          where: { status: "approved", memberId: { not: null } },
          select: { status: true, paidAt: true, approvedAt: true },
        }),
        prisma.memberAnnouncement.count({ where: { sentAt: null } }),
        prisma.memberAnnouncement.count({ where: { sentAt: { not: null } } }),
        prisma.memberAnnouncement.findFirst({
          where: { sentAt: { not: null } },
          orderBy: { sentAt: "desc" },
          select: { sentAt: true },
        }),
      ]);

      const { active: activeMembers, inactive: inactiveMembers } =
        countMembershipAnnualStatuses(approvedMemberRows);

      return {
        publishedNews,
        publishedEvents,
        publishedPublications,
        publishedHeroSlides,
        approvedMembers,
        activeMembers,
        inactiveMembers,
        draftAnnouncements,
        sentAnnouncements,
        latestAnnouncementSentAt: latestAnnouncement?.sentAt?.toISOString() ?? null,
      };
    },
    emptyStats()
  );
}
