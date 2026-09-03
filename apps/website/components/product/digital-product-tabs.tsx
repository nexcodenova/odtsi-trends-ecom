"use client";

import { useState } from "react";
import type { ProductFaq, ProductReview, ProductSpec } from "@odtsi/exiuscart-client";
import { DescriptionSection } from "@/components/product/description-section";
import { ProductFaqSection } from "@/components/product/product-faq";
import { ReviewsSection } from "@/components/product/reviews-section";
import { getSpecIcon } from "@/lib/spec-icons";

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
  // Real seller-set highlights (icon + label) — same data shown in the
  // hero checklist, surfaced here too as a proper specs card. Still not a
  // label:value table (Duration: 12 months, Compatibility: ...) — that
  // needs real structured fields ExiusCart doesn't send. This is the
  // honest version of "Specifications" with the data that actually exists.
  specs: ProductSpec[];
}

type TabId = "description" | "specifications" | "faq" | "reviews";

// Digital-only tabbed layout, replacing the continuous-scroll section order
// physical/affiliate pages use.
export function DigitalProductTabs({
  slug,
  description,
  descriptionBlocks,
  descriptionImages,
  faq,
  reviews,
  isLoggedIn,
  tags,
  specs,
}: Props) {
  const tabs: { id: TabId; label: string }[] = [];
  if (description) tabs.push({ id: "description", label: "Description" });
  if (specs.length > 0) tabs.push({ id: "specifications", label: "Specifications" });
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
        {active === "specifications" && (
          <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
            {specs.map((spec) => {
              const Icon = getSpecIcon(spec.icon);
              return (
                <div key={spec.label} className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-semibold text-[#16161A]">{spec.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {active === "faq" && <ProductFaqSection faq={faq} />}
        {active === "reviews" && <ReviewsSection slug={slug} reviews={reviews} isLoggedIn={isLoggedIn} />}
      </div>
    </div>
  );
}
