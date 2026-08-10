// Live exchange rates only — never a made-up conversion number. Uses
// Frankfurter (European Central Bank reference rates, free, no API key).
// This is a DISPLAY conversion for browsing convenience — what a customer
// is actually charged still depends on the payment gateway's own currency
// handling (see the payments section of the ExiusCart requirements).

export const SUPPORTED_CURRENCIES = ["USD"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const RATES_KEY = "odtsi_rates";
const RATES_CACHE_MS = 60 * 60 * 1000; // 1 hour — rates don't need to be fetched every page load

interface RatesCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

// Product prices are stored in GBP as the base currency.
export async function getExchangeRates(): Promise<Record<string, number>> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(RATES_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as RatesCache;
        if (Date.now() - parsed.fetchedAt < RATES_CACHE_MS) {
          return parsed.rates;
        }
      } catch {
        // fall through to a fresh fetch
      }
    }
  }

  const res = await fetch("https://api.frankfurter.app/latest?from=GBP");
  if (!res.ok) throw new Error(`Failed to fetch exchange rates: ${res.status}`);
  const data = (await res.json()) as { rates: Record<string, number> };
  const rates = { GBP: 1, ...data.rates };

  if (typeof window !== "undefined") {
    localStorage.setItem(RATES_KEY, JSON.stringify({ rates, fetchedAt: Date.now() } satisfies RatesCache));
  }

  return rates;
}
