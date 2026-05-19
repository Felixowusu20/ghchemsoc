import type { MemberLibraryItem } from "@prisma/client";

export const MEMBER_LIBRARY_TYPES = ["link", "note", "file"] as const;
export type MemberLibraryItemType = (typeof MEMBER_LIBRARY_TYPES)[number];

export type MemberLibraryItemDto = {
  id: string;
  type: MemberLibraryItemType;
  title: string;
  body: string | null;
  url: string | null;
  fileMime: string | null;
  fileBytes: number | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function parseLibraryType(raw: string): MemberLibraryItemType | null {
  if (raw === "link" || raw === "note" || raw === "file") return raw;
  return null;
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function serializeTags(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12)
    .join(", ");
}

export function mapMemberLibraryItem(row: MemberLibraryItem): MemberLibraryItemDto {
  return {
    id: row.id,
    type: parseLibraryType(row.type) ?? "note",
    title: row.title,
    body: row.body?.trim() || null,
    url: row.url?.trim() || null,
    fileMime: row.fileMime,
    fileBytes: row.fileBytes,
    tags: parseTags(row.tags),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
