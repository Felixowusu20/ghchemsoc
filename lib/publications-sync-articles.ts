import type { Prisma } from "@prisma/client";
import { normalizePublicationArticles, type PublicationArticleInput } from "@/lib/publication-format";

type Tx = Prisma.TransactionClient;

/** Replace all articles for an issue with the submitted list. */
export async function syncPublicationArticles(
  tx: Tx,
  publicationId: string,
  incoming: PublicationArticleInput[]
) {
  const articles = normalizePublicationArticles(incoming);
  await tx.publicationArticle.deleteMany({ where: { publicationId } });
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    await tx.publicationArticle.create({
      data: {
        publicationId,
        title: a.title,
        authors: a.authors,
        pdfHref: a.pdfHref,
        sortOrder: a.sortOrder ?? i,
        published: a.published ?? true,
      },
    });
  }
}
