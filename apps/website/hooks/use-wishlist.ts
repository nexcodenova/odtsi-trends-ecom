"use client";

import { useEffect, useState } from "react";
import { getWishlist, WISHLIST_UPDATED_EVENT, type WishlistItem } from "@/lib/wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getWishlist());

    function handleUpdate() {
      setItems(getWishlist());
    }

    window.addEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { items };
}
