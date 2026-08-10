"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  imageUrl: string;
  // Optional separate crop for phone screens — a wide desktop banner and a
  // narrow phone screen need different compositions, not one image squeezed.
  imageUrlMobile?: string;
  // Turn off when the image already has its own headline/CTA baked in (like
  // a pre-designed sale banner) so it doesn't double up with overlay text.
  showTextOverlay?: boolean;
  eyebrow?: string;
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  // Bias which part of the photo survives the crop — e.g. "object-top" to
  // protect faces when the image is taller than the banner needs.
  objectPosition?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export function HeroCarousel({ slides, intervalMs = 3000 }: HeroCarouselProps) {
  const [active, setActive] = useState(0);

  // Re-runs on every manual click too, so a slide you just picked gets its
  // own full 3 seconds instead of being cut short by the previous timer.
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, slides.length, intervalMs]);

  function goTo(index: number) {
    setActive((index + slides.length) % slides.length);
  }

  return (
    <section className="relative mx-4 mt-4 aspect-[3/2] overflow-hidden rounded-3xl sm:mx-5 sm:mt-5 sm:aspect-[3/1]">
      {slides.map((slide, i) => (
        <div
          key={slide.imageUrl}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          <Image
            src={slide.imageUrlMobile ?? slide.imageUrl}
            alt=""
            fill
            priority={i === 0}
            className={`object-cover ${slide.objectPosition ?? "object-center"} ${slide.imageUrlMobile ? "sm:hidden" : ""}`}
          />
          {slide.imageUrlMobile && (
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              priority={i === 0}
              className={`hidden object-cover ${slide.objectPosition ?? "object-center"} sm:block`}
            />
          )}

          {slide.showTextOverlay && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white sm:inset-x-10 sm:bottom-10">
                <p className="text-xs font-bold uppercase tracking-widest opacity-90 sm:text-sm">{slide.eyebrow}</p>
                <h1 className="mt-2 max-w-[12ch] text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                  {slide.title}
                </h1>
                <Link
                  href={slide.ctaHref ?? "/"}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-action px-6 py-3 text-sm font-bold text-action-ink transition hover:brightness-95 sm:mt-6"
                >
                  {slide.ctaLabel ?? "Shop Now"}
                </Link>
              </div>
            </>
          )}

          {/* When there's no overlay, the image has no real button in it —
              make the whole slide a link so it's still clickable. */}
          {!slide.showTextOverlay && (
            <Link href={slide.ctaHref ?? "/"} className="absolute inset-0" aria-label={slide.title ?? "Shop this banner"} />
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow sm:left-5 sm:h-11 sm:w-11"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow sm:right-5 sm:h-11 sm:w-11"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 sm:bottom-5">
            {slides.map((slide, i) => (
              <button
                key={slide.imageUrl}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
