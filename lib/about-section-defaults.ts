/** Default about sections — used when the database is empty or unreachable. */
export const ABOUT_SECTION_SEED = [
  {
    sortOrder: 0,
    published: true,
    title: "Our mission",
    subtitle: "Chemistry in service of Ghana",
    body: "We advance chemical education, research integrity, and evidence-based policy dialogue—linking universities, industry, and public institutions.",
    layout: "default",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    imageAlt: "Collaboration in science",
  },
  {
    sortOrder: 1,
    published: true,
    title: "What we do",
    subtitle: null as string | null,
    body: "Conferences, publications, outreach to schools, and professional networks that strengthen the chemical sciences nationwide.",
    layout: "wide",
    imageUrl: null as string | null,
    imageAlt: null as string | null,
  },
] as const;

export type AboutSectionPublic = {
  id: string;
  sortOrder: number;
  published: boolean;
  title: string;
  subtitle: string | null;
  body: string;
  layout: string;
  media: { url: string; alt: string | null } | null;
};

export function aboutSectionsPublicFallback(): AboutSectionPublic[] {
  return ABOUT_SECTION_SEED.filter((s) => s.published).map((s, i) => ({
    id: `about-fallback-${i}`,
    sortOrder: s.sortOrder,
    published: s.published,
    title: s.title,
    subtitle: s.subtitle,
    body: s.body,
    layout: s.layout,
    media: s.imageUrl ? { url: s.imageUrl, alt: s.imageAlt } : null,
  }));
}
