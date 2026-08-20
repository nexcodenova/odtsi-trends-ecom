import { formatCurrency } from "@odtsi/utils";

interface PriceProps {
  // Whatever ExiusCart sends, shown as-is — no client-side conversion.
  amount: number;
  // Real currency code from the product/order this amount belongs to.
  // Defaults to USD only for call sites that don't have a real product to
  // read a currency from (e.g. hardcoded UI copy), not as a silent guess.
  currency?: string;
  className?: string;
}

export function Price({ amount, currency = "USD", className }: PriceProps) {
  return <span className={className}>{formatCurrency(amount, currency)}</span>;
}
