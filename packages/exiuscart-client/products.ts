import { storeUrl } from "./config";
import type { Product, ProductVariant, QuantityTier, ProductVideo } from "./types";

interface RawQuantityTier {
  quantity: number;
  price: number;
  label: string | null;
  badge: string | null;
  badge_type: "save" | "popular" | "value" | null;
  recommended: boolean;
}

interface RawVariant {
  id: number;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string;
  quantity: number;
  in_stock: boolean;
  price: number;
  image_url: string;
}

interface RawVideo {
  url: string;
  platform: string;
  thumbnail_url: string | null;
  title: string | null;
  embed_html: string | null;
}

// ExiusCart's actual response shape — snake_case, different field names and
// nesting than what ODTSI's UI expects. mapProduct() below is the one place
// that translates between the two, so nothing else in the app needs to know
// ExiusCart's raw shape.
interface RawProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  // Optional — older responses (before ExiusCart added this field) won't
  // have it, so this falls back to USD rather than crash on a missing key.
  currency?: string;
  price: number;
  compare_at_price: number | null;
  in_stock: boolean;
  quantity: number;
  images: string[];
  // Legacy single-video field — still sent, still used as a fallback when
  // `videos` is empty, per ExiusCart's own migration note.
  video_url: string | null;
  videos: RawVideo[];
  quantity_tiers: RawQuantityTier[];
  // Optional for the same reason as currency — not every product has
  // color/size options, and older responses won't have the field at all.
  variants?: RawVariant[];
  tags: string[];
  category_id: number | null;
  custom_fields: Record<string, unknown>;
  // Not live on ExiusCart's side yet — optional so mapping stays safe
  // whether or not the field is present in the response.
  view_count?: number;
  units_sold?: number;
}

function mapVariants(raw: RawVariant[] | undefined): ProductVariant[] {
  return (raw ?? []).map((v) => ({
    id: String(v.id),
    size: v.size,
    color: v.color,
    colorHex: v.color_hex,
    sku: v.sku,
    stockCount: v.quantity,
    inStock: v.in_stock,
    price: v.price,
    imageUrl: v.image_url,
  }));
}

function mapQuantityTiers(raw: RawQuantityTier[] | undefined): QuantityTier[] {
  return (raw ?? []).map((t) => ({
    quantity: t.quantity,
    price: t.price,
    label: t.label ?? undefined,
    badge: t.badge ?? undefined,
    badgeType: t.badge_type ?? undefined,
    recommended: t.recommended,
  }));
}

function mapVideos(raw: RawProduct): ProductVideo[] {
  if (raw.videos && raw.videos.length > 0) {
    return raw.videos.map((v) => ({
      url: v.url,
      platform: v.platform,
      thumbnailUrl: v.thumbnail_url,
      title: v.title,
      embedHtml: v.embed_html,
    }));
  }
  // Fall back to the legacy single-video field so nothing already live
  // loses its video once `videos` becomes the primary source.
  if (raw.video_url) {
    return [{ url: raw.video_url, platform: "video", thumbnailUrl: null, title: null, embedHtml: null }];
  }
  return [];
}

function mapProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    tagline: null,
    // Raw HTML from the supplier, including any inline images — sanitized
    // right before rendering (see ProductDescription), not here. Kept as-is
    // in the data layer so nothing gets stripped before it's actually used.
    description: raw.description,
    price: raw.price,
    compareAtPrice: raw.compare_at_price,
    // Real field from ExiusCart now — shown as-is, not assumed or converted.
    currency: raw.currency ?? "USD",
    imageUrl: raw.images[0] ?? "",
    images: raw.images,
    videos: mapVideos(raw),
    // No real category slug yet — Storefront Categories isn't set up on
    // ExiusCart's side, so category_id can't be resolved to a slug. Falls
    // back to a stringified id so category links don't crash, but this
    // needs real category data before it's actually correct.
    categorySlug: raw.category_id !== null ? String(raw.category_id) : "uncategorized",
    inStock: raw.in_stock,
    stockCount: raw.quantity,
    // Bundle isn't in the public API yet — stays null until it is.
    bundle: null,
    quantityTiers: mapQuantityTiers(raw.quantity_tiers),
    rating: null,
    reviewCount: null,
    specs: [],
    testimonials: [],
    // Real counters, straight through — null (not 0) when ExiusCart hasn't
    // sent the field at all, so "0" is never confused with "not available".
    viewCount: raw.view_count ?? null,
    unitsSold: raw.units_sold ?? null,
    variants: mapVariants(raw.variants),
  };
}

export async function getProducts(params?: { category?: string; collection?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.collection) query.set("collection", params.collection);
  const qs = query.toString();

  const res = await fetch(storeUrl(`/products${qs ? `?${qs}` : ""}`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const raw: RawProduct[] = await res.json();
  return raw.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product> {
  const res = await fetch(storeUrl(`/products/${slug}`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load product "${slug}": ${res.status}`);
  const raw: RawProduct = await res.json();
  return mapProduct(raw);
}
