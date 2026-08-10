"use client";

import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@odtsi/utils";

interface PriceProps {
  // Amount in GBP — the base currency prices are stored in.
  amount: number;
  className?: string;
}

// Converts using live exchange rates for display only. What a customer is
// actually charged still depends on the payment gateway's own currency
// handling — this is browsing convenience, not the checkout total.
export function Price({ amount, className }: PriceProps) {
  const { currency, rates } = useCurrency();
  const rate = rates?.[currency] ?? 1;
  return <span className={className}>{formatCurrency(amount * rate, currency)}</span>;
}
