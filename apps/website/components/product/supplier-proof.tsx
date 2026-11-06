import { Check } from "lucide-react";
import type { SupplierProof } from "@odtsi/exiuscart-client";

// Supplier's rating and sales numbers, straight from ExiusCart. Not our own
// store reviews, so they stay out of schema.org (see productJsonLd).
const SOURCE_NOTE = "Rating and sales figures from our supplier";

export function hasSupplierStats(proof: SupplierProof | null): proof is SupplierProof {
  return !!proof && (proof.rating !== null || proof.soldLabel !== null);
}

// "★ 4.8 (2,310) · 🔥 12,000+ sold" — each half shows only if it exists.
export function SupplierProofLine({ proof, className = "" }: { proof: SupplierProof; className?: string }) {
  const hasRating = proof.rating !== null;
  return (
    <span className={`flex flex-wrap items-center gap-x-1.5 ${className}`} title={SOURCE_NOTE}>
      {hasRating && (
        <span>
          <span className="text-action">★</span> {proof.rating!.toFixed(1)}
          {proof.reviewCount !== null && ` (${proof.reviewCount.toLocaleString("en-US")})`}
        </span>
      )}
      {hasRating && proof.soldLabel && <span aria-hidden>·</span>}
      {proof.soldLabel && <span>🔥 {proof.soldLabel}</span>}
    </span>
  );
}

export function SupplierSellingPoints({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2 text-[13.5px] leading-snug text-[#4A4844]">
          <Check size={16} className="mt-0.5 shrink-0 text-status" />
          {point}
        </li>
      ))}
    </ul>
  );
}
