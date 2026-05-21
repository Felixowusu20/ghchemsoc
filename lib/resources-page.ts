export const RESOURCES_PAGE_ID = "resources_page" as const;

export const RESOURCES_PAGE_DEFAULTS = {
  eyebrow: "Resources",
  headline: "Videos, documents & tools",
  lead: "Conference recordings, slide decks, technical guides, and useful links curated by the Ghana Chemical Society for members and the wider chemistry community.",
} as const;

export type ResourcesPagePublic = {
  eyebrow: string;
  headline: string;
  lead: string;
};

export type SocietyResourcePublic = {
  id: string;
  kind: "video" | "document" | "link" | "other";
  title: string;
  description: string;
  url: string | null;
  urlPublicId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
};
