import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-fallback";
import {
  HOMEPAGE_EXPLORE_ID,
  homepageExploreCreateData,
  homepageExploreDefaults,
  mapHomepageExploreRow,
  type HomepageExplorePublic,
} from "@/lib/homepage-explore";
import {
  HOMEPAGE_EVENTS_ID,
  homepageEventsCreateData,
  homepageEventsDefaults,
  mapHomepageEventsRow,
  type HomepageEventsPublic,
  type HomepageEventsRow,
} from "@/lib/homepage-events";
import { HOMEPAGE_EVENTS_DEFAULTS } from "@/lib/homepage-events-defaults";
import {
  HOMEPAGE_PARTNERSHIPS_ID,
  buildHomepagePartnershipsPublic,
  homepagePartnershipsDefaults,
  homepagePartnershipsSettingsCreateData,
  type HomepagePartnershipsPublic,
} from "@/lib/homepage-partnerships";
import {
  SITE_FOOTER_ID,
  mapSiteFooterRow,
  siteFooterCreateData,
  siteFooterDefaults,
  type SiteFooterPublic,
} from "@/lib/site-footer";

export type { HomepageExplorePublic, HomepageEventsPublic, HomepagePartnershipsPublic };

export async function getPublishedAboutSections() {
  return withDbFallback(
    "getPublishedAboutSections",
    () =>
      prisma.aboutSection.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      }),
    []
  );
}

export async function getJoinPageForPublic() {
  return withDbFallback(
    "getJoinPageForPublic",
    async () => {
      const header = await prisma.joinPageHeader.findUnique({
        where: { key: "join_page_header" },
        include: { media: true },
      });
      const steps = await prisma.joinStep.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      });
      return { header, steps };
    },
    { header: null, steps: [] }
  );
}

export async function getPublishedNewsItems() {
  return withDbFallback(
    "getPublishedNewsItems",
    () =>
      prisma.newsItem.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
        include: { media: true },
      }),
    []
  );
}

const publicationInclude = {
  media: true,
  articles: { where: { published: true }, orderBy: { sortOrder: "asc" as const } },
} as const;

export async function getPublishedPublications() {
  return withDbFallback(
    "getPublishedPublications",
    () =>
      prisma.publication.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { sortOrder: "asc" }],
        include: publicationInclude,
      }),
    []
  );
}

export async function getPublishedPublicationById(id: string) {
  return withDbFallback(
    "getPublishedPublicationById",
    () =>
      prisma.publication.findFirst({
        where: { id, published: true },
        include: publicationInclude,
      }),
    null
  );
}

export async function getFeaturedPublication() {
  return withDbFallback(
    "getFeaturedPublication",
    async () => {
      const featured = await prisma.publication.findFirst({
        where: { published: true, featured: true },
        orderBy: { publishedAt: "desc" },
        include: publicationInclude,
      });
      if (featured) return featured;
      return prisma.publication.findFirst({
        where: { published: true },
        orderBy: [{ publishedAt: "desc" }, { sortOrder: "asc" }],
        include: publicationInclude,
      });
    },
    null
  );
}

export async function getNewsBySlug(slug: string) {
  return withDbFallback(
    "getNewsBySlug",
    () =>
      prisma.newsItem.findFirst({
        where: { slug, published: true },
        include: { media: true },
      }),
    null
  );
}

export async function getPublishedSocietyEvents() {
  return withDbFallback(
    "getPublishedSocietyEvents",
    () =>
      prisma.societyEvent.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { startDate: "asc" }],
        include: { media: true },
      }),
    []
  );
}

export async function getPublishedSocietyEventById(id: string) {
  return withDbFallback(
    "getPublishedSocietyEventById",
    () =>
      prisma.societyEvent.findFirst({
        where: { id, published: true },
        include: { media: true },
      }),
    null
  );
}

