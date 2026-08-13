"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Star, Gift, PenLine } from "lucide-react";
import type { ProductReview } from "@odtsi/exiuscart-client";

interface Props {
  slug: string;
  reviews: ProductReview[];
  isLoggedIn: boolean;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
          <Star size={22} className={n <= value ? "fill-action text-action" : "text-[#D8D5CE]"} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ slug, reviews, isLoggedIn }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "submitted">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Pick a star rating first.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    const res = await fetch(`/api/reviews/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      setStatus("submitted");
      return;
    }
    const data = await res.json().catch(() => null);
    setErrorMessage(data?.error ?? "Something went wrong — try again.");
    setStatus("error");
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">What Our Customers Say</h2>

      {reviews.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#16161A]">{r.customerName}</p>
                <span className="tracking-[1px] text-action">
                  {"★".repeat(r.rating)}
                  <span className="text-[#D8D5CE]">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4844]">{r.comment}</p>
              <p className="mt-2 text-xs text-[#8B8880]">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#716D67]">No reviews yet — be the first to review and earn 1% cashback.</p>
      )}

      <div className="mt-6 rounded-2xl border border-black/10 p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-status">
          <Gift size={14} />
          Leave a review and earn 1% of this product&apos;s price back in your ODTSI Wallet.
        </p>

        {!isLoggedIn ? (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white transition hover:bg-primary-hover"
          >
            <PenLine size={16} />
            Add Review
          </button>
        ) : status === "submitted" ? (
          <p className="mt-3 text-sm font-bold text-status">
            Thanks for the review — it&apos;s in. Cashback lands once ExiusCart&apos;s review system is connected.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <StarPicker value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="What did you think?"
              className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm text-[#16161A] outline-none focus:border-action"
            />
            {status === "error" && <p className="text-xs font-bold text-[#C05A32]">{errorMessage}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-11 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-sm font-extrabold text-[#16161A] transition hover:brightness-105 disabled:opacity-60"
            >
              {status === "loading" ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
