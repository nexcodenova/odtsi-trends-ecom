import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getProduct, getReviews, type ProductReview } from "@odtsi/exiuscart-client";
import { ProductGallery } from "@/components/product/product-gallery";
import { FeatureHighlights } from "@/components/product/feature-highlights";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { PackSelector } from "@/components/product/pack-selector";
import { BundleOfferSection } from "@/components/product/bundle-offer-section";
import { ProductVideos } from "@/components/product/product-videos";
import { TrustSignals } from "@/components/product/trust-signals";
import { DescriptionSection } from "@/components/product/description-section";
import { ReviewsSection } from "@/components/product/reviews-section";
import { SecureCheckoutStrip } from "@/components/product/secure-checkout-strip";
import { ProductFaqSection } from "@/components/product/product-faq";
import { RelatedProducts } from "@/components/product/related-products";
import { parseProductDescription } from "@/lib/parse-product-description";
import { getSession } from "@/lib/session";
import { displayPrice } from "@/lib/product-price";

async function loadReviews(slug: string): Promise<ProductReview[]> {
  try {
    return await getReviews(slug);
  } catch {
    // ExiusCart's reviews endpoint isn't live yet — honest empty state,
    // not fake reviews.
    return [];
  }
}

// Delivery claim has to match how the product actually reaches the
// customer — a digital product is never shipped or tracked, so showing
// "Fast, Free & Tracked Delivery" on one would be a false claim.
const PHYSICAL_BENEFITS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Fast, Free & Tracked Delivery" },
  { icon: RotateCcw, label: "30-Day Money Back" },
];

const DIGITAL_BENEFITS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Delivered Instantly by Email" },
  { icon: RotateCcw, label: "30-Day Money Back" },
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    // ExiusCart's public /products/{slug} endpoint isn't live yet.
    product = null;
  }

  if (!product) {
    notFound();
  }

  const isAffiliate = product.productType === "affiliate";
  const price = displayPrice(product);
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > price;
  const galleryImages = product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const discountBadge = hasDiscount
    ? `-${Math.round((1 - price / product.compareAtPrice!) * 100)}% Today`
    : undefined;
  const hasVideoContent = product.videos.length > 0 || product.testimonials.length > 0;
  // Tiers/bundles both go through addToCart directly — never valid for an
  // affiliate product, which ExiusCart's real checkout hard-rejects with a
  // 400. Gated on productType here too, not just on the data existing.
  const hasTiers = !isAffiliate && product.quantityTiers.length > 0;
  const { blocks: descriptionBlocks, images: descriptionImages } = product.description
    ? parseProductDescription(product.description)
    : { blocks: [], images: [] };
  const [reviews, session] = await Promise.all([loadReviews(slug), getSession()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:px-8">
      <nav className="text-xs text-[#8B8880]">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/category/${product.categorySlug}`} className="hover:text-primary">
          {product.categorySlug}
        </Link>{" "}
        / <span className="text-[#4A4844]">{product.name}</span>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <ProductGallery images={galleryImages} productName={product.name} badge={discountBadge} />

          {product.specs.length > 0 && <FeatureHighlights specs={product.specs} />}
        </div>

        <div>
          {product.rating !== null && product.reviewCount !== null && (
            <div className="flex items-center gap-2 text-[12.5px] text-[#716D67]">
              <span className="tracking-[1px] text-action">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </div>
          )}

          <TrustSignals viewCount={product.viewCount} unitsSold={product.unitsSold} />

          <h1 className="mt-2 text-[27px] font-extrabold leading-tight tracking-tight text-[#16161A] sm:text-[32px]">
            {product.name}
          </h1>
          {product.tagline && <p className="mt-1.5 text-[14px] text-[#8B8880]">{product.tagline}</p>}

          <div className="mt-4">
            <AddToCartSection product={product} />
          </div>

          {/* Affiliate isn't fulfilled by us at all — no checkout, no
              shipping, no return policy to claim, so this row would be
              false for it. Physical and digital each get the claims that
              are actually true for how they're delivered. */}
          {!isAffiliate && (
            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-black/5 py-5">
              {(product.productType === "digital" ? DIGITAL_BENEFITS : PHYSICAL_BENEFITS).map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-extrabold leading-tight text-[#16161A]">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Seller's own note on shipping/handling time — physical only,
              real field from ExiusCart, shown only when they've actually
              written one. */}
          {product.productType === "physical" && product.shippingNote && (
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-snug text-[#716D67]">
              <Truck size={15} className="mt-0.5 shrink-0 text-[#8B8880]" />
              {product.shippingNote}
            </p>
          )}

          {!isAffiliate && product.bundle && <BundleOfferSection product={product} bundle={product.bundle} />}

          {/* No checkout happens on our side for affiliate — the strip's
              claims (secure checkout, SSL) wouldn't be true here. */}
          {!isAffiliate && <SecureCheckoutStrip />}
        </div>
      </div>

      {hasTiers && (
        <div className="mt-10 border-t border-black/5 pt-8">
          <PackSelector product={product} />
        </div>
      )}

      <div className="mt-10 border-t border-black/5 pt-8">
        {product.description && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Description</h2>
            <div className="mt-3">
              <DescriptionSection blocks={descriptionBlocks} images={descriptionImages} />
            </div>
          </div>
        )}

        <div className={product.description ? "mt-10" : ""}>
          <ReviewsSection slug={product.slug} reviews={reviews} isLoggedIn={session !== null} />
        </div>

        {hasVideoContent && (
          <div className="mt-10">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Videos</h2>
            <div className="mt-3">
              <ProductVideos videos={product.videos} testimonials={product.testimonials} />
            </div>
          </div>
        )}

        {/* Real seller-written Q&A only — section skips entirely when
            ExiusCart hasn't sent any, same "honest empty" rule as everything
            else on this page. */}
        {product.faq.length > 0 && (
          <div className="mt-10">
            <h2 className="text-center text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">
              Frequently Asked Questions
            </h2>
            <div className="mt-4">
              <ProductFaqSection faq={product.faq} />
            </div>
          </div>
        )}
      </div>

      {/* Same category, any product type — physical, digital, or affiliate
          can all show up here. Skips entirely if this product has no real
          category or nothing else real shares it. */}
      <RelatedProducts categorySlug={product.categorySlug} excludeId={product.id} />
    </div>
  );
}
