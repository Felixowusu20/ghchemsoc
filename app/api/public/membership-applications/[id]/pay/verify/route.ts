import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordMembershipPayment } from "@/lib/membership-payment-record";
import { prismaSaveErrorMessage } from "@/lib/prisma-errors";
import {
  isPaystackChargeSuccessful,
  isPaystackConfigured,
  paymentMethodFromPaystackMetadata,
  verifyPaystackTransaction,
} from "@/lib/paystack";

const bodySchema = z.object({
  reference: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isPaystackConfigured()) {
    return NextResponse.json({ ok: false, error: "Paystack is not configured." }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payment reference is required." }, { status: 400 });
  }

  const { reference } = parsed.data;

  try {
    const existing = await prisma.membershipApplication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
    }

    if (existing.paystackReference && existing.paystackReference !== reference) {
      return NextResponse.json(
        { ok: false, error: "This payment reference does not match your application." },
        { status: 400 }
      );
    }

    const verified = await verifyPaystackTransaction(reference);
    if (!isPaystackChargeSuccessful(verified)) {
      return NextResponse.json(
        { ok: false, error: "Payment was not completed. Try again or use another method." },
        { status: 402 }
      );
    }

    const metaAppId =
      typeof verified.metadata === "object" &&
      verified.metadata &&
      "applicationId" in verified.metadata &&
      typeof verified.metadata.applicationId === "string"
        ? verified.metadata.applicationId
        : null;

    if (metaAppId && metaAppId !== id) {
      return NextResponse.json({ ok: false, error: "Payment does not match this application." }, { status: 400 });
    }

    const paymentMethod =
      existing.paymentMethod ??
      paymentMethodFromPaystackMetadata(
        typeof verified.metadata === "object" &&
          verified.metadata &&
          "paymentMethod" in verified.metadata
          ? verified.metadata.paymentMethod
          : null
      );

    if (!paymentMethod) {
      return NextResponse.json(
        { ok: false, error: "Could not determine payment method for this transaction." },
        { status: 400 }
      );
    }

    const result = await recordMembershipPayment({
      applicationId: id,
      paymentMethod,
      paystackReference: reference,
      payerPhone: existing.payerPhone,
      paymentNote: existing.paymentNote,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      applicationId: result.applicationId,
      paystackReference: result.paystackReference,
      paymentMethod: result.paymentMethod,
      message: result.message,
    });
  } catch (e) {
    console.error("[membership-pay-verify]", e);
    const message =
      e instanceof Error && e.message.includes("Paystack")
        ? e.message
        : prismaSaveErrorMessage(e, "verify your payment");
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
