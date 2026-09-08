import { storeUrl } from "./config";
import type { ProductReview } from "./types";

// GET is live and real (confirmed via a genuine review showing up on a
// real product) — the public read endpoint's field is `submitted_at`, NOT
// `created_at` (that was the wrong field name, confirmed against
// ExiusCart's own _approved_reviews_out response shape directly — the
// mismatch is exactly why every real review's date rendered as "Invalid
// Date": raw.created_at was always undefined). photo_url is real too, just
// never mapped through before now.
interface RawReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  submitted_at: string | null;
  photo_url: string | null;
}

function mapReview(raw: RawReview): ProductReview {
  return {
    id: String(raw.id),
    customerName: raw.customer_name,
    rating: raw.rating,
    comment: raw.comment,
    createdAt: raw.submitted_at,
    photoUrl: raw.photo_url,
  };
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
