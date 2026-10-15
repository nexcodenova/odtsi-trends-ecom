import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";
import { CartContent } from "@/components/cart/cart-content";

export const metadata: Metadata = PRIVATE_PAGE;

// Entirely derived from localStorage at runtime — a static shell has
// nothing real to show, so skip prerendering it at build time. Has to live
// in this server wrapper: Next.js ignores this export in a "use client" file.
export const dynamic = "force-dynamic";

export default function CartPage() {
  return <CartContent />;
}
