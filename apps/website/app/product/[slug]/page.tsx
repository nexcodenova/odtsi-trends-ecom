import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getProduct } from "@odtsi/exiuscart-client";
import { Price } from "@/components/shared/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { FeatureHighlights } from "@/components/product/feature-highlights";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { BundleOfferSection } from "@/components/product/bundle-offer-section";
import { WhatCustomersSay } from "@/components/product/what-customers-say";
import { ProductDescription } from "@/components/product/product-description";
import { SecureCheckoutStrip } from "@/components/product/secure-checkout-strip";

const BENEFITS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Fast, tracked delivery" },
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 lg:px-8">
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
          <ProductGallery
            images={galleryImages}
            videos={product.videos}
            productName={product.name}
            badge={discountBadge}
          />

          {product.specs.length > 0 && <FeatureHighlights specs={product.specs} />}
        </div>

        <div>
          {product.rating !== null && product.reviewCount !== null && (
            <div className="flex items-center gap-2 text-[12.5px] text-[#716D67]">
              <span className="tracking-[1px] text-action">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </div>
          )}

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
              <span className="rounded-full bg-[#F6F5F3] px-3 py-1 text-[11px] font-extrabold text-action">
                Save <Price amount={savings} />
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-bold text-status">
            {product.inStock ? "In Stock — Order Now Before It's Gone" : "Out of Stock"}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-y border-black/5 py-4">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4844]">
                <Icon size={16} className="text-action" />
                {label}
              </span>
            ))}
          </div>

          <AddToCartSection product={product} />

          {product.bundle && <BundleOfferSection product={product} bundle={product.bundle} />}

          <SecureCheckoutStrip />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 border-t border-black/5 pt-8 lg:grid-cols-2">
        {product.description && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#8B8880]">Description</h2>
            <div className="mt-3">
              <ProductDescription html={product.description} />
            </div>
          </div>
        )}

        <WhatCustomersSay testimonials={product.testimonials} />
      </div>
    </div>
  );
}
