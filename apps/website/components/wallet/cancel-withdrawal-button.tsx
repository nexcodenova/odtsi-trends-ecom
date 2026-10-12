"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readError } from "@/components/account/form-status";

// Only rendered for pending requests — the held amount returns to the wallet.
export function CancelWithdrawalButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/wallet/payout-requests/${encodeURIComponent(id)}/cancel`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError(await readError(res));
      return;
    }
    router.refresh();
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="text-xs font-bold text-[#B9412E] underline-offset-2 hover:underline disabled:opacity-60"
      >
        {loading ? "Cancelling..." : "Cancel"}
      </button>
      {error && <span className="text-[11px] font-semibold text-red-600">{error}</span>}
    </span>
  );
}
