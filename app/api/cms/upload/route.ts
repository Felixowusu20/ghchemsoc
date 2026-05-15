import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import {
  CLOUDINARY_SETUP_HINT,
  deleteCloudinaryAsset,
  getCloudinaryEnv,
  uploadBufferToCloudinary,
} from "@/lib/cloudinary-server";

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

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type;
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  try {
    const { secure_url, public_id } = await uploadBufferToCloudinary(buf, folder);
    return NextResponse.json({ url: secure_url, publicId: public_id });
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
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });
  if (!getCloudinaryEnv()) {
    return NextResponse.json({ error: "Cloudinary is not configured", hint: CLOUDINARY_SETUP_HINT }, { status: 503 });
  }
  try {
    await deleteCloudinaryAsset(publicId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
