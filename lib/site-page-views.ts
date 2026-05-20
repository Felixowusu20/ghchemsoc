import { prisma } from "@/lib/prisma";

export async function recordSitePageView(path: string, visitorKey?: string | null) {
  const normalized = path.split("?")[0]?.trim() || "/";
  await prisma.sitePageView.create({
    data: {
      path: normalized.slice(0, 512),
      visitorKey: visitorKey?.slice(0, 64) ?? null,
    },
  });
}

export function pageViewYear(d: Date): number {
  return d.getUTCFullYear();
}
