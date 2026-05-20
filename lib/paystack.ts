import { createHmac, randomBytes } from "crypto";
import type { MembershipPaymentMethod } from "@prisma/client";
import { paystackChannels, type MembershipPaymentMethodId } from "@/lib/membership-payment-methods";

const PAYSTACK_BASE = "https://api.paystack.co";

function readEnvKey(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

/** `test` when keys use sk_test_/pk_test_; `live` for production keys. */
export function paystackMode(): "test" | "live" | null {
  const secret = paystackSecretKey();
  if (!secret) return null;
  if (secret.startsWith("sk_test_")) return "test";
  if (secret.startsWith("sk_live_")) return "live";
  return null;
}

export function paystackPublicKey(): string | null {
  return readEnvKey("PAYSTACK_PUBLIC_KEY", "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY");
}

export function paystackSecretKey(): string | null {
  return readEnvKey("PAYSTACK_SECRET_KEY");
}

export function isPaystackConfigured(): boolean {
  const publicKey = paystackPublicKey();
  const secretKey = paystackSecretKey();
  if (!publicKey || !secretKey) return false;
  const pubTest = publicKey.startsWith("pk_test_");
  const pubLive = publicKey.startsWith("pk_live_");
  const secTest = secretKey.startsWith("sk_test_");
  const secLive = secretKey.startsWith("sk_live_");
  if ((pubTest && secLive) || (pubLive && secTest)) {
    console.warn("[paystack] Public and secret keys are from different environments (test vs live).");
  }
  return true;
}

export function paystackConfigError(): string | null {
  if (!paystackSecretKey()) {
    return "Add PAYSTACK_SECRET_KEY to your environment (.env.local).";
  }
  if (!paystackPublicKey()) {
    return "Add PAYSTACK_PUBLIC_KEY (or NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) to your environment (.env.local).";
  }
  return null;
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

/** Paystack “Pay with Transfer” — one-time virtual account (Ghana). */
export type PaystackBankTransferChargeData = {
  reference: string;
  status: string;
  display_text?: string;
  account_name: string;
  account_number: string;
  account_expires_at: string;
  bank?: { name?: string; slug?: string };
};

function bankTransferAccountExpiresAt(): string {
  return new Date(Date.now() + 25 * 60 * 1000).toISOString();
}

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

/** Ghana bank transfer: Paystack issues a temporary account; webhook/verify confirms payment. */
export async function createPaystackBankTransferCharge(input: {
  email: string;
  amountGhs: number;
  reference: string;
  applicationId: string;
  paymentMethod: MembershipPaymentMethodId;
}): Promise<PaystackBankTransferChargeData> {
  const amountPesewas = Math.round(input.amountGhs * 100);
  if (amountPesewas < 100) {
    throw new Error("Payment amount is too small.");
  }

  const body = await paystackFetch<PaystackBankTransferChargeData>("/charge", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: amountPesewas,
      currency: "GHS",
      reference: input.reference,
      bank_transfer: {
        account_expires_at: bankTransferAccountExpiresAt(),
      },
      metadata: {
        applicationId: input.applicationId,
        paymentMethod: input.paymentMethod,
      },
    }),
  });

  const data = body.data;
  if (!data.account_number) {
    throw new Error(
      data.display_text ||
        "Paystack could not create a transfer account. In Paystack Dashboard → Settings → Preferences, enable Bank Transfer (Pay with Transfer) for Ghana."
    );
  }

  return data;
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

/** Bank transfer still waiting for funds (Paystack status: ongoing, pending, etc.). */
export function isPaystackTransactionPending(data: PaystackVerifyData): boolean {
  const pending = new Set(["ongoing", "pending", "processing", "pending_bank_transfer", "open"]);
  return pending.has(data.status);
}

export function paystackVerifyPendingMessage(data: PaystackVerifyData): string {
  if (data.channel === "bank_transfer" || isPaystackTransactionPending(data)) {
    return "Transfer not received yet. Pay the exact amount to the Paystack account shown, then check again.";
  }
  return "Payment was not completed. Try again or use another method.";
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
