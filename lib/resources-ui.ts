import type { SocietyResourcePublic } from "@/lib/resources-page";

/** Unified blue palette for all resource types (GCS brand). */
const blueBadge = "bg-gcs-primary text-white";
const bluePlaceholder = "from-blue-50 via-sky-50/80 to-white";
const blueIconWrap = "bg-white text-gcs-primary ring-blue-200/80";
const blueAccent = "group-hover:shadow-gcs-primary/20";

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
    badge: blueBadge,
    placeholder: "from-slate-900 via-blue-950 to-slate-900",
    iconWrap: "bg-white/10 text-white ring-white/20",
    accent: blueAccent,
  },
  document: {
    label: "Document",
    badge: blueBadge,
    placeholder: bluePlaceholder,
    iconWrap: blueIconWrap,
    accent: blueAccent,
  },
  link: {
    label: "Link",
    badge: blueBadge,
    placeholder: bluePlaceholder,
    iconWrap: blueIconWrap,
    accent: blueAccent,
  },
  other: {
    label: "Other",
    badge: blueBadge,
    placeholder: bluePlaceholder,
    iconWrap: blueIconWrap,
    accent: blueAccent,
  },
};
