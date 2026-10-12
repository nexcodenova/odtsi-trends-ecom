"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@odtsi/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStatusMessage, readError, type FormStatus } from "@/components/account/form-status";
import { MIN_REDEEM_AMOUNT } from "@/lib/wallet-limits";

// Sends a withdrawal request to ExiusCart — the seller sees who asked,
// their balance, the amount, and the PayPal account to pay, then pays it
// out from ExiusCart. Nothing moves until the seller acts on it.
export function WithdrawForm({
  balance,
  currency,
  paypalEmail,
}: {
  balance: number;
  currency: string;
  paypalEmail: string | null;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  if (!paypalEmail) {
    return (
      <p className="text-sm text-[#716D67]">
        <Link href="/account" className="font-bold text-primary underline-offset-2 hover:underline">
          Save your PayPal account
        </Link>{" "}
        to withdraw your balance.
      </p>
    );
  }

  if (balance < MIN_REDEEM_AMOUNT) {
    return (
      <p className="text-sm text-[#716D67]">
        You can withdraw once your balance reaches {formatCurrency(MIN_REDEEM_AMOUNT, currency)}.
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
    setStatus({ kind: "success", message: "Withdrawal requested — it'll be sent to your PayPal once approved." });
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
          min={MIN_REDEEM_AMOUNT}
          max={balance}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs text-[#8B8880]">Paid to {paypalEmail}</p>
      </div>
      <FormStatusMessage status={status} />
      <Button type="submit" variant="action" disabled={status.kind === "loading"}>
        {status.kind === "loading" ? "Sending request..." : "Request Withdrawal"}
      </Button>
    </form>
  );
}
