import Image from "next/image";
import { FileText, Link2, Play, Sparkles } from "lucide-react";
import { ResourceVideoFrame } from "@/components/resources/resource-video-frame";
import { resolveVideoPlayback } from "@/lib/society-resources";
import { RESOURCE_KIND_STYLES } from "@/lib/resources-ui";
import type { SocietyResourcePublic } from "@/lib/resources-page";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function KindIcon({ kind }: { kind: SocietyResourcePublic["kind"] }) {
  const className = "h-3.5 w-3.5";
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

export function ResourcesFeatured({ item }: { item: SocietyResourcePublic }) {
  const playback = item.kind === "video" ? resolveVideoPlayback(item.url) : null;
  const date = fmtDate(item.publishedAt);
  const style = RESOURCE_KIND_STYLES[item.kind];
  const hasMedia = Boolean(playback || item.imageUrl);

  return (
    <article className="overflow-hidden rounded-[1.85rem] border border-gcs-border/50 bg-white shadow-[0_24px_64px_-32px_rgba(15,23,42,0.2)] ring-1 ring-gcs-border/20 lg:rounded-[2rem]">
      <div className="flex flex-col lg:min-h-[340px] lg:flex-row">
        {playback ? (
          <div className="relative w-full shrink-0 lg:w-[52%]">
            <ResourceVideoFrame
              url={item.url}
              urlPublicId={item.urlPublicId}
              title={item.title}
              className="lg:min-h-[340px] lg:rounded-none"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/10" />
          </div>
        ) : item.imageUrl ? (
          <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[52%] lg:min-h-[340px]">
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/20" />
          </div>
        ) : (
          <div
            className={`relative flex aspect-[16/10] w-full shrink-0 items-center justify-center bg-gradient-to-br lg:aspect-auto lg:w-[40%] lg:min-h-[340px] ${style.placeholder}`}
          >
            <span className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl ring-1 ${style.iconWrap}`}>
              <KindIcon kind={item.kind} />
            </span>
          </div>
        )}

        <div
          className={`flex flex-1 flex-col justify-center px-7 py-10 md:px-11 md:py-12 ${
            hasMedia ? "border-t border-gcs-border/50 lg:border-l lg:border-t-0" : ""
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${style.badge}`}
            >
              <KindIcon kind={item.kind} />
              {style.label}
            </span>
            {date ? (
              <>
                <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
                <time dateTime={item.publishedAt!} className="text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">
                  {date}
                </time>
              </>
            ) : null}
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-[1.85rem] md:leading-tight">
            {item.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gcs-muted-text">{item.description}</p>
        </div>
      </div>
    </article>
  );
}
