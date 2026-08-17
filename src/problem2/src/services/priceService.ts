import { PRICE_REQUEST_TIMEOUT_MS, PRICE_URL } from "../config/constants";
import type { PriceRecord, Token } from "../types";

export function normalizePrices(priceRows: PriceRecord[]): Token[] {
  const latestByCurrency = new Map<string, PriceRecord>();

  priceRows.forEach((row) => {
    if (!row.currency || !Number.isFinite(row.price) || row.price <= 0) return;

    const current = latestByCurrency.get(row.currency);
    const currentTime = current ? new Date(current.date).getTime() : 0;
    const nextTime = new Date(row.date).getTime();

    if (!current || nextTime >= currentTime) {
      latestByCurrency.set(row.currency, row);
    }
  });

  return Array.from(latestByCurrency.values())
    .map((row) => ({
      currency: row.currency,
      price: row.price,
      date: row.date,
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

export async function fetchTokenPrices(signal: AbortSignal) {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort();
  }, PRICE_REQUEST_TIMEOUT_MS);

  const abortHandler = () => {
    timeoutController.abort();
  };

  signal.addEventListener("abort", abortHandler);

  try {
    const response = await fetch(PRICE_URL, { signal: timeoutController.signal });

    if (!response.ok) {
      throw new Error("Price request failed with status " + response.status);
    }

    const data = (await response.json()) as PriceRecord[];
    const tokens = normalizePrices(data);

    if (tokens.length < 2) {
      throw new Error("Not enough token price data.");
    }

    return tokens;
  } finally {
    window.clearTimeout(timeoutId);
    signal.removeEventListener("abort", abortHandler);
  }
}
