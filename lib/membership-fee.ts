/** Client-safe membership fee helpers (no Node crypto imports). */

export const MEMBERSHIP_FEE_GHS = 250;

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function yearRangeOptions(countBack = 6): number[] {
  const y = new Date().getUTCFullYear();
  return Array.from({ length: countBack }, (_, i) => y - i);
}
