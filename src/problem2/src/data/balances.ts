export const DEMO_BALANCES: Record<string, number> = {
  USD: 2500,
  USDC: 1250,
  ETH: 4.2,
  WBTC: 0.38,
  ATOM: 320,
  OSMO: 760,
  SWTH: 25000,
};

export const DEFAULT_BALANCE = 1000;

export function getBalance(balances: Record<string, number>, currency: string) {
  return balances[currency] ?? DEFAULT_BALANCE;
}

