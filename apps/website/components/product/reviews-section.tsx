import Image from "next/image";
import { Gift } from "lucide-react";
import type { ProductReview } from "@odtsi/exiuscart-client";

interface Props {
  reviews: ProductReview[];
}

// No self-serve "write a review" form here — ExiusCart has no endpoint for
// that. Its real review flow is token-based: an email goes out automatically
// once an order is marked delivered, linking to ExiusCart's own hosted
// /review/{token} page (confirmed live). This section only ever shows
// existing approved reviews plus an honest note about how to leave one.
export function ReviewsSection({ reviews }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">What Our Customers Say</h2>

      {reviews.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#16161A]">{r.customerName}</p>
                <span className="tracking-[1px] text-action">
                  {"★".repeat(r.rating)}
                  <span className="text-[#D8D5CE]">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4844]">{r.comment}</p>
              {/* Real photo the reviewer attached, when there is one — not
                  every review has one, honest-empty rather than a broken
                  image placeholder. */}
              {r.photoUrl && (
                <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg">
                  <Image src={r.photoUrl} alt="Photo from the review" fill className="object-cover" />
                </div>
              )}
              {r.createdAt && (
                <p className="mt-2 text-xs text-[#8B8880]">{new Date(r.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#716D67]">No reviews yet — be the first to review and earn 1% cashback.</p>
      )}

      <div className="mt-6 rounded-2xl border border-black/10 p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-status">
          <Gift size={14} />
          Leave a review and earn 1% of this product&apos;s price back in your ODTSI Wallet.
        </p>
        <p className="mt-2 text-sm text-[#716D67]">
          We&apos;ll email you a review link once your order is delivered — no need to come back here.
        </p>
      </div>
    </div>
  );
}
