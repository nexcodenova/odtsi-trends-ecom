"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getExchangeRates, type CurrencyCode } from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  rates: Record<string, number> | null;
}

// USD only — no switcher. Still converts from GBP (the base currency prices
// are stored in) via a live rate, just never shows any other option.
const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  rates: null,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getExchangeRates()
      .then(setRates)
      .catch(() => setRates({ GBP: 1 })); // fall back to no conversion rather than a broken page
  }, []);

  return <CurrencyContext.Provider value={{ currency: "USD", rates }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
