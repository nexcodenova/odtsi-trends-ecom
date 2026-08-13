import { WishlistContent } from "@/components/wishlist/wishlist-content";

// Entirely derived from localStorage at runtime — a static shell has
// nothing real to show, so skip prerendering it at build time. Has to live
// in this server wrapper: Next.js ignores this export in a "use client" file.
export const dynamic = "force-dynamic";

export default function WishlistPage() {
  return <WishlistContent />;
}
