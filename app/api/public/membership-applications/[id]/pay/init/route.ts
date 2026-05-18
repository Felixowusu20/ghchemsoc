import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import { membershipPayBodySchema, payerPhoneForStorage } from "@/lib/membership-pay-request";
import { paystackChannels, usesPaystack } from "@/lib/membership-payment-methods";
import { prismaSaveErrorMessage } from "@/lib/prisma-errors";
import {
  generatePaystackReference,
  initializePaystackTransaction,
  isPaystackConfigured,
  paystackPublicKey,
} from "@/lib/paystack";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isPaystackConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Paystack is not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY.",
      },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = membershipPayBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid payment details.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const { paymentMethod, paymentNote } = parsed.data;
  if (!usesPaystack(paymentMethod)) {
    return NextResponse.json(
      { ok: false, error: "Use the bank transfer flow for this payment method." },
      { status: 400 }
    );
  }

  const payerPhoneStored = payerPhoneForStorage(parsed.data.payerPhone);

  try {
    const existing = await prisma.membershipApplication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
    }

    if (existing.status === "approved") {
      return NextResponse.json({ ok: false, error: "This application is already approved." }, { status: 400 });
    }

    if (existing.status === "rejected") {
      return NextResponse.json({ ok: false, error: "This application was rejected." }, { status: 400 });
    }

    const reference = generatePaystackReference(id);
    const base = appBaseUrl(request);
    const callbackUrl = `${base}/membership/pending?applicationId=${encodeURIComponent(id)}`;

    await initializePaystackTransaction({
      email: existing.email,
      amountGhs: existing.amountGhs,
      reference,
      callbackUrl,
      paymentMethod,
      applicationId: id,
      payerPhone: payerPhoneStored,
    });

    await prisma.membershipApplication.update({
      where: { id },
      data: {
        paymentMethod,
        paystackReference: reference,
        payerPhone: payerPhoneStored,
        paymentNote: paymentNote?.trim() || null,
      },
    });

    const publicKey = paystackPublicKey()!;

    return NextResponse.json({
      ok: true,
      reference,
      publicKey,
      email: existing.email,
      amountPesewas: Math.round(existing.amountGhs * 100),
      currency: "GHS",
      channels: paystackChannels(paymentMethod),
      paymentMethod,
    });
  } catch (e) {
    console.error("[membership-pay-init]", e);
    const message =
      e instanceof Error && e.message.includes("Paystack")
        ? e.message
        : prismaSaveErrorMessage(e, "start Paystack checkout");
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
