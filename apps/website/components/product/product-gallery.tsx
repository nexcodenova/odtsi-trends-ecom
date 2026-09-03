"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
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
  // Which page of the rail is showing — the rail only ever displays
  // MAX_RAIL_THUMBS at once, side-by-side never spilling into a row below
  // the main image. The chevron button pages through the rest in chunks,
  // wrapping back to the start after the last page.
  const [railPage, setRailPage] = useState(0);
  // Set when a color/size variant is picked in AddToCartSection (a sibling,
  // not a parent/child, so this arrives via event rather than a prop) —
  // takes over the main display until the shopper clicks a thumbnail again.
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const activeImage = variantImage ?? images[active] ?? images[0];
  const hasMoreThanRail = images.length > MAX_RAIL_THUMBS;
  const railStart = railPage * MAX_RAIL_THUMBS;
  const railImages = images.slice(railStart, railStart + MAX_RAIL_THUMBS);

  function nextRailPage() {
    const start = railStart + MAX_RAIL_THUMBS;
    setRailPage(start >= images.length ? 0 : railPage + 1);
  }

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
        // Physical: justify-between spreads thumbnails top-to-bottom to
        // match the main image's height edge-to-edge. Digital's compact
        // gallery is much taller relative to how few thumbnails a real
        // digital product tends to have, so justify-between there left a
        // huge empty gap between 2-3 thumbnails — packed from the top with
        // a fixed gap instead. Hidden on mobile for compact — the
        // horizontal strip below the main image covers navigation there.
        <div
          className={`h-full flex-col ${compact ? "hidden gap-3 sm:flex" : "flex justify-between"}`}
        >
          {railImages.map((src, i) => renderThumb(src, railStart + i))}
          {hasMoreThanRail && (
            <button
              type="button"
              onClick={nextRailPage}
              aria-label="Show more images"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center self-center rounded-full border border-black/10 bg-white text-[#4A4844] shadow-sm transition hover:text-primary"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#232323] to-[#060606] ${
          // Fixed height at each breakpoint instead of an aspect ratio, so
          // this stays a consistent size regardless of column width and can
          // visually height-match the info column beside it. object-contain
          // below still shows the full asset uncropped either way.
          compact ? "h-[320px] sm:h-[420px] lg:h-[560px] xl:h-[590px]" : "aspect-[3/4] sm:aspect-[4/5]"
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
          nothing to tap. Scrolls through every image directly (no paging
          needed — horizontal scroll is already the "more" affordance). */}
      {compact && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {images.map((src, i) => renderThumb(src, i))}
        </div>
      )}
    </div>
  );
}
