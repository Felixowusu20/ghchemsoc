import type { SocietyResourceKind } from "@prisma/client";
import { optimizeVideoDeliveryUrl } from "@/lib/video-delivery-url";

export const SOCIETY_RESOURCE_KINDS: { value: SocietyResourceKind; label: string; description: string }[] = [
  { value: "video", label: "Video", description: "Recordings, talks, and conference sessions" },
  { value: "document", label: "Document", description: "PDFs, slide decks, and downloadable files" },
  { value: "link", label: "Link", description: "External websites and reference pages" },
  { value: "other", label: "Other", description: "Miscellaneous resources" },
];

export function societyResourceKindLabel(kind: SocietyResourceKind): string {
  return SOCIETY_RESOURCE_KINDS.find((k) => k.value === kind)?.label ?? "Resource";
}

export type VideoEmbed = {
  provider: "youtube" | "vimeo";
  embedUrl: string;
};

export type VideoPlayback =
  | { mode: "embed"; provider: "youtube" | "vimeo"; embedUrl: string }
  | { mode: "file"; src: string };

const VIDEO_FILE_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;

export function isHostedVideoFile(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (VIDEO_FILE_EXT.test(trimmed)) return true;
  try {
    const u = new URL(trimmed);
    return u.hostname.includes("res.cloudinary.com") && u.pathname.includes("/video/");
  } catch {
    return false;
  }
}

export function parseVideoEmbed(url: string): VideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      if (id && id !== "watch") return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` };
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveVideoPlayback(url: string | null | undefined): VideoPlayback | null {
  if (!url?.trim()) return null;
  const embed = parseVideoEmbed(url);
  if (embed) return { mode: "embed", provider: embed.provider, embedUrl: embed.embedUrl };
  if (isHostedVideoFile(url)) return { mode: "file", src: optimizeVideoDeliveryUrl(url) };
  return null;
}

export function resourceActionLabel(kind: SocietyResourceKind): string {
  switch (kind) {
    case "video":
      return "Watch";
    case "document":
      return "Download";
    case "link":
      return "Open link";
    default:
      return "View";
  }
}

export function isPdfUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf");
  } catch {
    return url.toLowerCase().includes(".pdf");
  }
}

export function cloudinaryAssetTypeForResource(
  kind: SocietyResourceKind,
  url: string | null | undefined
): "video" | "raw" | "image" {
  if (kind === "video" || isHostedVideoFile(url ?? "")) return "video";
  if (kind === "document") return "raw";
  return "image";
}
