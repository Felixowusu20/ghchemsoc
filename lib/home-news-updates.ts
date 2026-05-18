import type { Media, NewsItem, Publication } from "@prisma/client";
import { getPublishedNewsItems, getPublishedPublications } from "@/lib/cms-queries";

export type HomeDeskCard = {
  id: string;
  kind: "news" | "publication";
  category: string;
  dateIso: string;
  dateLabel: string;
  title: string;
  excerpt?: string;
  href: string;
  external: boolean;
  imageUrl: string;
  imageAlt: string;
};

export type HomeNewsUpdatesData = {
  featured: HomeDeskCard | null;
  side: HomeDeskCard[];
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function newsToCard(row: NewsItem & { media: Media | null }): HomeDeskCard | null {
  if (!row.media?.url) return null;
  return {
    id: row.id,
    kind: "news",
    category: "News",
    dateIso: row.date.toISOString(),
    dateLabel: fmt(row.date),
    title: row.title,
    excerpt: row.excerpt,
    href: `/news/${row.slug}`,
    external: false,
    imageUrl: row.media.url,
    imageAlt: row.media.alt ?? row.title,
  };
}

function publicationToCard(row: Publication & { media: Media | null }): HomeDeskCard | null {
  if (!row.media?.url) return null;
  const href = row.href?.trim();
  const external = Boolean(href && isExternalHref(href));
  return {
    id: row.id,
    kind: "publication",
    category: row.meta?.trim() || "Publications",
    dateIso: row.createdAt.toISOString(),
    dateLabel:
      row.publishedAt?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) ||
      row.issue?.trim() ||
      row.meta?.trim() ||
      "Publication",
    title: row.title,
    excerpt: row.description,
    href: href && href.length > 0 ? href : "/publications",
    external,
    imageUrl: row.media.url,
    imageAlt: row.media.alt ?? row.title,
  };
}

/** Featured story + up to three side cards from published news and publications. */
export function buildHomeNewsUpdates(
  newsRows: (NewsItem & { media: Media | null })[],
  publicationRows: (Publication & { media: Media | null })[]
): HomeNewsUpdatesData {
  const news = newsRows.map(newsToCard).filter((c): c is HomeDeskCard => c !== null);
  const publications = publicationRows.map(publicationToCard).filter((c): c is HomeDeskCard => c !== null);

  const featured: HomeDeskCard | null = news[0] ?? publications[0] ?? null;
  const newsRest = featured?.kind === "news" ? news.slice(1) : news;
  const pubsRest = featured?.kind === "publication" ? publications.slice(1) : publications;

  const side: HomeDeskCard[] = [];
  let ni = 0;
  let pi = 0;
  while (side.length < 3 && (ni < newsRest.length || pi < pubsRest.length)) {
    const preferPublication = side.length % 2 === 0;
    if (preferPublication && pi < pubsRest.length) {
      side.push(pubsRest[pi++]);
    } else if (ni < newsRest.length) {
      side.push(newsRest[ni++]);
    } else if (pi < pubsRest.length) {
      side.push(pubsRest[pi++]);
    }
  }

  return { featured, side };
}

export async function getHomeNewsUpdatesData(): Promise<HomeNewsUpdatesData> {
  const [newsRows, publicationRows] = await Promise.all([getPublishedNewsItems(), getPublishedPublications()]);
  return buildHomeNewsUpdates(newsRows, publicationRows);
}
