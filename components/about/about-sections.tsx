import Image from "next/image";

export type AboutSection = {
  id: string;
  title: string;
  subtitle: string | null;
  body: string;
  layout: string;
  media: { url: string; alt: string | null } | null;
};

function BodyBlocks({ body }: { body: string }) {
  return (
    <div className="gcs-body space-y-4 text-slate-600">
      {body.split("\n\n").map((block, j) => (
        <p key={j}>{block}</p>
      ))}
    </div>
  );
}

function SectionIndex({ index }: { index: number }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gcs-primary text-sm font-bold text-white shadow-sm shadow-blue-600/25">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/** Image left, copy right — consistent side-by-side on tablet+ */
function SideBySideSection({ s, index }: { s: AboutSection; index: number }) {
  const hasMedia = Boolean(s.media);
  const isWide = s.layout === "wide";

  return (
    <article className="group overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-[0_8px_30px_-12px_rgba(29,78,216,0.15)] ring-1 ring-blue-50 md:rounded-3xl">
      <div
        className={`grid items-stretch ${hasMedia ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
      >
        {hasMedia ? (
          <div
            className={`relative min-h-[260px] bg-blue-50 sm:min-h-[300px] ${
              isWide ? "md:min-h-[360px]" : "md:min-h-[320px]"
            }`}
          >
            <Image
              src={s.media!.url}
              alt={s.media!.alt ?? s.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/15 via-transparent to-transparent md:bg-gradient-to-br md:from-gcs-primary/15 md:via-transparent md:to-blue-950/20" />
          </div>
        ) : null}

        <div
          className={`flex flex-col justify-center border-blue-50 px-6 py-9 md:px-10 md:py-11 lg:px-12 lg:py-12 ${
            hasMedia ? "border-t md:border-t-0 md:border-l" : ""
          } bg-gradient-to-br from-white via-white to-blue-50/35`}
        >
          <div className="mb-5 flex items-center gap-4">
            <SectionIndex index={index} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gcs-primary">Topic {index + 1}</span>
          </div>

          <div className="gcs-topic-accent">
            <h2 className="gcs-topic-title">{s.title}</h2>
            {s.subtitle ? (
              <p className="mt-3 text-lg font-semibold text-gcs-primary md:text-xl">{s.subtitle}</p>
            ) : null}
          </div>

          <div className="mt-7">
            <BodyBlocks body={s.body} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function AboutSections({ sections }: { sections: AboutSection[] }) {
  if (sections.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-blue-200/80 bg-white/80 px-8 py-16 text-center shadow-sm backdrop-blur-sm">
        <p className="text-lg font-semibold text-slate-900">Content coming soon</p>
        <p className="gcs-body mt-2">
          Society sections will appear here once they are published in the admin.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-12">
      {sections.map((s, i) => (
        <SideBySideSection key={s.id} s={s} index={i} />
      ))}
    </div>
  );
}
