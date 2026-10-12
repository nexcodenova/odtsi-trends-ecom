"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import type { PayoutOption, SavedPayoutMethod } from "@odtsi/exiuscart-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsRow } from "./settings-row";
import { VerifyCodeForm } from "./verify-code-form";
import { FormStatusMessage, readError, type FormStatus } from "./form-status";

// Methods come from the store's own settings in ExiusCart (PayPal,
// Payoneer, Skrill, Wise, bank) — only the ones it accepts are offered.
// A new payout email isn't saved until the code sent to it is confirmed;
// bank details save straight away.
export function PayoutMethodForm({
  current,
  pendingSentTo,
  options,
}: {
  current: SavedPayoutMethod | null;
  pendingSentTo: string | null;
  options: PayoutOption[];
}) {
  const router = useRouter();
  const [method, setMethod] = useState(current?.method ?? options[0]?.key ?? "");
  const [account, setAccount] = useState(current?.account ?? "");
  const [accountName, setAccountName] = useState(current?.accountName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pending, setPending] = useState(pendingSentTo);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  const option = options.find((o) => o.key === method);
  const isEmail = option?.kind === "email";

  if (options.length === 0) {
    return (
      <p className="px-5 pb-5 text-sm text-[#716D67]">
        This store isn&apos;t paying out wallet balances right now — you can still spend it on your next order.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch("/api/account/payout-method", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, account, accountName: isEmail ? undefined : accountName, currentPassword }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    const body: { needsVerification: boolean; sentTo: string | null } = await res.json();
    setCurrentPassword("");
    if (body.needsVerification) {
      setPending(body.sentTo ?? account);
      setStatus({ kind: "idle" });
    } else {
      setStatus({ kind: "success", message: "Payout method saved." });
      router.refresh();
    }
  }

  const hint = current ? `${current.methodLabel} · ${current.account}` : pending ? "Waiting for confirmation" : undefined;

  return (
    <SettingsRow icon={Landmark} label={current ? "Payout Method" : "Add Payout Method"} hint={hint}>
      <div className="flex flex-col gap-4">
        {pending && (
          <VerifyCodeForm
            endpoint="/api/account/payout-method/verify"
            sentTo={pending}
            onVerified={() => {
              setPending(null);
              setStatus({
                kind: "success",
                message: current
                  ? "Payout method changed. Withdrawals pause for a short while after a change, for your security."
                  : "Payout method saved.",
              });
              router.refresh();
            }}
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {options.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payout-method">Method</Label>
              <select
                id="payout-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-primary"
              >
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payout-account">{isEmail ? `${option?.label ?? "Account"} Email` : "Account Details"}</Label>
            <Input
              id="payout-account"
              type={isEmail ? "email" : "text"}
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={isEmail ? `The email on your ${option?.label ?? ""} account` : "Bank, account number, branch / IBAN"}
            />
          </div>
          {!isEmail && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payout-account-name">Account Holder Name</Label>
              <Input id="payout-account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payout-current-password">Current Password</Label>
            <Input
              id="payout-current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <FormStatusMessage status={status} />
          <Button type="submit" disabled={status.kind === "loading"}>
            {status.kind === "loading" ? "Saving..." : "Save Payout Method"}
          </Button>
        </form>
      </div>
    </SettingsRow>
  );
}
