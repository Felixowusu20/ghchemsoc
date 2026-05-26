import type { ExecutivePublic } from "@/lib/executive-defaults";
import { ExecutiveCard } from "@/components/executives/executive-card";

export function ExecutivesGrid({ executives }: { executives: ExecutivePublic[] }) {
  if (executives.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-blue-200/80 bg-white/90 px-8 py-16 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Leadership profiles coming soon</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Executive officers will be listed here once published in the admin.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-9">
      {executives.map((e, index) => (
        <li key={e.id} data-aos="fade-up" data-aos-delay={Math.min(index * 80, 320)}>
          <ExecutiveCard executive={e} />
        </li>
      ))}
    </ul>
  );
}
