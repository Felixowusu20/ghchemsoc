import type { MembershipPaymentMethod } from "@prisma/client";

/** Methods offered at checkout (new applications). */
export const MEMBERSHIP_PAYMENT_METHOD_VALUES = [
  "mobile_money_mtn",
  "bank_transfer",
] as const satisfies readonly MembershipPaymentMethod[];

export type MembershipPaymentMethodId = (typeof MEMBERSHIP_PAYMENT_METHOD_VALUES)[number];

export const PAYMENT_METHOD_GROUPS: {
  id: string;
  title: string;
  subtitle: string;
  methods: { id: MembershipPaymentMethodId; label: string; detail?: string }[];
}[] = [
  {
    id: "mobile_money",
    title: "Mobile Money",
    subtitle: "MTN MoMo",
    methods: [{ id: "mobile_money_mtn", label: "MTN MoMo", detail: "Dial *170#" }],
  },
  {
    id: "bank",
    title: "Bank transfer",
    subtitle: "Paystack · transfer from your bank or MoMo wallet",
    methods: [{ id: "bank_transfer", label: "Bank transfer", detail: "Auto-verified" }],
  },
];

/** Labels for all stored enum values (including legacy methods). */
const LABELS: Record<MembershipPaymentMethod, string> = {
  mobile_money_mtn: "MTN Mobile Money",
  mobile_money_telecel: "Telecel Cash",
  mobile_money_airteltigo: "AirtelTigo Money",
  bank_transfer: "Bank transfer",
  debit_credit_card: "Debit / credit card",
  ussd: "USSD",
};

export function membershipPaymentMethodLabel(
  method: MembershipPaymentMethod | MembershipPaymentMethodId | null | undefined
): string {
  if (!method) return "—";
  return LABELS[method as MembershipPaymentMethod] ?? method;
}

export function isMobileMoneyMethod(method: MembershipPaymentMethodId): boolean {
  return method === "mobile_money_mtn";
}

export function requiresPayerPhone(method: MembershipPaymentMethodId): boolean {
  return isMobileMoneyMethod(method);
}

export function requiresPaymentNote(_method: MembershipPaymentMethodId): boolean {
  return false;
}

/** All membership payment methods use Paystack checkout (including bank transfer). */
export function usesPaystack(_method: MembershipPaymentMethodId): boolean {
  return true;
}

export function paystackChannels(method: MembershipPaymentMethodId): string[] {
  if (method === "bank_transfer") return ["bank_transfer"];
  if (method === "mobile_money_mtn") return ["mobile_money"];
  return ["mobile_money", "bank_transfer"];
}

export function normalizeGhanaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) return null;
  if (digits.startsWith("233") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  if (digits.length === 9) return `233${digits}`;
  if (digits.length >= 10 && digits.length <= 12) return digits;
  return null;
}

export function formatGhanaPhoneDisplay(normalized: string): string {
  if (normalized.startsWith("233") && normalized.length >= 12) {
    return `0${normalized.slice(3)}`;
  }
  return normalized;
}

export function ussdHintForMethod(method: MembershipPaymentMethodId): string {
  if (method === "mobile_money_mtn") {
    return "Use the MTN MoMo number registered to your wallet. You will authorize payment in the Paystack window.";
  }
  return "Follow the prompts in the Paystack window to complete payment.";
}
