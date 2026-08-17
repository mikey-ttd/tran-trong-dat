import { getBalance } from "../data/balances";

export const amountFormatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 6,
});

const usdValueFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatUsdValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 0.01) return "<$0.01";

  return usdValueFormatter.format(value);
}

const AMOUNT_INPUT_PATTERN = /^\d*\.?\d{0,8}$/;

export function sanitizeAmountInput(rawValue: string) {
  const withoutCommas = rawValue.replace(/,/g, "");

  return AMOUNT_INPUT_PATTERN.test(withoutCommas) ? withoutCommas : null;
}

export function parseAmount(value: string) {
  const normalizedValue = value.trim().replace(/,/g, "");

  if (!normalizedValue) return 0;

  return Number(normalizedValue);
}

export function formatAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return "";

  return amountFormatter.format(value);
}

export function formatBalance(balances: Record<string, number>, currency: string) {
  return amountFormatter.format(getBalance(balances, currency)) + " " + currency;
}

export function floorForInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;

  const factor = 1e8;

  return Math.floor(value * factor) / factor;
}
