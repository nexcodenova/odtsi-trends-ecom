"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, Search, ShoppingCart, User, ChevronDown, Flame, Tag, Layers, Gift, Newspaper, Wallet, Brain } from "lucide-react";
import type { Category } from "@odtsi/exiuscart-client";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

const QUICK_LINKS = [
  { label: "Trending Now", href: "/collection/trending", icon: Flame },
  { label: "On Sale", href: "/collection/on-sale", icon: Tag },
  { label: "Collections", href: "/collections", icon: Layers },
  { label: "Gifts", href: "/collection/gifts", icon: Gift },
  { label: "Blogs", href: "/blog", icon: Newspaper },
];

// Row 1 (logo/search/icons) always stays put. Row 2 (categories/links) hides
// the moment you scroll down at all, and stays hidden — even while scrolling
// back up — until you're all the way back at the top of the page.
function useRow2Visible() {
  const [visible, setVisible] = useState(true);
  const ticking = useRef(false);

  useEffect(() => {
    function update() {
      setVisible(window.scrollY <= 4);
      ticking.current = false;
    }

    function handleScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return visible;
}

function NavIconLink({
  href,
  label,
  className = "",
  count,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 text-white/90 transition-colors hover:text-white ${className}`}
    >
      <span className="relative">
        {children}
        {!!count && count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-extrabold leading-none text-action-ink">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="text-xs font-semibold leading-none">{label}</span>
    </Link>
  );
}

// Row 2 clips its own overflow (for the scroll-collapse animation) and
// scrolls horizontally, so a normal absolutely-positioned dropdown panel
// would get cut off. Portaling it to <body> with fixed coordinates escapes
// both ancestor overflow clips entirely.
function CategoriesDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white sm:gap-2 sm:px-5 sm:py-2.5 sm:text-base"
      >
        <Menu size={16} className="sm:hidden" />
        <Menu size={19} className="hidden sm:block" />
        All Categories
        <ChevronDown size={16} className={`transition-transform sm:hidden ${open ? "rotate-180" : ""}`} />
        <ChevronDown size={19} className={`hidden transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted &&
        open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-[100] w-[min(90vw,420px)] rounded-2xl border border-black/10 bg-white p-5 shadow-xl"
          >
            {categories.length === 0 ? (
              <p className="p-2 text-sm text-[#8B8880]">No categories yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={() => setOpen(false)}
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
          </div>,
          document.body,
        )}
    </>
  );
}

export function Navbar({ categories }: { categories: Category[] }) {
  const row2Visible = useRow2Visible();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-sm">
      {/* Row 1 — mobile: menu, logo, cart, account. Desktop: full bar with search + currency + icons. Always visible. */}
      <div className="flex items-center gap-4 bg-primary px-4 py-3 sm:gap-5 sm:px-[20px] sm:py-4">
        <button type="button" aria-label="Open menu" className="text-white sm:hidden">
          <Menu size={24} />
        </button>

        {/* Placeholder wordmark — swap for the real ODTSI logo once it's ready */}
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          ODTSI
        </Link>

        {/* Search — inline on desktop, its own full-width row on mobile (below) */}
        <div className="ml-4 hidden h-10 max-w-2xl flex-1 items-stretch overflow-hidden rounded-full bg-white/90 sm:flex">
          <input
            type="search"
            placeholder="Search products..."
            className="flex-1 bg-transparent px-4 text-base text-primary outline-none placeholder:text-primary/50"
          />
          <button
            type="button"
            aria-label="Search"
            className="flex w-12 items-center justify-center rounded-r-full bg-action text-action-ink"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Wallet/Wishlist/Need to Talk — right side, right after the search
            bar, with a little extra room before the edge of the header. */}
        <div className="ml-auto mr-2 flex items-center gap-5 sm:mr-5 sm:gap-7">
          <NavIconLink href="/wallet" label="Wallet" className="hidden sm:flex">
            <Wallet size={24} />
          </NavIconLink>
          <NavIconLink href="/wishlist" label="Wishlist" className="hidden sm:flex" count={wishlistItems.length}>
            <Heart size={24} />
          </NavIconLink>
          {/* Deliberately not the small stacked icon+caption style the rest
              of this row uses — bigger text, icon beside it, stands out. */}
          <Link
            href="/contact"
            className="hidden items-center gap-1.5 text-white/90 transition-colors hover:text-white sm:flex"
          >
            <Brain size={22} className="animate-pulse" />
            <span className="text-sm font-extrabold">Need to Talk</span>
          </Link>
          <NavIconLink href="/cart" label="Cart" className="ml-2 sm:ml-5" count={cartCount}>
            <ShoppingCart size={22} className="sm:hidden" />
            <ShoppingCart size={24} className="hidden sm:block" />
          </NavIconLink>
          <NavIconLink href="/account" label="Account" className="hidden sm:flex">
            <User size={24} />
          </NavIconLink>
        </div>
      </div>

      {/* Mobile-only search row — search is too important to hide behind a tap on an e-commerce site. Always visible. */}
      <div className="flex h-14 items-stretch bg-primary px-4 pb-3 sm:hidden">
        <div className="flex flex-1 items-stretch overflow-hidden rounded-full bg-white/90">
          <input
            type="search"
            placeholder="Search products..."
            className="flex-1 bg-transparent px-4 text-sm text-primary outline-none placeholder:text-primary/50"
          />
          <button
            type="button"
            aria-label="Search"
            className="flex w-14 items-center justify-center rounded-r-full bg-action text-action-ink"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Row 2 — collapses on scroll-down, reappears on scroll-up. Fixed max-height
          instead of an animated fr-unit, so the sticky header's height changes
          predictably instead of fighting the browser's sticky recalculation. */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          row2Visible ? "max-h-16 sm:max-h-[68px]" : "max-h-0"
        }`}
      >
        <div className="flex items-center gap-6 overflow-x-auto bg-[#F6F5F3] px-4 py-3 [scrollbar-width:none] sm:px-[20px] sm:py-3.5 [&::-webkit-scrollbar]:hidden">
            <CategoriesDropdown categories={categories} />

            <div className="flex flex-1 items-center justify-between gap-6">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#55524C] transition-colors hover:text-primary sm:gap-2 sm:text-base"
                >
                  <Icon size={16} className="sm:hidden" />
                  <Icon size={19} className="hidden sm:block" />
                  {label}
                </Link>
              ))}
            </div>
        </div>
      </div>
    </header>
  );
}
