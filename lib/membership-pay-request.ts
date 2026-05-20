import { z } from "zod";
import {
  MEMBERSHIP_PAYMENT_METHOD_VALUES,
  normalizeGhanaPhone,
  requiresPayerPhone,
} from "@/lib/membership-payment-methods";

export const membershipPayBodySchema = z
  .object({
    paymentMethod: z.enum(MEMBERSHIP_PAYMENT_METHOD_VALUES),
    payerPhone: z.string().max(24).optional(),
    paymentNote: z.string().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (requiresPayerPhone(data.paymentMethod)) {
      if (!data.payerPhone || !normalizeGhanaPhone(data.payerPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid Ghana phone number for this payment method.",
          path: ["payerPhone"],
        });
      }
    }
  });

export function payerPhoneForStorage(raw: string | undefined): string | null {
  const phoneNorm = raw ? normalizeGhanaPhone(raw) : null;
  return phoneNorm ? `0${phoneNorm.slice(3)}` : null;
}
