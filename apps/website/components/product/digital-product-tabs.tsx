"use client";

import { useState } from "react";
import type { ProductFaq, ProductReview } from "@odtsi/exiuscart-client";
import { DescriptionSection } from "@/components/product/description-section";
import { ProductFaqSection } from "@/components/product/product-faq";
import { ReviewsSection } from "@/components/product/reviews-section";

interface DescriptionImage {
  src: string;
  alt: string;
}

interface Props {
  slug: string;
  description: string | null;
  descriptionBlocks: string[];
  descriptionImages: DescriptionImage[];
  faq: ProductFaq[];
  reviews: ProductReview[];
  isLoggedIn: boolean;
  // Real seller-set tags — already coming back from ExiusCart on every
  // product, just never mapped or shown until now.
  tags: string[];
}

type TabId = "description" | "faq" | "reviews";

// Digital-only tabbed layout, replacing the continuous-scroll section order
// physical/affiliate pages use. Only real data backs these three tabs — no
// "Specifications" tab here, since ExiusCart's real spec field (`specs`) is
// a flat list of short highlight strings, not the label:value pairs a real
// specs table needs. That's a real gap to ask ExiusCart about, not
// something to fake with invented rows.
export function DigitalProductTabs({
  slug,
  description,
  descriptionBlocks,
  descriptionImages,
  faq,
  reviews,
  isLoggedIn,
  tags,
}: Props) {
  const tabs: { id: TabId; label: string }[] = [];
  if (description) tabs.push({ id: "description", label: "Description" });
  if (faq.length > 0) tabs.push({ id: "faq", label: "FAQ" });
  tabs.push({ id: "reviews", label: reviews.length > 0 ? `Reviews (${reviews.length})` : "Reviews" });

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "reviews");

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="flex overflow-x-auto border-b border-black/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`relative whitespace-nowrap px-6 py-4 text-sm font-bold transition ${
              active === t.id ? "text-[#16161A]" : "text-[#8B8880] hover:text-[#4A4844]"
            }`}
          >
            {t.label}
            {active === t.id && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {active === "description" && (
          <div>
            <DescriptionSection blocks={descriptionBlocks} images={descriptionImages} />
            {tags.length > 0 && (
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-semibold text-[#4A4844]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {active === "faq" && <ProductFaqSection faq={faq} />}
        {active === "reviews" && <ReviewsSection slug={slug} reviews={reviews} isLoggedIn={isLoggedIn} />}
      </div>
    </div>
  );
}
