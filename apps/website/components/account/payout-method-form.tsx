"use client";

import { useState, type FormEvent } from "react";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsRow } from "./settings-row";
import { FormStatusMessage, readError, type FormStatus } from "./form-status";

export function PayoutMethodForm({ paypalEmail: initialEmail }: { paypalEmail: string | null }) {
  const [saved, setSaved] = useState(initialEmail);
  const [paypalEmail, setPaypalEmail] = useState(initialEmail ?? "");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch("/api/account/payout-method", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypalEmail }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    const body: { paypalEmail: string | null } = await res.json();
    setSaved(body.paypalEmail);
    setStatus({ kind: "success", message: "PayPal account saved." });
  }

  return (
    <SettingsRow icon={Landmark} label={saved ? "PayPal Account" : "Save PayPal Account"} hint={saved ?? undefined}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="paypal-email">PayPal Email</Label>
          <Input
            id="paypal-email"
            type="email"
            required
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="The email on your PayPal account"
          />
        </div>
        <FormStatusMessage status={status} />
        <Button type="submit" disabled={status.kind === "loading"}>
          {status.kind === "loading" ? "Saving..." : "Save PayPal Account"}
        </Button>
      </form>
    </SettingsRow>
  );
}
