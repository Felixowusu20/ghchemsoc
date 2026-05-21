import type { SocietyResourcePublic } from "@/lib/resources-page";

export const RESOURCE_KIND_STYLES: Record<
  SocietyResourcePublic["kind"],
  {
    label: string;
    badge: string;
    placeholder: string;
    iconWrap: string;
    accent: string;
  }
> = {
  video: {
    label: "Video",
    badge: "bg-indigo-500/95 text-white",
    placeholder: "from-slate-900 via-indigo-950 to-slate-900",
    iconWrap: "bg-white/10 text-white ring-white/20",
    accent: "group-hover:shadow-indigo-500/15",
  },
  document: {
    label: "Document",
    badge: "bg-amber-500/95 text-white",
    placeholder: "from-amber-50 via-orange-50/80 to-white",
    iconWrap: "bg-white text-amber-700 ring-amber-200/80",
    accent: "group-hover:shadow-amber-500/15",
  },
  link: {
    label: "Link",
    badge: "bg-sky-500/95 text-white",
    placeholder: "from-sky-50 via-cyan-50/50 to-white",
    iconWrap: "bg-white text-sky-700 ring-sky-200/80",
    accent: "group-hover:shadow-sky-500/15",
  },
  other: {
    label: "Other",
    badge: "bg-violet-500/95 text-white",
    placeholder: "from-violet-50 via-fuchsia-50/40 to-white",
    iconWrap: "bg-white text-violet-700 ring-violet-200/80",
    accent: "group-hover:shadow-violet-500/15",
  },
};
