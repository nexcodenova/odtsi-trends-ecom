import { MIN_VIEWS_FOR_POPULAR } from "@/lib/product-thresholds";

// Real criterion, not a label slapped on every product — same real view
// threshold the homepage's Most Viewed section already uses, reused here
// (not reinvented) so "popular" means the same thing everywhere on the
// site. Physical and digital both qualify the same way; affiliate isn't
// sold by us so it's never shown this badge.
export function BestSellerBadge({ viewCount }: { viewCount: number | null }) {
  if (viewCount === null || viewCount <= MIN_VIEWS_FOR_POPULAR) return null;

  return (
    <span className="inline-flex w-fit rounded-md bg-[#FF7A21] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
      Best Seller
    </span>
  );
}
