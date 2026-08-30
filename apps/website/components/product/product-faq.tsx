"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProductFaq } from "@odtsi/exiuscart-client";

// Real seller-written Q&A only — this section doesn't render at all unless
// ExiusCart actually sends at least one entry (see the empty-check in the
// parent page). No placeholder questions, ever.
export function ProductFaqSection({ faq }: { faq: ProductFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {faq.map((entry, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              isOpen ? "border-primary/20 bg-primary-light/40" : "border-black/10 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[14.5px] font-bold leading-snug text-[#16161A]">{entry.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[#8B8880] transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
              />
            </button>

            {/* CSS-only expand/collapse (grid-template-rows 0fr -> 1fr) —
                smooth without measuring heights in JS or pulling in an
                animation library. */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[13.5px] leading-relaxed text-[#4A4844]">{entry.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
