import { HOMEPAGE_EVENTS_DEFAULTS } from "@/lib/homepage-events-defaults";

export function resolveHomepageEventsImageUrl(url: string | null | undefined): string {
  const trimmed = url?.trim();
  return trimmed || HOMEPAGE_EVENTS_DEFAULTS.fallbackImageUrl;
}

export function hasHomepageEventsImage(url: string | null | undefined): boolean {
  return Boolean(url?.trim());
}
