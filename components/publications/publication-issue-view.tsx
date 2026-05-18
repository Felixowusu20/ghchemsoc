import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { Media, Publication, PublicationArticle } from "@prisma/client";
import { formatPublicationDate, formatPublicationDateIso } from "@/lib/publication-format";
import { PublicationsSidebar } from "@/components/publications/publications-sidebar";

export type PublicationIssue = Publication & {
  media: Media | null;
  articles: PublicationArticle[];
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b-2 border-gcs-primary pb-2 text-xs font-bold uppercase tracking-[0.2em] text-gcs-muted-text">
      {children}
    </h2>
  );
}

function ArticleRow({ article }: { article: PublicationArticle }) {
  return (
    <li className="border-b border-gcs-border/50 py-6 last:border-b-0">
      <h3 className="text-base font-semibold leading-snug tracking-tight text-gcs-primary md:text-lg">{article.title}</h3>
      <p className="mt-2 text-sm text-gcs-muted-text">{article.authors}</p>
      {article.pdfHref ? (
        <a
          href={article.pdfHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <FileText className="h-4 w-4" aria-hidden />
          PDF
        </a>
      ) : null}
    </li>
  );
}

export function PublicationIssueView({
  issue,
  archives,
  breadcrumbs,
}: {
  issue: PublicationIssue;
  archives: PublicationIssue[];
  breadcrumbs?: { label: string; href?: string }[];
}) {
  const publishedLabel = formatPublicationDate(issue.publishedAt);
  const articles = issue.articles.filter((a) => a.published).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-8">
        {breadcrumbs?.length ? (
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gcs-muted-text" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 ? <span className="text-gcs-border">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="font-medium text-gcs-primary hover:text-gcs-primary-hover">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="line-clamp-1 text-gcs-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <header>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-gcs-foreground md:text-3xl lg:text-[2rem]">
            {issue.title}
          </h1>
          {issue.journalTitle ? <p className="mt-2 text-base font-medium text-gcs-muted-text">{issue.journalTitle}</p> : null}
        </header>

        <div className="mt-8 flex flex-col gap-8 border-y border-gcs-border/60 py-8 sm:flex-row sm:items-start sm:gap-10">
          {issue.media?.url ? (
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg border border-gcs-border/60 bg-white shadow-md ring-1 ring-gcs-border/30 sm:mx-0">
              <Image
                src={issue.media.url}
                alt={issue.media.alt ?? issue.title}
                fill
                className="object-cover"
                sizes="220px"
                priority
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            {publishedLabel ? (
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">
                Published:{" "}
                <time dateTime={formatPublicationDateIso(issue.publishedAt) ?? undefined} className="text-gcs-foreground">
                  {publishedLabel}
                </time>
              </p>
            ) : null}
            {issue.description ? (
              <p className="mt-4 text-sm leading-relaxed text-gcs-muted-text md:text-base">{issue.description}</p>
            ) : null}
            {issue.href ? (
              <a
                href={issue.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
              >
                View full issue online
              </a>
            ) : null}
          </div>
        </div>

        <section className="mt-10" aria-labelledby="issue-articles-heading">
          <SectionLabel>
            <span id="issue-articles-heading">Articles</span>
          </SectionLabel>
          {articles.length ? (
            <ul className="mt-4 list-none">
              {articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-gcs-muted-text">No articles listed for this issue yet.</p>
          )}
        </section>
      </div>

      <aside className="lg:col-span-4 lg:border-l lg:border-gcs-border/50 lg:pl-10">
        <PublicationsSidebar archives={archives} currentId={issue.id} />
      </aside>
    </div>
  );
}
