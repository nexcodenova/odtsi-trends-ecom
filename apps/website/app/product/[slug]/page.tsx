import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { getProduct, getReviews, type ProductReview } from "@odtsi/exiuscart-client";
import { ProductGallery } from "@/components/product/product-gallery";
import { FeatureHighlights } from "@/components/product/feature-highlights";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { WishlistButton } from "@/components/product/wishlist-button";
import { PackSelector } from "@/components/product/pack-selector";
import { BundleOfferSection } from "@/components/product/bundle-offer-section";
import { ProductVideos } from "@/components/product/product-videos";
import { TrustSignals } from "@/components/product/trust-signals";
import { DescriptionSection } from "@/components/product/description-section";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductFaqSection } from "@/components/product/product-faq";
import { RelatedProducts } from "@/components/product/related-products";
import { DigitalTrustStrip } from "@/components/product/digital-trust-strip";
import { PhysicalTrustStrip } from "@/components/product/physical-trust-strip";
import { DigitalProductTabs } from "@/components/product/digital-product-tabs";
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
  const isDigital = product.productType === "digital";
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

      {/* Digital gets a narrower 55/45 hero split (smaller square gallery,
          more room for the info column) instead of the even 50/50 physical
          and affiliate pages use. */}
      <div className={`mt-4 grid grid-cols-1 gap-8 lg:gap-10 ${isDigital ? "lg:grid-cols-[55%_45%]" : "lg:grid-cols-2"}`}>
        <div>
          {/* Digital only — wishlist moves onto the image corner (same
              treatment ProductCard uses everywhere else) so Add to Cart can
              go full width instead of sharing the row with a square
              wishlist button. */}
          <div className="relative">
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              badge={discountBadge}
              compact={isDigital}
            />
            {isDigital && (
              <div className="absolute right-2 top-2">
                <WishlistButton product={product} variant="corner" />
              </div>
            )}
          </div>

          {product.specs.length > 0 && <FeatureHighlights specs={product.specs} />}
        </div>

        {/* Fixed height matching the gallery on desktop for digital, plus
            flex so AddToCartSection can stretch and pin its purchase
            controls to the bottom via its own internal mt-auto — the
            column's bottom edge lines up exactly with the image's. */}
        <div className={isDigital ? "flex flex-col lg:h-[500px] xl:h-[530px]" : ""}>
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

          <div className={`mt-4 ${isDigital ? "flex flex-1 flex-col" : ""}`}>
            <AddToCartSection product={product} />
          </div>

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
        </div>
      </div>

      {/* Full-width trust strip — same colorful-icon treatment for both
          real sale types, content specific to how each actually gets
          fulfilled. Affiliate gets neither: no checkout or shipping happens
          on our side for it, so none of these claims would be true. No
          invented numbers on either — every tile is a plain fact or a
          qualitative claim. */}
      {isDigital && (
        <div className="mt-10">
          <DigitalTrustStrip />
        </div>
      )}
      {product.productType === "physical" && (
        <div className="mt-10">
          <PhysicalTrustStrip />
        </div>
      )}

      {hasTiers && (
        <div className="mt-10 border-t border-black/5 pt-8">
          <PackSelector product={product} />
        </div>
      )}

      {hasVideoContent && (
        <div className="mt-10 border-t border-black/5 pt-8">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Videos</h2>
          <div className="mt-3">
            <ProductVideos videos={product.videos} testimonials={product.testimonials} />
          </div>
        </div>
      )}

      {isDigital ? (
        // Tabbed layout, digital only — Description/FAQ/Reviews behind
        // tabs instead of one continuous scroll. No Specifications tab:
        // product.specs is a flat list of highlight strings (shown in the
        // hero instead), not the label:value pairs a real specs table
        // needs — that's a real gap for ExiusCart, not something to fake.
        <div className="mt-10 border-t border-black/5 pt-8">
          <DigitalProductTabs
            slug={product.slug}
            description={product.description}
            descriptionBlocks={descriptionBlocks}
            descriptionImages={descriptionImages}
            faq={product.faq}
            reviews={reviews}
            isLoggedIn={session !== null}
            tags={product.tags}
          />
        </div>
      ) : (
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

          {/* Real seller-written Q&A only — section skips entirely when
              ExiusCart hasn't sent any, same "honest empty" rule as
              everything else on this page. */}
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
      )}

      {/* Same category, any product type — physical, digital, or affiliate
          can all show up here. Skips entirely if this product has no real
          category or nothing else real shares it. */}
      <RelatedProducts categorySlug={product.categorySlug} excludeId={product.id} />
    </div>
  );
}
