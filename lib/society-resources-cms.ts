import type { Media, SocietyResource, SocietyResourceKind } from "@prisma/client";
import { cloudinaryAssetTypeForResource } from "@/lib/society-resources";
import { deleteCloudinaryAsset, type CloudinaryResourceType } from "@/lib/cloudinary-server";

export type SocietyResourceRow = SocietyResource & { media: Media | null };

export function serializeSocietyResource(r: SocietyResourceRow) {
  return {
    id: r.id,
    published: r.published,
    sortOrder: r.sortOrder,
    kind: r.kind,
    title: r.title,
    description: r.description,
    url: r.url ?? "",
    urlPublicId: r.urlPublicId ?? null,
    publishedAt: r.publishedAt?.toISOString() ?? "",
    imageUrl: r.media?.url ?? "",
    imagePublicId: r.media?.publicId ?? null,
    imageAlt: r.media?.alt ?? "",
  };
}

export async function deleteResourceUrlAsset(
  kind: SocietyResourceKind,
  urlPublicId: string | null | undefined,
  url: string | null | undefined
) {
  if (!urlPublicId) return;
  const resourceType = cloudinaryAssetTypeForResource(kind, url) as CloudinaryResourceType;
  try {
    await deleteCloudinaryAsset(urlPublicId, resourceType);
  } catch {
    /* ignore */
  }
}

export type SocietyResourceCmsDto = ReturnType<typeof serializeSocietyResource>;

export function parseResourceKind(value: string): SocietyResourceKind | null {
  if (value === "video" || value === "document" || value === "link" || value === "other") {
    return value;
  }
  return null;
}
