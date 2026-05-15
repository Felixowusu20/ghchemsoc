import { NextResponse } from "next/server";
import { getJoinPageForPublic } from "@/lib/cms-queries";

export async function GET() {
  const { header, steps } = await getJoinPageForPublic();
  return NextResponse.json({
    header: header
      ? {
          eyebrow: header.eyebrow,
          title: header.title,
          subtitle: header.subtitle,
          imageUrl: header.media?.url ?? null,
          imageAlt: header.media?.alt ?? null,
        }
      : null,
    steps: steps.map((s) => ({
      id: s.id,
      stepKey: s.stepKey,
      title: s.title,
      description: s.description,
    })),
  });
}
