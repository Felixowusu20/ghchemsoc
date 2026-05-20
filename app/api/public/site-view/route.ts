import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordSitePageView } from "@/lib/site-page-views";

const bodySchema = z.object({
  path: z.string().min(1).max(512),
  visitorKey: z.string().max(64).optional(),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await recordSitePageView(parsed.data.path, parsed.data.visitorKey);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
