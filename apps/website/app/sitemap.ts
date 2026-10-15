import type { MetadataRoute } from "next";
import { getBlogPosts, getCategories, getProducts } from "@odtsi/exiuscart-client";
import { SITE_URL } from "@/lib/site";

// Rebuilt hourly so newly added products get into Google without a deploy.
export const revalidate = 3600;

const STATIC_PATHS: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/collection/trending", priority: 0.8, changeFrequency: "daily" },
  { path: "/collection/new", priority: 0.8, changeFrequency: "daily" },
  { path: "/collection/on-sale", priority: 0.8, changeFrequency: "daily" },
  { path: "/collection/gifts", priority: 0.8, changeFrequency: "daily" },
  { path: "/collections", priority: 0.6, changeFrequency: "weekly" },
  { path: "/category", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
  { path: "/shipping", priority: 0.4, changeFrequency: "monthly" },
  { path: "/returns", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

// Each source fails on its own — an ExiusCart outage drops those URLs
// from this build of the sitemap instead of breaking the whole file.
async function safe<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch (err) {
    console.error("[sitemap]", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    safe(() => getProducts()),
    safe(() => getCategories()),
    safe(() => getBlogPosts()),
  ]);

  return [
    ...STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      changeFrequency,
      priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
      images: p.imageUrl ? [p.imageUrl] : undefined,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
