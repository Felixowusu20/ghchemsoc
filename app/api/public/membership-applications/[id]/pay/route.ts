import { NextRequest, NextResponse } from "next/server";
import { recordMembershipPayment } from "@/lib/membership-payment-record";
import { membershipPayBodySchema, payerPhoneForStorage } from "@/lib/membership-pay-request";
import { usesPaystack } from "@/lib/membership-payment-methods";
import { prismaSaveErrorMessage } from "@/lib/prisma-errors";
import { generatePaystackReference } from "@/lib/paystack";

/** Manual bank-transfer submission (no Paystack). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  if (usesPaystack(paymentMethod)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Use Paystack checkout for this payment method.",
      },
      { status: 400 }
    );
  }

  const payerPhoneStored = payerPhoneForStorage(parsed.data.payerPhone);
  const reference = generatePaystackReference(id);

  try {
    const result = await recordMembershipPayment({
      applicationId: id,
      paymentMethod,
      paystackReference: reference,
      payerPhone: payerPhoneStored,
      paymentNote: paymentNote?.trim() || null,
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
    console.error("[membership-pay-bank]", e);
    return NextResponse.json(
      { ok: false, error: prismaSaveErrorMessage(e, "record your payment") },
      { status: 500 }
    );
  }
}
