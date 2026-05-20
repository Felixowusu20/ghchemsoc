import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordMembershipPayment } from "@/lib/membership-payment-record";
import {
  isPaystackChargeSuccessful,
  paymentMethodFromPaystackMetadata,
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature,
} from "@/lib/paystack";

type WebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    metadata?: {
      applicationId?: string;
      paymentMethod?: string;
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event === "bank.transfer.rejected") {
    console.warn("[paystack-webhook] Bank transfer rejected", payload.data?.reference);
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = payload.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const verified = await verifyPaystackTransaction(reference);
    if (!isPaystackChargeSuccessful(verified)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const applicationId =
      payload.data?.metadata?.applicationId ??
      (typeof verified.metadata === "object" &&
      verified.metadata &&
      "applicationId" in verified.metadata &&
      typeof verified.metadata.applicationId === "string"
        ? verified.metadata.applicationId
        : null);

    if (!applicationId) {
      console.warn("[paystack-webhook] No applicationId for reference", reference);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const existing = await prisma.membershipApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paymentMethod =
      existing.paymentMethod ??
      paymentMethodFromPaystackMetadata(
        payload.data?.metadata?.paymentMethod ??
          (typeof verified.metadata === "object" &&
          verified.metadata &&
          "paymentMethod" in verified.metadata
            ? verified.metadata.paymentMethod
            : null)
      );

    if (!paymentMethod) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await recordMembershipPayment({
      applicationId,
      paymentMethod,
      paystackReference: reference,
      payerPhone: existing.payerPhone,
      paymentNote: existing.paymentNote,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[paystack-webhook]", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
