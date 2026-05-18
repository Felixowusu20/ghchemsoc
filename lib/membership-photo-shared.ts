export const MEMBERSHIP_PHOTO_MAX_BYTES = 2_000_000;
export const MEMBERSHIP_PHOTO_LOCAL_MAX_BYTES = 480_000;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateMembershipPhotoFile(file: File): string | null {
    if (!file.size) return null;
    if (!ALLOWED_TYPES.has(file.type)) {
        return "Use a JPEG, PNG, or WebP photo.";
    }
    if (file.size > MEMBERSHIP_PHOTO_MAX_BYTES) {
        return "Photo must be under 2 MB.";
    }
    return null;
}
