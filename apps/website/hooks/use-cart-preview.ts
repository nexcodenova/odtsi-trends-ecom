"use client";

import { useEffect, useState } from "react";
import { previewCart, type CartPreview } from "@odtsi/exiuscart-client";
import { toCheckoutItems, type CartItem } from "@/lib/cart";

// Live offer/gift/hint pricing for the cart, from ExiusCart's own engine
// (the same one checkout uses). Re-runs shortly after the cart or code
// changes. If the code stops applying, the cart is priced without it and
// codeError says why.
export function useCartPreview(items: CartItem[], options: { code?: string | null; email?: string } = {}) {
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkoutItems = toCheckoutItems(items);
  const key = JSON.stringify([checkoutItems, options.code ?? null, options.email ?? null]);

  useEffect(() => {
    if (checkoutItems.length === 0) {
      setPreview(null);
      setCodeError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await previewCart(checkoutItems, { code: options.code ?? undefined, email: options.email });
        if (!cancelled) {
          setPreview(result);
          setCodeError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (options.code) setCodeError(err instanceof Error ? err.message : "That code couldn't be applied.");
        // Still show the offers without the code; a failed preview just
        // means the cart shows plain prices (checkout re-prices anyway).
        try {
          const fallback = await previewCart(checkoutItems, { email: options.email });
          if (!cancelled) setPreview(fallback);
        } catch {
          if (!cancelled) setPreview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { preview, codeError, loading };
}
