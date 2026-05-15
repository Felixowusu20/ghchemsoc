import { prisma } from "@/lib/prisma";
import { HOMEPAGE_EXPLORE_DEFAULTS } from "@/lib/homepage-explore-defaults";

export async function getPublishedAboutSections() {
  return prisma.aboutSection.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
}

export async function getJoinPageForPublic() {
  const header = await prisma.joinPageHeader.findUnique({
    where: { key: "join_page_header" },
    include: { media: true },
  });
  const steps = await prisma.joinStep.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return { header, steps };
}

export async function getPublishedNewsItems() {
  return prisma.newsItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    include: { media: true },
  });
}

export async function getPublishedPublications() {
  return prisma.publication.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
}

export async function getNewsBySlug(slug: string) {
  return prisma.newsItem.findFirst({
    where: { slug, published: true },
    include: { media: true },
  });
}

export async function getPublishedSocietyEvents() {
  return prisma.societyEvent.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { startDate: "asc" }],
    include: { media: true },
  });
}

export async function getContactSettings() {
  return prisma.contactSettings.findUnique({ where: { id: "contact" } });
}

export type HomepageExplorePublic = {
  missionEyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  aboutEyebrow: string;
  aboutBody: string;
  imageBadge: string;
  imageHoverQuote: string;
  locationLabel: string;
  secondaryBadge: string;
  bottomBlurb: string;
  mainImageUrl: string;
  mainImageAlt: string;
  secondaryImageUrl: string;
  secondaryImageAlt: string;
};

export async function getHomepageExploreForPublic(): Promise<HomepageExplorePublic> {
  const d = HOMEPAGE_EXPLORE_DEFAULTS;
  const defaults = (): HomepageExplorePublic => ({
    missionEyebrow: d.missionEyebrow,
    headlineLine1: d.headlineLine1,
    headlineLine2: d.headlineLine2,
    aboutEyebrow: d.aboutEyebrow,
    aboutBody: d.aboutBody,
    imageBadge: d.imageBadge,
    imageHoverQuote: d.imageHoverQuote,
    locationLabel: d.locationLabel,
    secondaryBadge: d.secondaryBadge,
    bottomBlurb: d.bottomBlurb,
    mainImageUrl: d.fallbackMainImageUrl,
    mainImageAlt: d.fallbackMainImageAlt,
    secondaryImageUrl: d.fallbackSecondaryImageUrl,
    secondaryImageAlt: d.fallbackSecondaryImageAlt,
  });

  try {
    const row = await prisma.homepageExploreSettings.findUnique({
      where: { id: "homepage_explore" },
      include: { mainImageMedia: true, secondaryImageMedia: true },
    });
    if (!row) return defaults();
    return {
      missionEyebrow: row.missionEyebrow,
      headlineLine1: row.headlineLine1,
      headlineLine2: row.headlineLine2,
      aboutEyebrow: row.aboutEyebrow,
      aboutBody: row.aboutBody,
      imageBadge: row.imageBadge,
      imageHoverQuote: row.imageHoverQuote,
      locationLabel: row.locationLabel,
      secondaryBadge: row.secondaryBadge,
      bottomBlurb: row.bottomBlurb,
      mainImageUrl: row.mainImageMedia?.url ?? d.fallbackMainImageUrl,
      mainImageAlt: row.mainImageMedia?.alt ?? d.fallbackMainImageAlt,
      secondaryImageUrl: row.secondaryImageMedia?.url ?? d.fallbackSecondaryImageUrl,
      secondaryImageAlt: row.secondaryImageMedia?.alt ?? d.fallbackSecondaryImageAlt,
    };
  } catch {
    return defaults();
  }
}
