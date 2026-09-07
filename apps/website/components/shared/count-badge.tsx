"use client";

import { useEffect, useRef, useState } from "react";

// Shared by every real cart/wishlist count in the header — top navbar,
// the mobile hamburger drawer, and the bottom tab bar all show the same
// real number, so the "just went up" pop lives in one place instead of
// being re-implemented per spot.
export function CountBadge({ count, className }: { count?: number; className: string }) {
  const [pop, setPop] = useState(false);
  const prevCount = useRef(count ?? 0);

  useEffect(() => {
    const current = count ?? 0;
    if (current > prevCount.current) {
      setPop(true);
      const timer = setTimeout(() => setPop(false), 400);
      prevCount.current = current;
      return () => clearTimeout(timer);
    }
    prevCount.current = current;
  }, [count]);

  if (!count || count <= 0) return null;

  return <span className={`${className} ${pop ? "animate-badge-pop" : ""}`}>{count > 99 ? "99+" : count}</span>;
}
