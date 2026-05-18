import { createHmac, randomBytes } from "crypto";
import type { MembershipPaymentMethod } from "@prisma/client";
import { paystackChannels, type MembershipPaymentMethodId } from "@/lib/membership-payment-methods";

const PAYSTACK_BASE = "https://api.paystack.co";

export function paystackPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function paystackSecretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isPaystackConfigured(): boolean {
  return Boolean(paystackPublicKey() && paystackSecretKey());
}

export function generatePaystackReference(applicationId: string): string {
  const tail = applicationId.replace(/[^a-zA-Z0-9]/g, "").slice(-10);
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `GCS-MEM-${tail}-${stamp}-${rand}`.slice(0, 100);
}

type PaystackApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  channel: string | null;
  metadata?: {
    applicationId?: string;
    paymentMethod?: string;
  } | null;
};

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<PaystackApiResponse<T>> {
  const secret = paystackSecretKey();
  if (!secret) {
    throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment.");
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => null)) as PaystackApiResponse<T> | null;
  if (!body) {
    throw new Error("Invalid response from Paystack.");
  }
  if (!res.ok || !body.status) {
    throw new Error(body.message || "Paystack request failed.");
  }
  return body;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  paymentMethod: MembershipPaymentMethodId;
  applicationId: string;
  payerPhone?: string | null;
}): Promise<PaystackInitializeData> {
  const amountPesewas = Math.round(input.amountGhs * 100);
  if (amountPesewas < 100) {
    throw new Error("Payment amount is too small.");
  }

  const body = await paystackFetch<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: paystackChannels(input.paymentMethod),
      metadata: {
        applicationId: input.applicationId,
        paymentMethod: input.paymentMethod,
        ...(input.payerPhone ? { payerPhone: input.payerPhone } : {}),
      },
    }),
  });

  return body.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyData> {
  const body = await paystackFetch<PaystackVerifyData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
  return body.data;
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = paystackSecretKey();
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

export function isPaystackChargeSuccessful(data: PaystackVerifyData): boolean {
  return data.status === "success";
}

export function paymentMethodFromPaystackMetadata(
  value: unknown
): MembershipPaymentMethod | null {
  if (typeof value !== "string") return null;
  const allowed = new Set([
    "mobile_money_mtn",
    "mobile_money_telecel",
    "mobile_money_airteltigo",
    "bank_transfer",
    "debit_credit_card",
    "ussd",
  ]);
  return allowed.has(value) ? (value as MembershipPaymentMethod) : null;
}
