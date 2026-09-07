"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Heart, ShoppingCart, User, X } from "lucide-react";
import type { Category } from "@odtsi/exiuscart-client";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

// The one thing that actually changes how the site feels to use on a
// phone: a fixed thumb-reach bar, present on every page, not just at
// install time. Desktop already has all of this in the top navbar, so
// this only renders below the sm breakpoint.

function TabLink({
  href,
  label,
  active,
  count,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
        active ? "text-primary" : "text-[#8B8880]"
      }`}
    >
      <span className="relative">
        {children}
        {!!count && count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-action px-1 text-[9px] font-extrabold leading-none text-action-ink">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className={`text-[10px] leading-none ${active ? "font-extrabold" : "font-semibold"}`}>{label}</span>
    </Link>
  );
}

// Real categories, same data the top navbar's dropdown uses — a bottom
// sheet instead of a dropdown since this is a bottom-anchored tab, not
// a button with room to drop a panel below it.
function CategoriesSheet({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end bg-black/40 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[75vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <span className="text-base font-extrabold text-[#16161A]">All Categories</span>
          <button type="button" onClick={handleClose} aria-label="Close" className="text-[#4A4844]">
            <X size={22} />
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="p-5 text-sm text-[#8B8880]">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-x-3 gap-y-5 p-5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={handleClose}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-light">
                  {category.imageUrl ? (
                    <Image src={category.imageUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="text-xs font-semibold leading-tight text-[#3A3835]">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function BottomNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] sm:hidden"
        aria-label="Primary"
      >
        <TabLink href="/" label="Home" active={pathname === "/"}>
          <Home size={22} />
        </TabLink>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[#8B8880] transition-colors"
        >
          <Grid3x3 size={22} />
          <span className="text-[10px] font-semibold leading-none">Categories</span>
        </button>

        <TabLink href="/wishlist" label="Wishlist" active={pathname === "/wishlist"} count={wishlistItems.length}>
          <Heart size={22} />
        </TabLink>

        <TabLink href="/cart" label="Cart" active={pathname === "/cart"} count={cartCount}>
          <ShoppingCart size={22} />
        </TabLink>

        <TabLink href="/account" label="Account" active={pathname === "/account"}>
          <User size={22} />
        </TabLink>
      </nav>

      {mounted && sheetOpen && <CategoriesSheet categories={categories} onClose={() => setSheetOpen(false)} />}
    </>
  );
}
