import { Gift, Sparkles, Tag } from "lucide-react";
import type { CartPreview } from "@odtsi/exiuscart-client";

// Offer discount lines, free gifts and "add X more" hints from ExiusCart's
// cart preview. Shared by the cart and checkout summaries.
export function OfferLines({ preview, price }: { preview: CartPreview; price: (amount: number) => string }) {
  return (
    <>
      {preview.offers.map((offer) => (
        <div key={offer.id} className="flex justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[#4A4844]">
            <Tag size={13} className="shrink-0 text-status" />
            {offer.title}
          </span>
          <span className="whitespace-nowrap font-bold text-status">
            {offer.amount > 0 ? `-${price(offer.amount)}` : "Free shipping"}
          </span>
        </div>
      ))}
      {preview.gifts.map((gift, i) => (
        <div key={i} className="flex justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[#4A4844]">
            <Gift size={13} className="shrink-0 text-status" />
            Free gift: {gift.title}
            {gift.quantity > 1 && <span className="text-[#8B8880]"> ×{gift.quantity}</span>}
          </span>
          <span className="font-bold text-status">Free</span>
        </div>
      ))}
    </>
  );
}

export function OfferHints({ hints, className = "" }: { hints: string[]; className?: string }) {
  if (hints.length === 0) return null;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {hints.map((hint, i) => (
        <p
          key={i}
          className="flex items-center gap-2 rounded-xl bg-[#FFFBEF] px-3 py-2 text-[13px] font-semibold text-[#6B4E00] ring-1 ring-action/30"
        >
          <Sparkles size={14} className="shrink-0 text-action" />
          {hint}
        </p>
      ))}
    </div>
  );
}
