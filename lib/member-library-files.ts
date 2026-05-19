import {
  deleteCloudinaryAsset,
  getCloudinaryEnv,
  uploadMemberLibraryFile,
} from "@/lib/cloudinary-server";

export const MEMBER_LIBRARY_FILE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp)$/i;

export function validateMemberLibraryFile(file: File): string | null {
  if (!file.size) return "Choose a file to upload.";
  if (file.size > MEMBER_LIBRARY_FILE_MAX_BYTES) {
    return "File must be under 10 MB.";
  }
  const mimeOk = ALLOWED_MIMES.has(file.type);
  const nameOk = ALLOWED_EXT.test(file.name);
  if (!mimeOk && !nameOk) {
    return "Use a PDF, JPEG, PNG, or WebP file.";
  }
  return null;
}

export async function uploadMemberLibraryFileFromForm(file: File) {
  const err = validateMemberLibraryFile(file);
  if (err) throw new Error(err);

  if (!getCloudinaryEnv()) {
    throw new Error(
      "File hosting is not configured. Add Cloudinary credentials to upload files, or save links and notes instead."
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime =
    file.type ||
    (file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : file.name.toLowerCase().endsWith(".png")
        ? "image/png"
        : "application/octet-stream");

  const { secure_url, public_id, resource_type } = await uploadMemberLibraryFile(buffer, mime);
  return {
    url: secure_url,
    filePublicId: public_id,
    fileMime: mime,
    fileBytes: buffer.length,
    resourceType: resource_type as "image" | "raw",
  };
}

export async function deleteMemberLibraryCloudinaryFile(
  publicId: string,
  mime: string | null | undefined
) {
  if (!publicId || !getCloudinaryEnv()) return;
  const resourceType = mime?.startsWith("image/") ? "image" : "raw";
  await deleteCloudinaryAsset(publicId, resourceType);
}
