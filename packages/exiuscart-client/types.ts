export interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  // null = a top-level (Main) category. Set = this is a Sub or Sub-sub
  // category nested under that parent. ExiusCart's public /categories
  // endpoint returns all 3 levels flattened in one list — this is the only
  // way to tell which level a given category is at.
  parentId: string | null;
}

export interface BundleOfferItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
}

export interface BundleOffer {
  id: string;
  // The other product(s) in the bundle — not including the current product.
  items: BundleOfferItem[];
  // Real discounted total for buying everything together. This is a preview
  // only — the trusted price is recalculated by ExiusCart at checkout, never
  // taken as-is from the frontend.
  bundlePrice: number;
  regularTotal: number;
}

export interface QuantityTier {
  quantity: number;
  // Total price for buying exactly this many — not a per-unit price.
  price: number;
  // e.g. "Standard Pack", "Premium Pack (Best Value)" — optional. Falls back
  // to "Buy {quantity}" in the UI when not set.
  label?: string;
  // e.g. "Save £15", "Most Popular" — optional, purely presentational.
  badge?: string;
  badgeType?: "save" | "popular" | "value";
  // Pre-selected when the page first loads. If none are marked, the first
  // tier is selected by default.
  recommended?: boolean;
}

export interface ProductSpec {
  icon: string;
  label: string;
}

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductTestimonial {
  id: string;
  customerName: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface ProductVideo {
  url: string;
  // e.g. "youtube", "tiktok" — whatever platform ExiusCart resolved it from.
  platform: string;
  // Resolved server-side via the platform's oEmbed API — null only for a
  // video carried over from the old single video_url field.
  thumbnailUrl: string | null;
  title: string | null;
  // Real oEmbed <iframe> snippet from YouTube/TikTok, passed through
  // ExiusCart — trusted the same way any other ExiusCart API field is,
  // not arbitrary user input. Null falls back to linking out to `url`.
  embedHtml: string | null;
}

export interface ProductVariant {
  id: string;
  // Both nullable — a product can vary by size only, color only, or both.
  size: string | null;
  color: string | null;
  colorHex: string | null;
  sku: string;
  stockCount: number;
  inStock: boolean;
  // Each variant has its own real price and image — different sizes of the
  // same product are frequently priced differently (e.g. 2XL/3XL upcharges).
  price: number;
  imageUrl: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  imageUrl: string;
  images: string[];
  // Real product videos only — empty until the seller adds one. Falls back
  // to wrapping the legacy single video_url field if that's all a product
  // has, so nothing already live loses its video.
  videos: ProductVideo[];
  categorySlug: string;
  inStock: boolean;
  stockCount: number | null;
  bundle: BundleOffer | null;
  // Volume pricing on this one product (buy 1 for $10, buy 4 for $35, etc.)
  // Empty when the product just has a normal single price.
  quantityTiers: QuantityTier[];
  // Real rating only — null until ExiusCart actually has review data, never
  // a fabricated number.
  rating: number | null;
  reviewCount: number | null;
  // Short spec highlights shown as icon chips (e.g. "30H Playtime").
  specs: ProductSpec[];
  // Real customer testimonial videos only — empty until they exist.
  testimonials: ProductTestimonial[];
  // Real counters only, straight from ExiusCart — null until those fields
  // exist there. Never estimated, multiplied, or padded on this side.
  viewCount: number | null;
  unitsSold: number | null;
  // Real color/size options only — empty for products that don't vary.
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface Order {
  orderNumber: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: number;
  currency: string;
}
