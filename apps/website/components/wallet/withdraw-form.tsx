"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@odtsi/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStatusMessage, readError, type FormStatus } from "@/components/account/form-status";

// Sends a withdrawal request to ExiusCart — the amount goes on hold and
// the seller pays it out to the saved payout method. Every rule (minimum,
// balance, enabled, payout-change hold) is enforced again on its side.
export function WithdrawForm({
  balance,
  currency,
  minAmount,
  destination,
}: {
  balance: number;
  currency: string;
  minAmount: number;
  // e.g. "PayPal · jane@example.com" — null until one is saved.
  destination: string | null;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  if (!destination) {
    return (
      <p className="text-sm text-[#716D67]">
        <Link href="/account" className="font-bold text-primary underline-offset-2 hover:underline">
          Add a payout method
        </Link>{" "}
        to withdraw your balance.
      </p>
    );
  }

  if (balance <= 0 || balance < minAmount) {
    return (
      <p className="text-sm text-[#716D67]">
        You can withdraw once your balance reaches {formatCurrency(Math.max(minAmount, 0.01), currency)}.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch("/api/wallet/payout-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    setStatus({ kind: "success", message: "Withdrawal requested — it'll be paid out once approved." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="withdraw-amount">Amount ({currency})</Label>
        <Input
          id="withdraw-amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={minAmount > 0 ? minAmount : 0.01}
          max={balance}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs text-[#8B8880]">Paid to {destination}</p>
      </div>
      <FormStatusMessage status={status} />
      <Button type="submit" variant="action" disabled={status.kind === "loading"}>
        {status.kind === "loading" ? "Sending request..." : "Request Withdrawal"}
      </Button>
    </form>
  );
}
