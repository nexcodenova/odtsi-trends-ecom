"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackStorefrontEvent } from "@odtsi/exiuscart-client";

// Counts every non-product page toward ExiusCart's Website Traffic chart.
// Product pages are skipped on purpose: AddToCartSection already sends a
// "view" for them, and ExiusCart asks for page OR view per load, not both.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/product/")) return;
    trackStorefrontEvent({ event: "page", path: pathname });
  }, [pathname]);

  return null;
}
