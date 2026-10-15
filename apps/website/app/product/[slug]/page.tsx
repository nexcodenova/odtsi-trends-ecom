import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Truck } from "lucide-react";
import { getProduct, getReviews, type Product, type ProductReview } from "@odtsi/exiuscart-client";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { BestSellerBadge } from "@/components/product/best-seller-badge";
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
import { getWalletCashbackLabel } from "@/lib/wallet-rate";
import { displayPrice } from "@/lib/product-price";
import { MIN_VIEWS_FOR_POPULAR } from "@/lib/product-thresholds";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { SITE_URL, pageAlternates } from "@/lib/site";

async function loadReviews(slug: string): Promise<ProductReview[]> {
  try {
    return await getReviews(slug);
  } catch {
    // ExiusCart's reviews endpoint isn't live yet — honest empty state,
    // not fake reviews.
    return [];
  }
}

// One fetch shared by generateMetadata and the page itself.
const loadProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    return await getProduct(slug);
  } catch (err) {
    console.error("[product-page]", err);
    return null;
  }
});

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Seller-set seo_title / meta_description win as-is. Without them, a
// title/description is built from the name, the first couple of SEO
// keywords and the description — never a raw <meta keywords> dump.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};

  const keywords = product.seoKeywords.slice(0, 2).join(", ");
  const title = product.seoTitle ?? `${product.name}${keywords ? ` — ${keywords}` : ""} | ODTSI`;
  const images = (product.images.length > 0 ? product.images : [product.imageUrl]).filter(Boolean);
  const fallbackDescription = product.description ? plainText(product.description).slice(0, 155) : "";
  const description =
    product.metaDescription ??
    (fallbackDescription || `Shop ${product.name}${keywords ? ` — ${product.seoKeywords.slice(0, 3).join(", ")}` : ""} at ODTSI.`);

  return {
    // Absolute: the seller's seo_title is used exactly as written.
    title: { absolute: title },
    description,
    alternates: pageAlternates(`/product/${product.slug}`),
    openGraph: { title, description, url: `${SITE_URL}/product/${product.slug}`, images },
    twitter: { title, description, images },
  };
}

// Google Shopping / rich-result data. Only real values go in — rating is
// left out until real reviews exist, same rule as the visible page.
function productJsonLd(product: Product, price: number) {
  const url = `${SITE_URL}/product/${product.slug}`;
  const images = (product.images.length > 0 ? product.images : [product.imageUrl]).filter(Boolean);
  const description = product.metaDescription ?? (product.description ? plainText(product.description).slice(0, 5000) : undefined);
  const hasRating = product.rating !== null && product.reviewCount !== null && product.reviewCount > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    image: images,
    description,
    sku: product.id,
    brand: { "@type": "Brand", name: "ODTSI" },
    category: product.categorySlug,
    keywords: product.seoKeywords.length > 0 ? product.seoKeywords.join(", ") : undefined,
    ...(hasRating
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: price.toFixed(2),
      priceCurrency: product.currency,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await loadProduct(slug);

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
  const isBestSeller = product.viewCount !== null && product.viewCount > MIN_VIEWS_FOR_POPULAR;
  const { blocks: descriptionBlocks, images: descriptionImages } = product.description
    ? parseProductDescription(product.description)
    : { blocks: [], images: [] };
  const [reviews, cashbackLabel] = await Promise.all([loadReviews(slug), getWalletCashbackLabel()]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-5 lg:px-8">
      <JsonLd
        data={[
          productJsonLd(product, price),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: product.categorySlug, url: `${SITE_URL}/category/${product.categorySlug}` },
            { name: product.name, url: `${SITE_URL}/product/${product.slug}` },
          ]),
        ]}
      />
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
        </div>

        {/* Fixed height matching the gallery on desktop for digital, plus
            flex so AddToCartSection can stretch and pin its purchase
            controls to the bottom via its own internal mt-auto — the
            column's bottom edge lines up exactly with the image's. Sized
            taller than a physical hero needs to, since a real highlights
            list (once a seller sets one) adds real height here. */}
        <div className={isDigital ? "flex flex-col lg:h-[560px] xl:h-[590px]" : ""}>
          {/* Digi ODTSI: real, honest brand label — true of every real
              digital product, not a performance claim, so it needs no
              per-product data. Best Seller: real criterion instead — same
              >50-real-views bar the homepage's Most Viewed section already
              uses, reused (not reinvented) via one shared component, so
              both physical and digital pages judge "popular" the same way. */}
          {(isDigital || isBestSeller) && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isDigital && (
                <span className="inline-flex w-fit rounded-md bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  Digi ODTSI
                </span>
              )}
              <BestSellerBadge viewCount={product.viewCount} />
            </div>
          )}

          {product.rating !== null && product.reviewCount !== null && (
            <div className="flex items-center gap-2 text-[12.5px] text-[#716D67]">
              <span className="tracking-[1px] text-action">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </div>
          )}

          <TrustSignals viewCount={product.viewCount} unitsSold={product.unitsSold} />

          <h1
            className={`mt-2 font-extrabold leading-tight tracking-tight text-[#16161A] ${
              isDigital ? "text-[22px] sm:text-[26px]" : "text-[27px] sm:text-[32px]"
            }`}
          >
            {product.name}
          </h1>
          {product.tagline && <p className="mt-1.5 text-[14px] text-[#8B8880]">{product.tagline}</p>}

          <div className={`mt-4 ${isDigital ? "flex flex-1 flex-col" : ""}`}>
            <AddToCartSection product={product} cashbackLabel={cashbackLabel} />
          </div>

          {/* Seller's shipping journey as an arrow flow, falling back to
              their free-text note when no steps are set — physical only,
              shown only when they've actually written one. */}
          {product.productType === "physical" && product.shippingSteps.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] leading-snug text-[#716D67]">
              <Truck size={15} className="shrink-0 text-[#8B8880]" />
              {product.shippingSteps.map((step, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ArrowRight size={12} className="shrink-0 text-[#B5B2AB]" />}
                  <span className="font-semibold text-[#4A4844]">{step}</span>
                </span>
              ))}
            </div>
          )}
          {product.productType === "physical" && product.shippingSteps.length === 0 && product.shippingNote && (
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-snug text-[#716D67]">
              <Truck size={15} className="mt-0.5 shrink-0 text-[#8B8880]" />
              {product.shippingNote}
            </p>
          )}

          {/* ExiusCart emails digital products straight to the buyer with a
              secure download link and access code. */}
          {isDigital && (
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-snug text-[#716D67]">
              <Mail size={15} className="mt-0.5 shrink-0 text-[#8B8880]" />
              Delivered by email — a secure download link and access code are sent once your payment is confirmed.
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
          <PackSelector product={product} cashbackLabel={cashbackLabel} />
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
        // Tabbed layout, digital only — Description/Specifications/FAQ/
        // Reviews behind tabs instead of one continuous scroll.
        <div className="mt-10 border-t border-black/5 pt-8">
          <DigitalProductTabs
            description={product.description}
            descriptionBlocks={descriptionBlocks}
            descriptionImages={descriptionImages}
            faq={product.faq}
            reviews={reviews}
            tags={product.tags}
            specs={product.specs}
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
            <ReviewsSection reviews={reviews} />
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
