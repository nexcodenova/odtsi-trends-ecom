"use client";

import { useState, type FormEvent } from "react";
import { verifyDownload } from "@odtsi/exiuscart-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ExiusCart rate-limits wrong codes per link and per IP, so its own
// message (e.g. "too many tries") is shown as-is.
export function DownloadGate({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await verifyDownload(token, code.trim());
      setFileUrl(result.fileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code isn't right.");
    } finally {
      setLoading(false);
    }
  }

  if (fileUrl) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-white transition hover:bg-primary-hover"
      >
        Download Your File
      </a>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        required
        autoComplete="one-time-code"
        placeholder="Access code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="text-center font-mono tracking-widest"
      />
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Checking..." : "Unlock Download"}
      </Button>
    </form>
  );
}
