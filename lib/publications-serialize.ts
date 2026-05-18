import type { Media, Publication, PublicationArticle } from "@prisma/client";
import { formatPublicationDateIso } from "@/lib/publication-format";
import { contactEmailsFromDb } from "@/lib/publication-contact-emails";

export type PublicationWithRelations = Publication & {
  media: Media | null;
  articles: PublicationArticle[];
};

export function serializePublicationArticle(a: PublicationArticle) {
  return {
    id: a.id,
    title: a.title,
    authors: a.authors,
    pdfHref: a.pdfHref,
    sortOrder: a.sortOrder,
    published: a.published,
  };
}

export function serializePublication(row: PublicationWithRelations) {
  return {
    id: row.id,
    title: row.title,
    journalTitle: row.journalTitle,
    meta: row.meta,
    description: row.description,
    issue: row.issue,
    href: row.href,
    published: row.published,
    featured: row.featured,
    publishedAt: formatPublicationDateIso(row.publishedAt),
    sortOrder: row.sortOrder,
    mediaId: row.mediaId,
    imageUrl: row.media?.url ?? "",
    imagePublicId: row.media?.publicId ?? null,
    imageAlt: row.media?.alt ?? "",
    readerEmails: contactEmailsFromDb(row.readerEmails),
    authorEmails: contactEmailsFromDb(row.authorEmails),
    articles: row.articles
      .filter((a) => a.published)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(serializePublicationArticle),
  };
}

export function serializePublicationCms(row: PublicationWithRelations) {
  return {
    ...serializePublication(row),
    articles: row.articles.sort((a, b) => a.sortOrder - b.sortOrder).map(serializePublicationArticle),
  };
}
