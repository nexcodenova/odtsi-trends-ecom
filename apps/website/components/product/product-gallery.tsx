"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageLens } from "@/components/product/image-lens";
import { VARIANT_IMAGE_EVENT, type VariantImageDetail } from "@/lib/notify";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
  // Digital products don't need the same big hero treatment a physical
  // product's gallery gets — caps the whole gallery to a smaller max width
  // instead of stretching to fill the column.
  compact?: boolean;
}

// How many thumbnails the side rail holds before it'd run taller than the
// main image and look unbalanced — anything past this spills into a row
// below the main image instead of stretching the rail further down.
const MAX_RAIL_THUMBS = 6;

export function ProductGallery({ images, productName, badge, compact }: ProductGalleryProps) {
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
        className={`relative flex-shrink-0 overflow-hidden rounded-xl border-2 bg-primary-light transition ${
          compact ? "h-[72px] w-[72px]" : "h-14 w-14 sm:h-20 sm:w-20"
        } ${i === active && !variantImage ? "border-action" : "border-transparent"}`}
      >
        <Image src={src} alt="" fill className={compact ? "object-contain p-1" : "object-cover"} />
      </button>
    );
  }

  return (
    <div
      className={`grid gap-x-[10px] gap-y-2 sm:gap-x-[14px] ${
        images.length > 1
          ? compact
            ? "grid-cols-1 sm:grid-cols-[72px_1fr]"
            : "grid-cols-[56px_1fr] sm:grid-cols-[84px_1fr]"
          : "grid-cols-1"
      }`}
    >
      {images.length > 1 && (
        // justify-between: first thumbnail flush with the main image's top
        // corner, last one flush with its bottom corner, everything between
        // auto-spaced with equal gaps — not a fixed gap-* value, since the
        // right gap size depends on how many thumbnails there are. Hidden on
        // mobile for compact (digital) galleries — the horizontal strip
        // below the main image covers thumbnail navigation there instead.
        <div className={`h-full flex-col justify-between ${compact ? "hidden sm:flex" : "flex"}`}>
          {railImages.map((src, i) => renderThumb(src, i))}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#232323] to-[#060606] ${
          // Fixed height at each breakpoint instead of an aspect ratio, so
          // this stays a consistent size regardless of column width and can
          // visually height-match the info column beside it. object-contain
          // below still shows the full asset uncropped either way.
          compact ? "h-[320px] sm:h-[420px] lg:h-[500px] xl:h-[530px]" : "aspect-[3/4] sm:aspect-[4/5]"
        }`}
      >
        {activeImage ? (
          <ImageLens src={activeImage}>
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              className={compact ? "object-contain" : "object-cover"}
            />
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
        {compact && images.length > 1 && (
          <span className="absolute bottom-3.5 right-3.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#16161A] shadow sm:hidden">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Mobile-only horizontal thumbnail strip for compact galleries — the
          vertical rail is hidden below sm, so without this there'd be no
          way to switch images at all on a phone, just a counter badge with
          nothing to tap. */}
      {compact && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {railImages.map((src, i) => renderThumb(src, i))}
        </div>
      )}

      {/* Same grid column as the main image, not the rail — its left edge
          lines up with the main image's, not the narrower rail's. */}
      {overflowImages.length > 0 && (
        <div style={{ gridColumn: images.length > 1 ? 2 : 1 }} className="flex gap-2 overflow-x-auto pb-1">
          {overflowImages.map((src, i) => renderThumb(src, MAX_RAIL_THUMBS + i))}
        </div>
      )}
    </div>
  );
}
