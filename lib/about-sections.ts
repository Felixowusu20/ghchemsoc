import { prisma } from "@/lib/prisma";
import type { AboutSection, Media } from "@prisma/client";
import { ABOUT_SECTION_SEED } from "@/lib/about-section-defaults";

export type AboutSectionWithMedia = AboutSection & { media: Media | null };

/** Inserts default about sections when none exist (restores public About page content). */
export async function seedAboutSectionsIfEmpty(): Promise<void> {
  const count = await prisma.aboutSection.count();
  if (count > 0) return;

  for (const s of ABOUT_SECTION_SEED) {
    let mediaId: string | null = null;
    if (s.imageUrl) {
      const m = await prisma.media.create({
        data: { url: s.imageUrl, publicId: null, alt: s.imageAlt },
      });
      mediaId = m.id;
    }
    await prisma.aboutSection.create({
      data: {
        sortOrder: s.sortOrder,
        published: s.published,
        title: s.title,
        subtitle: s.subtitle,
        body: s.body,
        layout: s.layout,
        mediaId,
      },
    });
  }
}

export async function fetchPublishedAboutSections(): Promise<AboutSectionWithMedia[]> {
  let rows = await prisma.aboutSection.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
  if (rows.length === 0) {
    await seedAboutSectionsIfEmpty();
    rows = await prisma.aboutSection.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });
  }
  return rows;
}
