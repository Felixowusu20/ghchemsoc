import Image from "next/image";
import type { ExecutivePublic } from "@/lib/executive-defaults";

/** Portrait frame on executives page — full image visible (no crop). */
const EXECUTIVE_PHOTO_WIDTH_PX = 280;
const EXECUTIVE_PHOTO_HEIGHT_PX = 360;

export function ExecutivesGrid({ executives }: { executives: ExecutivePublic[] }) {
  if (executives.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-blue-200/80 bg-white/80 px-8 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">Leadership profiles coming soon</p>
        <p className="mt-2 text-sm text-slate-600">Executive officers will be listed here once published in the admin.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 xl:grid-cols-3 xl:gap-12">
      {executives.map((e) => (
        <li key={e.id}>
          <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-[0_8px_30px_-12px_rgba(29,78,216,0.12)] ring-1 ring-blue-50 sm:rounded-3xl">
            <div
              className="relative mx-auto flex w-full max-w-[280px] items-center justify-center bg-gradient-to-b from-blue-50/80 to-white px-4 pt-8"
              style={{ maxWidth: EXECUTIVE_PHOTO_WIDTH_PX }}
            >
              <div
                className="relative w-full"
                style={{
                  width: "100%",
                  maxWidth: EXECUTIVE_PHOTO_WIDTH_PX,
                  height: EXECUTIVE_PHOTO_HEIGHT_PX,
                }}
              >
                {e.media?.url ? (
                  <Image
                    src={e.media.url}
                    alt={e.media.alt ?? e.name}
                    fill
                    className="object-contain object-center"
                    sizes={`(max-width: 640px) 100vw, ${EXECUTIVE_PHOTO_WIDTH_PX}px`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 text-sm text-slate-500">
                    No photo
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-8 pt-5 text-center sm:px-8">
              <h2 className="text-xl font-semibold tracking-tight text-gcs-foreground">{e.name}</h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-gcs-primary">{e.role}</p>
              {e.bio ? (
                <p className="mt-4 text-left text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">{e.bio}</p>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
