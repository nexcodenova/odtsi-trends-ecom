import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { TrendingProducts } from "@/components/home/trending-products";
import { WeeklyEdit } from "@/components/home/weekly-edit";
import { MostViewed } from "@/components/home/most-viewed";
import { PopularAffiliate } from "@/components/home/popular-affiliate";
import { DigitalProducts } from "@/components/home/digital-products";
import { WhyOdtsi } from "@/components/home/why-odtsi";
import { ConnectSection } from "@/components/home/connect-section";
import { getCategories, type Category } from "@odtsi/exiuscart-client";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: { absolute: "ODTSI — Trending Products & Gifts, Shipped to the US, UK & Europe" },
  description:
    "Shop trending lifestyle products, gifts and deals with fast delivery to the USA, UK, Ireland, Europe, Canada and Australia. Earn wallet cashback on every order.",
});

// Halloween leads until Oct 31. Both banners are pre-designed graphics
// with their own text baked in, so showTextOverlay stays off for these —
// flip it on for a plain photo.
const HERO_SLIDES: HeroSlide[] = [
  {
    imageUrl: "/hero-halloween.png",
    imageUrlMobile: "/hero-halloween-mobile.png",
    showTextOverlay: false,
    ctaHref: "/collections",
  },
  { imageUrl: "/hero-cashback.png", showTextOverlay: false, ctaHref: "/wallet", objectPosition: "object-top" },
];

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await loadCategories();

  return (
    <>
      <HeroCarousel slides={HERO_SLIDES} intervalMs={4000} />
      <CategoryGrid categories={categories} />
      <TrendingProducts />
      <WeeklyEdit />
      <MostViewed />
      <PopularAffiliate />
      <DigitalProducts />
      <WhyOdtsi />
      <ConnectSection />
    </>
  );
}
