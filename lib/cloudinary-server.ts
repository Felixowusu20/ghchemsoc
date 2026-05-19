import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

export { cloudinary };

/** Parsed from `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` */
function parseCloudinaryUrl(raw: string): { cloud_name: string; api_key: string; api_secret: string } | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("cloudinary://")) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "cloudinary:") return null;
    const api_key = u.username;
    const api_secret = u.password ? decodeURIComponent(u.password) : "";
    const cloud_name = u.hostname;
    if (!api_key || !api_secret || !cloud_name) return null;
    return { cloud_name, api_key, api_secret };
  } catch {
    return null;
  }
}

export type CloudinaryEnv = { cloud_name: string; api_key: string; api_secret: string };

/**
 * Resolves credentials from env at request time (not only at module load),
 * and supports either `CLOUDINARY_URL` or the three separate variables.
 */
export function getCloudinaryEnv(): CloudinaryEnv | null {
  const fromUrl = process.env.CLOUDINARY_URL ? parseCloudinaryUrl(process.env.CLOUDINARY_URL) : null;

  const cloud_name =
    fromUrl?.cloud_name ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "";

  const api_key =
    fromUrl?.api_key || process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";

  const api_secret = fromUrl?.api_secret || process.env.CLOUDINARY_API_SECRET || "";

  if (!cloud_name || !api_key || !api_secret) {
    return null;
  }

  return { cloud_name, api_key, api_secret };
}

export function configureCloudinaryFromEnv(): boolean {
  const env = getCloudinaryEnv();
  if (!env) return false;
  cloudinary.config({ ...env, secure: true });
  return true;
}

export const CLOUDINARY_SETUP_HINT =
  "Set CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) in .env.local, or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET. Copy values from Cloudinary Console → API Keys.";

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string,
  resourceType: "image" | "raw" = "image"
): Promise<{ secure_url: string; public_id: string; resource_type: "image" | "raw" }> {
  if (!configureCloudinaryFromEnv()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "") || "misc";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `gcs-cms/${safeFolder}`,
        ...(publicId ? { public_id: publicId } : {}),
        resource_type: resourceType,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("Cloudinary upload failed"));
        else
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: resourceType,
          });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/** Member library: images as image, PDFs and other docs as raw. */
export async function uploadMemberLibraryFile(buffer: Buffer, mime: string) {
  const resourceType: "image" | "raw" = mime.startsWith("image/") ? "image" : "raw";
  return uploadBufferToCloudinary(buffer, "member-library", undefined, resourceType);
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "raw" = "image") {
  if (!configureCloudinaryFromEnv()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
