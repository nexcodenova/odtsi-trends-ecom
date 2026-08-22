"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageLens } from "@/components/product/image-lens";
import { VARIANT_IMAGE_EVENT, type VariantImageDetail } from "@/lib/notify";

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
  // Set when a color/size variant is picked in AddToCartSection (a sibling,
  // not a parent/child, so this arrives via event rather than a prop) —
  // takes over the main display until the shopper clicks a thumbnail again.
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const activeImage = variantImage ?? images[active] ?? images[0];
  const railImages = images.slice(0, MAX_RAIL_THUMBS);
  const overflowImages = images.slice(MAX_RAIL_THUMBS);

  useEffect(() => {
    function handle(e: Event) {
      setVariantImage((e as CustomEvent<VariantImageDetail>).detail.imageUrl);
    }
    window.addEventListener(VARIANT_IMAGE_EVENT, handle);
    return () => window.removeEventListener(VARIANT_IMAGE_EVENT, handle);
  }, []);

  function selectThumb(i: number) {
    setActive(i);
    setVariantImage(null);
  }

  function renderThumb(src: string, i: number) {
    return (
      <button
        key={src}
        type="button"
        onClick={() => selectThumb(i)}
        aria-label={`View image ${i + 1}`}
        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-primary-light transition ${
          i === active && !variantImage ? "border-action" : "border-transparent"
        }`}
      >
        <Image src={src} alt="" fill className="object-cover" />
      </button>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: images.length > 1 ? "78px 1fr" : "1fr",
        columnGap: 14,
        // Same 6px used between the rail thumbnails themselves, so the row
        // below the main image sits exactly as close as the rail images do.
        rowGap: 6,
      }}
    >
      {images.length > 1 && (
        // No justify-between — that stretched to fill the rail's full
        // height (matching the tall main image), which overrode gap-* with
        // whatever space-between computed instead of the fixed value.
        // justify-center instead of packing at the top: with fewer
        // thumbnails than fit the main image's height, that left a big
        // empty gap at the bottom — centering balances it above and below.
        <div className="flex h-full flex-col justify-center gap-1.5">
          {railImages.map((src, i) => renderThumb(src, i))}
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#232323] to-[#060606]">
        {activeImage ? (
          <ImageLens src={activeImage}>
            <Image src={activeImage} alt={productName} fill priority className="object-cover" />
          </ImageLens>
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

      {/* Same grid column as the main image, not the rail — its left edge
          lines up with the main image's, not the narrower rail's, and the
          gap above it comes from the grid's own row gap, same value the
          rail thumbnails use, instead of a separately chosen margin. */}
      {overflowImages.length > 0 && (
        <div style={{ gridColumn: images.length > 1 ? 2 : 1 }} className="flex gap-1.5 overflow-x-auto pb-1">
          {overflowImages.map((src, i) => renderThumb(src, MAX_RAIL_THUMBS + i))}
        </div>
      )}
    </div>
  );
}
