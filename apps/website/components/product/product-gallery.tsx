"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
}

// How many thumbnails the side rail holds before it'd run taller than the
// main image and look unbalanced — anything past this spills into a row
// below the main image instead of stretching the rail further down.
const MAX_RAIL_THUMBS = 6;

export function ProductGallery({ images, productName, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const activeImage = images[active] ?? images[0];
  const railImages = images.slice(0, MAX_RAIL_THUMBS);
  const overflowImages = images.slice(MAX_RAIL_THUMBS);

  function renderThumb(src: string, i: number) {
    return (
      <button
        key={src}
        type="button"
        onClick={() => setActive(i)}
        aria-label={`View image ${i + 1}`}
        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-primary-light transition ${
          i === active ? "border-action" : "border-transparent"
        }`}
      >
        <Image src={src} alt="" fill className="object-cover" />
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: images.length > 1 ? "78px 1fr" : "1fr", gap: 14 }}>
        {images.length > 1 && (
          <div className="flex h-full flex-col justify-between gap-2.5">
            {railImages.map((src, i) => renderThumb(src, i))}
          </div>
        )}

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#232323] to-[#060606]">
          {activeImage ? (
            <Image src={activeImage} alt={productName} fill priority className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide text-white/25">
              ◇ photo goes here
            </span>
          )}
          {badge && (
            <span className="absolute left-3.5 top-3.5 rounded-full bg-action px-3 py-1.5 text-[11px] font-extrabold text-[#16161A]">
              {badge}
            </span>
          )}
        </div>
      </div>

      {overflowImages.length > 0 && (
        <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1">
          {overflowImages.map((src, i) => renderThumb(src, MAX_RAIL_THUMBS + i))}
        </div>
      )}
    </div>
  );
}
