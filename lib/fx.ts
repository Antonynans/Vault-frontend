export const FX_RATES_TO_NGN: Record<string, number> = {
  NGN: 1,
  USD: 1580,
  GBP: 2050,
  EUR: 1740,
};

export function toNGN(amount: number, currency: string): number {
  const rate = FX_RATES_TO_NGN[currency] ?? 1;
  return amount * rate;
}

export const FX_LAST_UPDATED = "Apr 2026";