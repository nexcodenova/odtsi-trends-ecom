"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@odtsi/exiuscart-client";
import { ProductCard } from "@/components/product/product-card";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-md sm:-left-4 sm:flex"
      >
        <ChevronLeft size={18} className="text-primary" />
      </button>

      <div ref={scrollerRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-[62%] flex-shrink-0 sm:w-[220px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white shadow-md sm:-right-4 sm:flex"
      >
        <ChevronRight size={18} className="text-primary" />
      </button>
    </div>
  );
}
