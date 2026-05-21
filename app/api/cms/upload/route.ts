import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { CMS_VIDEO_MAX_BYTES, CMS_VIDEO_MAX_LABEL } from "@/lib/video-upload-limits";
import type { CloudinaryResourceType } from "@/lib/cloudinary-server";
import {
  CLOUDINARY_SETUP_HINT,
  deleteCloudinaryAsset,
  getCloudinaryEnv,
  uploadBufferToCloudinary,
  uploadCmsVideo,
} from "@/lib/cloudinary-server";

/** Whether Cloudinary credentials are set (uploads only — existing image URLs in the DB still work). */
export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const configured = Boolean(getCloudinaryEnv());
  return NextResponse.json({
    configured,
    hint: configured ? undefined : CLOUDINARY_SETUP_HINT,
    assetTypes: ["image", "video", "document"] as const,
    videoMaxBytes: CMS_VIDEO_MAX_BYTES,
    videoMaxLabel: CMS_VIDEO_MAX_LABEL,
  });
}

export async function POST(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  if (!getCloudinaryEnv()) {
    return NextResponse.json(
      {
        error: "Cloudinary is not configured",
        hint: CLOUDINARY_SETUP_HINT,
      },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string) || "misc";
  const assetType = String(form.get("assetType") ?? "image").toLowerCase();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

  if (assetType === "video") {
    if (!mime.startsWith("video/")) {
      return NextResponse.json({ error: "Please choose a video file (MP4, WebM, etc.)." }, { status: 400 });
    }
    if (file.size > CMS_VIDEO_MAX_BYTES) {
      return NextResponse.json({ error: `Video must be under ${CMS_VIDEO_MAX_LABEL}.` }, { status: 400 });
    }
  } else if (assetType === "document") {
    const ok =
      mime === "application/pdf" ||
      mime.includes("presentation") ||
      mime.includes("document") ||
      mime === "application/zip" ||
      mime.startsWith("text/");
    if (!ok) {
      return NextResponse.json({ error: "Upload a PDF, Office document, or ZIP archive." }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Document must be under 50 MB." }, { status: 400 });
    }
  } else if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  try {
    const upload =
      assetType === "video"
        ? await uploadCmsVideo(buf, folder, file.name)
        : assetType === "document"
          ? await uploadBufferToCloudinary(buf, folder, undefined, "raw")
          : await uploadBufferToCloudinary(buf, folder);
    const { secure_url, public_id, resource_type } = upload;
    return NextResponse.json({ url: secure_url, publicId: public_id, resourceType: resource_type });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[cms/upload]", message);
    if (message === "CLOUDINARY_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Cloudinary is not configured", hint: CLOUDINARY_SETUP_HINT }, { status: 503 });
    }
    return NextResponse.json(
      {
        error: "Cloudinary upload failed",
        hint:
          message.includes("401") || message.toLowerCase().includes("invalid")
            ? "Check API key and API secret in .env.local. If you rotated keys, update the values and restart `next dev`."
            : CLOUDINARY_SETUP_HINT,
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId");
  const resourceType = (searchParams.get("resourceType") ?? "image") as CloudinaryResourceType;
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });
  if (!getCloudinaryEnv()) {
    return NextResponse.json({ error: "Cloudinary is not configured", hint: CLOUDINARY_SETUP_HINT }, { status: 503 });
  }
  try {
    await deleteCloudinaryAsset(publicId, resourceType);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
