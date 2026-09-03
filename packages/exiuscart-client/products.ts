import { storeUrl } from "./config";
import { getCategories } from "./categories";
import type { Product, ProductFaq, ProductSpec, ProductType, ProductVariant, QuantityTier, ProductVideo } from "./types";

interface RawFaq {
  question: string;
  answer: string;
}

interface RawHighlight {
  // A kebab-case icon identifier (e.g. "check-circle", "mail") — mapping
  // this to an actual icon component is a UI concern, done where it's
  // rendered, not here.
  icon: string;
  label: string;
}

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
  // Optional the same way — older responses (or products created before
  // this field existed) won't have it, so this falls back to "physical".
  product_type?: ProductType;
  affiliate_url?: string | null;
  affiliate_cta_text?: string | null;
  // Added 2026-08-31 — optional so older/cached responses without them
  // still map safely.
  faq?: RawFaq[];
  shipping_note?: string | null;
  // Confirmed live 2026-09-03 — the real per-product highlight/spec field
  // we'd asked ExiusCart for (icon + label pairs, e.g. "1 Year premium
  // Access"). Optional the same way as everything else added after launch.
  highlights?: RawHighlight[];
  // Real resolved category slug sent directly on the product now — no
  // longer need to cross-reference /categories by id for this (kept as a
  // fallback below in case an older cached response lacks it).
  category_slug?: string;
  // Real aggregate rating/review count fields, confirmed live alongside
  // highlights — null/0 until a product actually has reviews.
  avg_rating?: number | null;
  review_count?: number;
}

function mapFaq(raw: RawFaq[] | undefined): ProductFaq[] {
  return (raw ?? []).map((f) => ({ question: f.question, answer: f.answer }));
}

function mapHighlights(raw: RawHighlight[] | undefined): ProductSpec[] {
  return (raw ?? []).map((h) => ({ icon: h.icon, label: h.label }));
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

function mapProduct(raw: RawProduct, categorySlugById: Map<string, string>): Product {
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
    // Real category slug — ExiusCart now sends it directly on the product
    // (confirmed live 2026-09-03), so this no longer depends on the
    // /categories cross-reference except as a fallback for an older
    // cached response that predates the field.
    categorySlug:
      raw.category_slug ??
      (raw.category_id !== null
        ? (categorySlugById.get(String(raw.category_id)) ?? String(raw.category_id))
        : "uncategorized"),
    inStock: raw.in_stock,
    stockCount: raw.quantity,
    // Bundle isn't in the public API yet — stays null until it is.
    bundle: null,
    quantityTiers: mapQuantityTiers(raw.quantity_tiers),
    // Real fields now, confirmed live 2026-09-03 — null/0 until a product
    // actually has reviews, never a fabricated number.
    rating: raw.avg_rating ?? null,
    reviewCount: raw.review_count ?? null,
    specs: mapHighlights(raw.highlights),
    testimonials: [],
    // Real counters, straight through — null (not 0) when ExiusCart hasn't
    // sent the field at all, so "0" is never confused with "not available".
    viewCount: raw.view_count ?? null,
    unitsSold: raw.units_sold ?? null,
    variants: mapVariants(raw.variants),
    productType: raw.product_type ?? "physical",
    affiliateUrl: raw.affiliate_url ?? null,
    affiliateCtaText: raw.affiliate_cta_text ?? null,
    faq: mapFaq(raw.faq),
    shippingNote: raw.shipping_note ?? null,
    tags: raw.tags ?? [],
  };
}

// Categories load in parallel with products and get turned into an id ->
// slug lookup for mapProduct(). getCategories() is cached for 5 minutes
// (see categories.ts) so this doesn't add a real extra request per call.
async function loadCategorySlugMap(): Promise<Map<string, string>> {
  try {
    const categories = await getCategories();
    return new Map(categories.map((c) => [c.id, c.slug]));
  } catch {
    // /categories being down shouldn't take /products down with it —
    // mapProduct() falls back to the raw numeric id when a product's
    // category isn't in the map.
    return new Map();
  }
}

export async function getProducts(params?: { category?: string; collection?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.collection) query.set("collection", params.collection);
  const qs = query.toString();

  const [res, categorySlugById] = await Promise.all([
    fetch(storeUrl(`/products${qs ? `?${qs}` : ""}`), { next: { revalidate: 60 } }),
    loadCategorySlugMap(),
  ]);
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const raw: RawProduct[] = await res.json();
  return raw.map((p) => mapProduct(p, categorySlugById));
}

export async function getProduct(slug: string): Promise<Product> {
  const [res, categorySlugById] = await Promise.all([
    fetch(storeUrl(`/products/${slug}`), { next: { revalidate: 60 } }),
    loadCategorySlugMap(),
  ]);
  if (!res.ok) throw new Error(`Failed to load product "${slug}": ${res.status}`);
  const raw: RawProduct = await res.json();
  return mapProduct(raw, categorySlugById);
}
