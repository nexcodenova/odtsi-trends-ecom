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

// A bundle product's parts, from ExiusCart's `kit` (detail endpoint only;
// null when the product isn't a bundle). Prices are in the store currency.
export interface KitOption {
  variantId: string;
  title: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stockCount: number | null;
}

export interface KitPart {
  productId: string;
  name: string;
  slug: string | null;
  imageUrl: string;
  quantity: number;
  price: number;
  // Empty when the part has no choice — checkout picks it automatically.
  options: KitOption[];
}

export interface ProductKit {
  parts: KitPart[];
  // How many whole bundles the parts' stock makes.
  inStock: number;
  // The parts bought on their own, and that minus the bundle price.
  partsValue: number;
  saving: number;
}

// One option picked for one part — sent to checkout as bundle_selections.
export interface BundleSelection {
  componentProductId: string;
  variantId: string;
}

// Seller-made offers (ExiusCart's offers[]). Checkout prices them itself;
// these are only for showing the offer before then.
export interface OfferTier {
  qty: number;
  percent: number;
}

export interface OfferGetProduct {
  productId: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  slug: string | null;
}

// How the seller wants an offer drawn, set per offer in ExiusCart (the
// same choice its admin preview shows). Not in the public docs yet; any
// value we don't know comes through as "list".
export type OfferStyle = "list" | "cards" | "photos" | "pills" | "bold";

export type ProductOffer =
  | { id: string; kind: "quantity_breaks"; title: string; style: OfferStyle; tiers: OfferTier[] }
  | {
      id: string;
      kind: "bxgy";
      title: string;
      style: OfferStyle;
      buyQty: number;
      getQty: number;
      getPercent: number;
      // true = the free/discounted units are this same product.
      same: boolean;
      // The other product(s) Y, when same is false. Full details on the
      // product page; the list endpoint only sends their ids.
      get: OfferGetProduct[];
      getProductIds: string[];
    }
  // A set of products sold together at percent off ("Bundle & save"). A
  // product can be in several. Picking one adds every item to the cart at
  // full price; checkout takes the saving off itself.
  | { id: string; kind: "bundle"; title: string; style: OfferStyle; percent: number; items: OfferBundleItem[] }
  // Any other kind (e.g. a free gift) — shown by title only.
  | { id: string; kind: "other"; rawKind: string; title: string };

// One product in a bundle offer. ExiusCart sends only product_id + quantity;
// `product` is filled in from the store's product list on the product page
// (null on cards, or when the product isn't listed).
export interface OfferBundleItem {
  productId: string;
  quantity: number;
  product: Product | null;
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
  createdAt: string | null;
  // Real photo a reviewer attached — ExiusCart's own review widget calls
  // this "Review photo" (proof-of-purchase style), separate from the
  // product's own images. Null means this review has none, not an error.
  photoUrl: string | null;
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
  // ExiusCart sends null when a variant has no price of its own; the mapper
  // fills in the product price then, so this is always a number here.
  price: number;
  imageUrl: string;
}

export type ProductType = "physical" | "digital" | "affiliate";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  // "physical" for every real product today — digital and affiliate exist
  // in ExiusCart's schema but no seller has created one of either yet.
  productType: ProductType;
  // Only set when productType is "affiliate" — the external destination
  // and the seller-chosen button label (falls back to "Buy Now" if blank).
  affiliateUrl: string | null;
  affiliateCtaText: string | null;
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
  // Seller ticked "free shipping" on this product.
  freeShipping: boolean;
  // True for a bundle product (also sent on the list endpoint, for badges).
  isBundle: boolean;
  // The bundle's parts — product detail only, null otherwise.
  kit: ProductKit | null;
  // Live offers covering this product. When a quantity-break offer covers
  // it, quantityTiers comes back empty (the offer replaces them).
  offers: ProductOffer[];
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
  // Seller-written Q&A, added 2026-08-31 — empty on every real product
  // seen so far, so the exact per-entry shape (beyond an array existing)
  // isn't confirmed yet. Render only if non-empty.
  faq: ProductFaq[];
  // Physical products only, same date — free-text note from the seller
  // about shipping (e.g. handling time). Null when not set.
  shippingNote: string | null;
  // Real seller-set tags — was already coming back from ExiusCart on every
  // product but never mapped or shown anywhere. Empty array, not null,
  // when a product has none.
  tags: string[];
  // Ordered shipping journey (e.g. "Ordered → Dispatched → Delivered"),
  // rendered as an arrow flow. Empty means fall back to shippingNote.
  shippingSteps: string[];
  // Seller-set SEO. When seoTitle/metaDescription are set they're used
  // as-is for <title>/<meta description>; seoKeywords only feed a built
  // title/description when those are empty (never dumped as <meta keywords>).
  seoTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string[];
  // Supplier's sales/rating data (added 2026-11). Null when ExiusCart has
  // none or the seller switched it off — hide everything it feeds then.
  // Never goes into schema.org aggregateRating: Google only allows the
  // store's own reviews there.
  supplierProof: SupplierProof | null;
}

