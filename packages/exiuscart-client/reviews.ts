import { storeUrl } from "./config";
import type { ProductReview } from "./types";

// Not live on ExiusCart yet (confirmed via direct testing — real 404s, not
// an assumption) — callers must catch and show an honest empty/error state,
// same as checkout and customer accounts before those went live.

interface RawReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function mapReview(raw: RawReview): ProductReview {
  return { id: String(raw.id), customerName: raw.customer_name, rating: raw.rating, comment: raw.comment, createdAt: raw.created_at };
}

export async function getReviews(slug: string): Promise<ProductReview[]> {
  const res = await fetch(storeUrl(`/products/${slug}/reviews`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
  const raw: RawReview[] = await res.json();
  return raw.map(mapReview);
}

export async function submitReview(
  slug: string,
  payload: { rating: number; comment: string },
  token: string,
): Promise<ProductReview> {
  const res = await fetch(storeUrl(`/products/${slug}/reviews`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to submit review: ${res.status}`);
  return mapReview(await res.json());
}
