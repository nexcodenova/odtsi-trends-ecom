import type { Category } from "@odtsi/exiuscart-client";

// Temporary stand-in for ExiusCart's public /categories endpoint, which
// isn't live yet. Every page that needs category data reads from here so
// there's one source instead of copies that can drift apart.
// Delete this file once ExiusCart's public /categories endpoint is deployed.
// No placeholder products here on purpose — an honest "no products yet"
// empty state until ExiusCart's real inventory is connected.

export const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: "1", slug: "smart-gadgets", name: "Smart Gadgets", imageUrl: null, parentId: null },
  { id: "2", slug: "led-lighting", name: "LED Lighting", imageUrl: null, parentId: null },
  { id: "3", slug: "home-kitchen", name: "Home & Kitchen", imageUrl: null, parentId: null },
  { id: "4", slug: "beauty-tools", name: "Beauty Tools", imageUrl: null, parentId: null },
  { id: "5", slug: "fitness", name: "Fitness", imageUrl: null, parentId: null },
  { id: "6", slug: "pet-products", name: "Pet Products", imageUrl: null, parentId: null },
  { id: "7", slug: "car-accessories", name: "Car Accessories", imageUrl: null, parentId: null },
  { id: "8", slug: "toys-novelty", name: "Toys & Novelty", imageUrl: null, parentId: null },
  // Row 2 starts here (8 columns per row on desktop) — Software and Ebooks
  // lead the second line on purpose, not sorted alphabetically with the rest.
  { id: "16", slug: "software", name: "Software", imageUrl: null, parentId: null },
  { id: "17", slug: "ebooks", name: "Ebooks", imageUrl: null, parentId: null },
  { id: "9", slug: "fashion", name: "Fashion", imageUrl: null, parentId: null },
  { id: "10", slug: "phone-cases", name: "Phone Cases", imageUrl: null, parentId: null },
  { id: "11", slug: "outdoor", name: "Outdoor", imageUrl: null, parentId: null },
  { id: "12", slug: "desk-setup", name: "Desk Setup", imageUrl: null, parentId: null },
  { id: "13", slug: "travel", name: "Travel", imageUrl: null, parentId: null },
  { id: "14", slug: "baby-kids", name: "Baby & Kids", imageUrl: null, parentId: null },
  { id: "15", slug: "sports", name: "Sports", imageUrl: null, parentId: null },
];

export function getPlaceholderCategory(slug: string): Category | undefined {
  return PLACEHOLDER_CATEGORIES.find((category) => category.slug === slug);
}
