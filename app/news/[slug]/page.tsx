import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug } from "@/lib/cms-queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return { title: "News | Ghana Chemical Society" };
  return { title: `${post.title} | Ghana Chemical Society`, description: post.excerpt };
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-24 pt-28 md:pb-32 md:pt-32">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gcs-primary hover:text-gcs-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to news
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">
            <time dateTime={post.date.toISOString()}>{fmt(post.date)}</time>
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-gcs-muted-text">{post.excerpt}</p>
          {post.media ? (
            <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-gcs-border bg-gcs-surface">
              <Image src={post.media.url} alt={post.media.alt ?? post.title} fill className="object-cover" sizes="100vw" priority />
            </div>
          ) : null}
          {post.body ? (
            <div className="mt-10 max-w-none whitespace-pre-wrap text-base leading-relaxed text-gcs-foreground">
              {post.body}
            </div>
          ) : null}
        </article>
      </main>
    </>
  );
}
