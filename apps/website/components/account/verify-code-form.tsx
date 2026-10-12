"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStatusMessage, readError, type FormStatus } from "./form-status";

// The "we emailed you a code" step shared by email changes and payout
// method changes — nothing switches on ExiusCart's side until this passes.
export function VerifyCodeForm({
  endpoint,
  sentTo,
  onVerified,
}: {
  endpoint: string;
  sentTo: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    setCode("");
    setStatus({ kind: "idle" });
    onVerified();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-[#F6F5F3] p-4">
      <p className="text-sm text-[#4A4844]">
        We sent a code to <span className="font-bold text-[#16161A]">{sentTo}</span>. Enter it to confirm the change.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${endpoint}-code`}>Verification Code</Label>
        <Input
          id={`${endpoint}-code`}
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <FormStatusMessage status={status} />
      <Button type="submit" disabled={status.kind === "loading"}>
        {status.kind === "loading" ? "Checking..." : "Confirm"}
      </Button>
    </form>
  );
}