export async function getContactSettings() {
  return withDbFallback(
    "getContactSettings",
    () => prisma.contactSettings.findUnique({ where: { id: "contact" } }),
    null
  );
}

export async function getSiteFooterForPublic(): Promise<SiteFooterPublic> {
  try {
    return await withDbFallback(
      "getSiteFooterForPublic",
      async () => {
        let row = await prisma.siteFooterSettings.findUnique({
          where: { id: SITE_FOOTER_ID },
          include: { leftImageMedia: true, rightImageMedia: true },
        });
        if (!row) {
          row = await prisma.siteFooterSettings.create({
            data: siteFooterCreateData(),
            include: { leftImageMedia: true, rightImageMedia: true },
          });
        }
        return mapSiteFooterRow(row);
      },
      siteFooterDefaults()
    );
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "P2021" || /SiteFooterSettings/i.test(error instanceof Error ? error.message : "")) {
      return siteFooterDefaults();
    }
    throw error;
  }
}

export async function getHomepageExploreForPublic(): Promise<HomepageExplorePublic> {
  return withDbFallback(
    "getHomepageExploreForPublic",
    async () => {
      let row = await prisma.homepageExploreSettings.findUnique({
        where: { id: HOMEPAGE_EXPLORE_ID },
        include: { mainImageMedia: true, secondaryImageMedia: true },
      });
      if (!row) {
        row = await prisma.homepageExploreSettings.create({
          data: homepageExploreCreateData(),
          include: { mainImageMedia: true, secondaryImageMedia: true },
        });
      }
      return mapHomepageExploreRow(row);
    },
    homepageExploreDefaults()
  );
}

export async function ensureHomepageEventsRow(): Promise<HomepageEventsRow> {
  const existing = await prisma.homepageEventsSettings.findUnique({
    where: { id: HOMEPAGE_EVENTS_ID },
    include: { imageMedia: true },
  });
  if (existing?.imageMedia?.url?.trim()) return existing;

  const d = HOMEPAGE_EVENTS_DEFAULTS;
  let imageMediaId = existing?.imageMediaId ?? null;

  if (!imageMediaId) {
    const media = await prisma.media.create({
      data: { url: d.fallbackImageUrl, publicId: null, alt: d.fallbackImageAlt },
    });
    imageMediaId = media.id;
  } else {
    await prisma.media.update({
      where: { id: imageMediaId },
      data: { url: d.fallbackImageUrl, alt: d.fallbackImageAlt },
    });
  }

  if (existing) {
    return prisma.homepageEventsSettings.update({
      where: { id: HOMEPAGE_EVENTS_ID },
      data: { imageMediaId },
      include: { imageMedia: true },
    });
  }

  return prisma.homepageEventsSettings.create({
    data: { ...homepageEventsCreateData(), imageMediaId },
    include: { imageMedia: true },
  });
}

export async function getHomepageEventsForPublic(): Promise<HomepageEventsPublic> {
  return withDbFallback(
    "getHomepageEventsForPublic",
    async () => {
      const row = await ensureHomepageEventsRow();
      return mapHomepageEventsRow(row);
    },
    homepageEventsDefaults()
  );
}

export async function getHomepagePartnershipsForPublic(): Promise<HomepagePartnershipsPublic> {
  return withDbFallback(
    "getHomepagePartnershipsForPublic",
    async () => {
      let settings = await prisma.homepagePartnershipsSettings.findUnique({
        where: { id: HOMEPAGE_PARTNERSHIPS_ID },
      });
      if (!settings) {
        settings = await prisma.homepagePartnershipsSettings.create({
          data: homepagePartnershipsSettingsCreateData(),
        });
      }
      const cards = await prisma.partnershipCard.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      });
      return buildHomepagePartnershipsPublic(settings, cards);
    },
    homepagePartnershipsDefaults()
  );
}

export async function getPartnershipCardsForCms() {
  return prisma.partnershipCard.findMany({
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
}
