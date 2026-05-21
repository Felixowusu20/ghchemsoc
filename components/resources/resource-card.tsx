"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText, Link2, Play, Sparkles } from "lucide-react";
import { ResourceVideoFrame } from "@/components/resources/resource-video-frame";
import { resolveVideoPlayback } from "@/lib/society-resources";
import { RESOURCE_KIND_STYLES } from "@/lib/resources-ui";
import type { SocietyResourcePublic } from "@/lib/resources-page";
import { cn } from "@/lib/utils";

function KindIcon({ kind }: { kind: SocietyResourcePublic["kind"] }) {
  const className = "h-4 w-4";
  switch (kind) {
    case "video":
      return <Play className={className} aria-hidden />;
    case "document":
      return <FileText className={className} aria-hidden />;
    case "link":
      return <Link2 className={className} aria-hidden />;
    default:
      return <Sparkles className={className} aria-hidden />;
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ResourceCard({ item }: { item: SocietyResourcePublic; featured?: boolean }) {
  const playback = item.kind === "video" ? resolveVideoPlayback(item.url) : null;
  const date = fmtDate(item.publishedAt);
  const href = item.kind !== "video" ? item.url?.trim() || null : null;
  const style = RESOURCE_KIND_STYLES[item.kind];

  const card = (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-gcs-border/40 bg-white transition-all duration-300",
        "shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-gcs-border/10",
        href && "hover:-translate-y-1 hover:border-gcs-primary/25",
        style.accent,
        href && "hover:shadow-[0_20px_50px_-20px_rgba(29,78,216,0.25)]"
      )}
    >
      <div className="relative overflow-hidden">
        {playback ? (
          <>
            <ResourceVideoFrame url={item.url} urlPublicId={item.urlPublicId} title={item.title} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span
              className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${style.badge}`}
            >
              <KindIcon kind={item.kind} />
              {style.label}
            </span>
          </>
        ) : item.imageUrl ? (
          <div className="relative aspect-[16/10] w-full bg-gcs-surface">
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            <span
              className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${style.badge}`}
            >
              <KindIcon kind={item.kind} />
              {style.label}
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-gradient-to-br",
              style.placeholder
            )}
          >
            <div
              className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,#1e40af_1px,transparent_0)] [background-size:18px_18px]"
              aria-hidden
            />
            <span
              className={cn(
                "relative inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ring-1 transition-transform duration-300 group-hover:scale-105",
                style.iconWrap
              )}
            >
              <KindIcon kind={item.kind} />
            </span>
            <span
              className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md ${style.badge}`}
            >
              {style.label}
            </span>
          </div>
        )}

        {href ? (
          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gcs-primary opacity-0 shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {date ? (
          <time
            dateTime={item.publishedAt!}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gcs-muted-text"
          >
            {date}
          </time>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gcs-muted-text/80">
            {style.label}
          </span>
        )}
        <h3
          className={cn(
            "mt-2.5 text-lg font-semibold leading-snug tracking-tight text-gcs-foreground transition-colors",
            href && "group-hover:text-gcs-primary"
          )}
        >
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gcs-muted-text line-clamp-3">{item.description}</p>

        {href ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gcs-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Open resource
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </p>
        ) : null}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className="block h-full outline-none focus-visible:rounded-[1.35rem] focus-visible:ring-2 focus-visible:ring-gcs-primary focus-visible:ring-offset-2">
        {card}
      </Link>
    );
  }

  return card;
}
