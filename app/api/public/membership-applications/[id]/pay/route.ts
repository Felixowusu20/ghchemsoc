import { NextRequest, NextResponse } from "next/server";

/** Legacy endpoint — bank transfer and all methods use POST .../pay/init and .../pay/verify. */
export async function POST(
  _request: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Use Paystack checkout: choose your payment method and complete payment in the secure window.",
    },
    { status: 400 }
  );
}
