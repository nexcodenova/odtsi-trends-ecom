const LOCALE_BY_CURRENCY: Record<string, string> = {
  GBP: "en-GB",
  USD: "en-US",
  AUD: "en-AU",
  CAD: "en-CA",
  EUR: "de-DE",
};

export function formatCurrency(amount: number, currency: string = "USD") {
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-GB";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export interface CurrencyParts {
  symbol: string;
  whole: string;
  // Includes the separator itself, e.g. ".00" — rendered smaller than
  // `whole` for the big-number/small-decimal price treatment.
  decimal: string;
}

// Splits a formatted price into symbol/whole/decimal so the UI can size
// the whole-dollar amount bigger than the cents, instead of one flat size.
export function formatCurrencyParts(amount: number, currency: string = "USD"): CurrencyParts {
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-GB";
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(amount);

  let symbol = "";
  let whole = "";
  let decimal = "";
  let inDecimal = false;

  for (const part of parts) {
    if (part.type === "currency") {
      symbol += part.value;
    } else if (part.type === "decimal") {
      inDecimal = true;
      decimal += part.value;
    } else if (inDecimal) {
      decimal += part.value;
    } else {
      whole += part.value;
    }
  }

  return { symbol, whole, decimal };
}