export interface SupplierProof {
  // Pre-rounded by ExiusCart (e.g. "12,000+ sold") — show as-is.
  soldLabel: string | null;
  soldCount: number | null;
  rating: number | null;
  reviewCount: number | null;
  positiveRate: number | null;
  starCounts: Record<string, number>;
  // Upper bound, shown as "Arrives in up to N days".
  deliveryDays: number | null;
  shipsFrom: string[];
  sellingPoints: string[];
  faq: ProductFaq[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  // Full HTML body — only sent on the single-post endpoint, null in lists.
  content: string | null;
  coverImageUrl: string | null;
  authorName: string | null;
  tags: string[];
  ctaText: string | null;
  ctaUrl: string | null;
  publishedAt: string | null;
}

export interface Popup {
  id: string;
  type: string;
  title: string;
  message: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  discountCode: string | null;
  imageUrl: string | null;
  delaySeconds: number;
}

export interface SignupFormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string[] | null;
}

export interface SignupForm {
  id: string;
  title: string;
  description: string | null;
  fields: SignupFormField[];
  successMessage: string | null;
  discountCode: string | null;
  delaySeconds: number;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  // Bundle products only: the option picked for each part with a choice.
  bundleSelections?: BundleSelection[];
  // ExiusCart's real numeric variant id (size/color) — without it checkout
  // prices and decrements the base product instead of the chosen variant.
  variantId?: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  // Real field names, confirmed against ExiusCart's own address_display()
  // helper (2026-10-01) — it only recognizes these specific keys when
  // rendering a human-readable address on the seller's dashboard/packing
  // slip. The old line1/line2/postcode shape silently stored fine (the
  // validator JSON-dumps any object) but displayed as a blank street line
  // on their side, since none of those keys matched what it looks for.
  shippingAddress: {
    name?: string;
    address: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    country: string;
  };
  // Required for every real gateway (Stripe/Whop/PayPal) — ExiusCart
  // 422s without them. Full absolute URLs (the gateway's hosted page
  // redirects the browser straight to these after payment).
  returnUrl: string;
  cancelUrl: string;
  // Validated again (and capped) by ExiusCart at checkout.
  discountCode?: string;
  // Logged-in shoppers only — needs the customer's token on the request.
  // ExiusCart caps it at their real balance.
  useWalletAmount?: number;
}

// POST /discounts/preview — the same engine checkout runs, with no order.
export interface CartPreviewOffer {
  id: string;
  title: string;
  amount: number;
  freeShipping: boolean;
}

export interface CartPreviewGift {
  title: string;
  imageUrl: string | null;
  quantity: number;
}

export interface CartPreview {
  // The code that applied, or null (none sent, or it lost to a better offer).
  code: string | null;
  codeDiscount: number;
  // Set when a code was sent but didn't apply alongside the offers.
  codeNote: string | null;
  offers: CartPreviewOffer[];
  // Everything off the subtotal: code + offers.
  totalDiscount: number;
  freeShipping: boolean;
  // Added to the order by checkout at no charge — never put in the cart.
  gifts: CartPreviewGift[];
  // "Add 1 more to save 15%" style nudges, already worded.
  hints: string[];
  total: number | null;
}

// What ExiusCart's real /checkout actually returns — confirmed directly
// against its code (2026-10-01): a flat order_number/total, plus one
// `payment` object whose shape is the same across every real gateway
// (Stripe/Whop/PayPal all return {gateway, order_id, redirect_url} — only
// PayHere, not currently wired to any real storefront checkout path,
// would differ). This replaced an earlier guess ({order, clientSecret})
// that never matched any real gateway's response.
export interface CheckoutResult {
  orderNumber: string;
  total: number;
  payment: {
    gateway: string;
    orderId: string;
    // Send the shopper here to actually pay — present for every real
    // gateway ExiusCart's storefront checkout currently supports.
    redirectUrl?: string;
  };
}

export interface Order {
  orderNumber: string;
  // Real status enum, confirmed by ExiusCart directly (2026-08-31):
  // pending (checkout creation) -> confirmed (payment gateway confirms,
  // automatic) -> processing/shipped/delivered (seller sets manually) or
  // cancelled. "paid" was wrong — the real value is "confirmed".
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  // Confirmed (2026-10-01): neither /checkout nor /orders/{order_number}
  // actually returns a currency field — this was always undefined in
  // real responses, silently. Null here means "ExiusCart doesn't tell us
  // this", not "no currency" — callers fall back to a known real currency
  // from context (the cart/product the order came from) when displaying.
  currency: string | null;
  // Real tracking fields ExiusCart added 2026-08-31 — null until the
  // seller marks the order shipped, not an error or "not supported".
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
  estimatedDelivery: string | null;
}
