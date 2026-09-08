"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/tracking";

// Search results page itself is a server component (real data fetch on the
// server) — this is just the one client sliver needed to fire the real
// retargeting event once the query is known.
export function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    if (query) trackSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return null;
}
