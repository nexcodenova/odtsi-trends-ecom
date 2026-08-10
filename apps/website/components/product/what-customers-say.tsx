import Image from "next/image";
import type { ProductTestimonial } from "@odtsi/exiuscart-client";

const PLACEHOLDER_SLOTS = 3;

// Real testimonials render as actual clips. Until ExiusCart has any for
// this product, the slots stay as honest "video goes here" placeholders —
// same pattern as the homepage photo tiles — never fake customer content.
export function WhatCustomersSay({ testimonials }: { testimonials: ProductTestimonial[] }) {
  const real = testimonials.slice(0, PLACEHOLDER_SLOTS);
  const placeholderCount = Math.max(0, PLACEHOLDER_SLOTS - real.length);

  return (
    <div className="flex flex-col gap-3">
      {real.map((t) => (
        <a
          key={t.id}
          href={t.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-[#F6F5F3]"
        >
          <Image src={t.thumbnailUrl} alt={t.customerName} fill className="object-cover" />
          <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary">▶</span>
          </span>
          <span className="absolute bottom-3 left-3 text-xs font-bold text-white drop-shadow">{t.customerName}</span>
        </a>
      ))}

      {Array.from({ length: placeholderCount }).map((_, i) => (
        <div
          key={i}
          className="flex aspect-[16/9] flex-col items-center justify-center gap-1 rounded-2xl bg-[#F6F5F3] text-[#B9B6AE]"
        >
          <span className="text-lg">▶</span>
          <span className="text-xs font-semibold tracking-wide">video goes here</span>
          <span className="text-[11px]">Angle {real.length + i + 1}</span>
        </div>
      ))}
    </div>
  );
}
