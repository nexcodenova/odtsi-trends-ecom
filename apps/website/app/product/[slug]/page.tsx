import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getProduct, getReviews, type ProductReview } from "@odtsi/exiuscart-client";
import { Price } from "@/components/shared/price";
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
import { parseProductDescription } from "@/lib/parse-product-description";
import { getSession } from "@/lib/session";

async function loadReviews(slug: string): Promise<ProductReview[]> {
  try {
    return await getReviews(slug);
  } catch {
    // ExiusCart's reviews endpoint isn't live yet — honest empty state,
    // not fake reviews.
    return [];
  }
}

const BENEFITS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Fast, Free & Tracked Delivery" },
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

  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const savings = hasDiscount ? product.compareAtPrice! - product.price : 0;
  const galleryImages = product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const discountBadge = hasDiscount
    ? `-${Math.round((1 - product.price / product.compareAtPrice!) * 100)}% Today`
    : undefined;
  const hasVideoContent = product.videos.length > 0 || product.testimonials.length > 0;
  const hasTiers = product.quantityTiers.length > 0;
  const { textHtml, images: descriptionImages } = product.description
    ? parseProductDescription(product.description)
    : { textHtml: "", images: [] };
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {hasDiscount && (
              <Price amount={product.compareAtPrice!} className="text-base text-[#a3a19c] line-through" />
            )}
            <Price amount={product.price} className="text-[30px] font-extrabold text-[#16161A]" />
            {hasDiscount && (
              <span className="animate-float rounded-full bg-action px-3 py-1 text-xs font-extrabold text-action-ink shadow-[0_4px_12px_-4px_rgba(242,183,5,0.6)]">
                Save <Price amount={savings} />
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-bold text-status">
            {product.inStock ? "In Stock — Order Now Before It's Gone" : "Out of Stock"}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 border-y border-black/5 py-5">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon size={22} />
                </span>
                <span className="text-sm font-extrabold leading-tight text-[#16161A]">{label}</span>
              </div>
            ))}
          </div>

          <AddToCartSection product={product} />

          {product.bundle && <BundleOfferSection product={product} bundle={product.bundle} />}

          <SecureCheckoutStrip />
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
              <DescriptionSection textHtml={textHtml} images={descriptionImages} />
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
      </div>
    </div>
  );
}
