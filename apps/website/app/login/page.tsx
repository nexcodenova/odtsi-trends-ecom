"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "@odtsi/exiuscart-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await signIn({ email, password });
      // TODO: store the returned token/customer once accounts are live and redirect home.
    } catch {
      // ExiusCart's /auth/login endpoint isn't live yet — honest state, not a fake success.
      setErrorMessage("Accounts aren't connected yet — check back soon.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-14 sm:py-20">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-[#716D67]">Sign in to view your orders and wallet balance.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-4 text-sm text-[#16161A] outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-4 text-sm text-[#16161A] outline-none focus:border-primary"
          />
        </div>

        {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 h-12 rounded-xl bg-action text-sm font-bold text-action-ink transition hover:brightness-95 disabled:opacity-60"
        >
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#716D67]">
        New to ODTSI?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
