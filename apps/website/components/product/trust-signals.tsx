import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";

// Real counters straight from ExiusCart — no formula, no padding, no
// estimate. Each shows independently, only when that field is actually
// present; null means "not available yet", not zero.
export function TrustSignals({ viewCount, unitsSold }: Pick<Product, "viewCount" | "unitsSold">) {
  if (viewCount === null && unitsSold === null) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[12.5px] text-[#716D67]">
      {viewCount !== null && (
        <span className="flex items-center gap-1.5">
          <Eye size={14} />
          {viewCount.toLocaleString()} views
        </span>
      )}
      {unitsSold !== null && (
        <span className="flex items-center gap-1.5">
          <ShoppingBag size={14} />
          {unitsSold.toLocaleString()} sold
        </span>
      )}
    </div>
  );
}
