import { formatCurrency } from "@odtsi/utils";

interface PriceProps {
  // Whatever ExiusCart sends, shown as-is — no client-side conversion.
  // ExiusCart is being asked to add a storefront_currency setting so every
  // price it sends is already converted to USD server-side; once that's
  // live this number is exactly what the customer sees.
  amount: number;
  className?: string;
}

export function Price({ amount, className }: PriceProps) {
  return <span className={className}>{formatCurrency(amount, "USD")}</span>;
}
