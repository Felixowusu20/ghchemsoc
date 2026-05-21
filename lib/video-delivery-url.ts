/**
 * Cloudinary video URL helpers — no Node/cloudinary SDK (safe for client bundles).
 */

const VIDEO_DELIVERY_TRANSFORM = "q_auto:good,f_auto,vc_auto,sp_hd";
const VIDEO_POSTER_TRANSFORM = "so_0,w_1280,c_limit,q_auto:good";

export function getCloudinaryCloudName(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    ""
  );
}

export function buildCloudinaryVideoDeliveryUrl(publicId: string, cloudName: string): string {
  const id = publicId.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${cloudName}/video/upload/${VIDEO_DELIVERY_TRANSFORM}/${id}`;
}

export function buildCloudinaryVideoPosterUrl(publicId: string, cloudName: string): string {
  const id = publicId.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${cloudName}/video/upload/${VIDEO_POSTER_TRANSFORM}/${id}.jpg`;
}

export function optimizedCloudinaryVideoUrl(publicId: string, cloudName?: string): string {
  const cloud = cloudName ?? getCloudinaryCloudName();
  if (!cloud || !publicId.trim()) return "";
  return buildCloudinaryVideoDeliveryUrl(publicId, cloud);
}

export function cloudinaryVideoPosterUrl(publicId: string, cloudName?: string): string {
  const cloud = cloudName ?? getCloudinaryCloudName();
  if (!cloud || !publicId.trim()) return "";
  return buildCloudinaryVideoPosterUrl(publicId, cloud);
}

/** Inject delivery optimizations into an existing Cloudinary video URL. */
export function optimizeVideoDeliveryUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!trimmed.includes("res.cloudinary.com") || !trimmed.includes("/video/upload/")) {
    return trimmed;
  }
  if (/q_auto|f_auto|vc_auto|sp_hd|streaming_profile/.test(trimmed)) {
    return trimmed;
  }
  return trimmed.replace("/video/upload/", `/video/upload/${VIDEO_DELIVERY_TRANSFORM}/`);
}
