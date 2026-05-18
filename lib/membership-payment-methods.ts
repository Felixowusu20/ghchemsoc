import type { MembershipPaymentMethod } from "@prisma/client";

export const MEMBERSHIP_PAYMENT_METHOD_VALUES = [
  "mobile_money_mtn",
  "mobile_money_telecel",
  "mobile_money_airteltigo",
  "bank_transfer",
  "debit_credit_card",
  "ussd",
] as const satisfies readonly MembershipPaymentMethod[];

export type MembershipPaymentMethodId = (typeof MEMBERSHIP_PAYMENT_METHOD_VALUES)[number];

export const GCS_MEMBERSHIP_BANK_DETAILS = {
  bankName: "Ghana Commercial Bank",
  accountName: "Ghana Chemical Society",
  accountNumber: "1234567890123",
  branch: "Accra Main",
  swift: "GHCBGHAC",
} as const;

export const PAYMENT_METHOD_GROUPS: {
  id: string;
  title: string;
  subtitle: string;
  methods: { id: MembershipPaymentMethodId; label: string; detail?: string }[];
}[] = [
  {
    id: "mobile_money",
    title: "Mobile Money",
    subtitle: "MTN, Telecel, AirtelTigo",
    methods: [
      { id: "mobile_money_mtn", label: "MTN MoMo", detail: "Dial *170#" },
      { id: "mobile_money_telecel", label: "Telecel Cash", detail: "Telecel network" },
      { id: "mobile_money_airteltigo", label: "AirtelTigo Money", detail: "AirtelTigo network" },
    ],
  },
  {
    id: "bank",
    title: "Bank transfer",
    subtitle: "Local bank account",
    methods: [{ id: "bank_transfer", label: "Bank transfer" }],
  },
  {
    id: "card",
    title: "Debit / credit card",
    subtitle: "Visa, Mastercard",
    methods: [{ id: "debit_credit_card", label: "Card payment" }],
  },
  {
    id: "ussd",
    title: "USSD",
    subtitle: "Where supported by your network",
    methods: [{ id: "ussd", label: "USSD payment" }],
  },
];

const LABELS: Record<MembershipPaymentMethodId, string> = {
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
  return LABELS[method as MembershipPaymentMethodId] ?? method;
}

export function isMobileMoneyMethod(method: MembershipPaymentMethodId): boolean {
  return (
    method === "mobile_money_mtn" ||
    method === "mobile_money_telecel" ||
    method === "mobile_money_airteltigo"
  );
}

export function requiresPayerPhone(method: MembershipPaymentMethodId): boolean {
  return isMobileMoneyMethod(method) || method === "ussd";
}

export function requiresPaymentNote(method: MembershipPaymentMethodId): boolean {
  return method === "bank_transfer";
}

/** Bank transfers are recorded manually; all other methods use Paystack checkout. */
export function usesPaystack(method: MembershipPaymentMethodId): boolean {
  return method !== "bank_transfer";
}

export function paystackChannels(method: MembershipPaymentMethodId): string[] {
  if (isMobileMoneyMethod(method)) return ["mobile_money"];
  if (method === "debit_credit_card") return ["card"];
  if (method === "ussd") return ["ussd"];
  return ["card", "mobile_money", "ussd"];
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
  switch (method) {
    case "mobile_money_mtn":
    case "ussd":
      return "Example: dial *170# and follow prompts to pay merchants.";
    case "mobile_money_telecel":
      return "Use Telecel Cash USSD or app to complete payment.";
    case "mobile_money_airteltigo":
      return "Use AirtelTigo Money USSD or app to complete payment.";
    default:
      return "Follow your network's USSD menu to authorize payment.";
  }
}
