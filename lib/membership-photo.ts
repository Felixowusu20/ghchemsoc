import { getCloudinaryEnv, uploadBufferToCloudinary } from "@/lib/cloudinary-server";
import {
    MEMBERSHIP_PHOTO_LOCAL_MAX_BYTES,
    validateMembershipPhotoFile,
} from "@/lib/membership-photo-shared";

export type MembershipPhotoUploadResult = {
    photoUrl?: string;
    photoPublicId?: string;
    avatarDataUrl?: string;
};

export async function processMembershipPhotoFile(file: File): Promise<MembershipPhotoUploadResult> {
    const err = validateMembershipPhotoFile(file);
    if (err) throw new Error(err);

    const buffer = Buffer.from(await file.arrayBuffer());

    if (getCloudinaryEnv()) {
        const { secure_url, public_id } = await uploadBufferToCloudinary(buffer, "membership");
        return { photoUrl: secure_url, photoPublicId: public_id };
    }

    if (buffer.length > MEMBERSHIP_PHOTO_LOCAL_MAX_BYTES) {
        throw new Error(
            "Photo is too large to store without cloud upload. Use a smaller image or ask the secretariat to enable photo hosting."
        );
    }

    const base64 = buffer.toString("base64");
    return { avatarDataUrl: `data:${file.type};base64,${base64}` };
}
