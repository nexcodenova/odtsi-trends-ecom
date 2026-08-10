const LOCALE_BY_CURRENCY: Record<string, string> = {
  GBP: "en-GB",
  USD: "en-US",
  AUD: "en-AU",
  CAD: "en-CA",
  EUR: "de-DE",
};

export function formatCurrency(amount: number, currency: string = "GBP") {
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-GB";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
