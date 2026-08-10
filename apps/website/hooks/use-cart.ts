"use client";

import { useEffect, useState } from "react";
import { getCart, cartSubtotal, CART_UPDATED_EVENT, type CartItem } from "@/lib/cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());

    function handleUpdate() {
      setItems(getCart());
    }

    window.addEventListener(CART_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { items, subtotal: cartSubtotal(items) };
}
