import { HeroCarousel, type HeroSlide } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { TrendingProducts } from "@/components/home/trending-products";
import { WeeklyEdit } from "@/components/home/weekly-edit";
import { WhyOdtsi } from "@/components/home/why-odtsi";
import { ConnectSection } from "@/components/home/connect-section";
import { getCategories, type Category } from "@odtsi/exiuscart-client";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholder-data";

// Both banners are pre-designed graphics with their own text baked in,
// so showTextOverlay stays off for these — flip it on for a plain photo.
const HERO_SLIDES: HeroSlide[] = [
  { imageUrl: "/hero-cashback.png", showTextOverlay: false, ctaHref: "/wallet", objectPosition: "object-top" },
  {
    imageUrl: "/hero-summer.png",
    imageUrlMobile: "/hero-summer-mobile.png",
    showTextOverlay: false,
    ctaHref: "/collection/summer-sale",
  },
  {
    imageUrl: "/hero-halloween.png",
    imageUrlMobile: "/hero-halloween-mobile.png",
    showTextOverlay: false,
    ctaHref: "/collection/halloween",
  },
];

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return PLACEHOLDER_CATEGORIES;
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
      <WhyOdtsi />
      <ConnectSection />
    </>
  );
}
