"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { identifyShopper } from "@odtsi/exiuscart-client";
import { BirthdayInput, completeBirthday } from "./birthday-input";

export function SignupForm({ cashbackLabel }: { cashbackLabel: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  // Unticked by default — UK/EU consent has to be an active choice.
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    // Goes through our own /api/auth/signup route, not signUp() directly —
    // that's the only place the real token gets set as an httpOnly cookie.
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, birthday: completeBirthday(birthday), marketingConsent }),
    });
    if (res.ok) {
      identifyShopper({ email, name });
      router.push("/wallet");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => null);
    setErrorMessage(data?.error ?? "Something went wrong — try again.");
    setStatus("error");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-14 sm:py-20">
      <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-[#716D67]">
        Get a wallet, track orders, and earn {cashbackLabel} back on every purchase.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-4 text-sm text-[#16161A] outline-none focus:border-primary"
          />
        </div>

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
            onChange={(e) => {
              setPassword(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-4 text-sm text-[#16161A] outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-[#8B8880]">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="birthday" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
            Birthday <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <div className="mt-1.5">
            <BirthdayInput
              id="birthday"
              value={birthday}
              onChange={setBirthday}
              className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[#16161A] outline-none focus:border-primary"
            />
          </div>
          <p className="mt-1 text-xs text-[#8B8880]">We&apos;ll send you a birthday treat.</p>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-[#716D67]">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-primary"
          />
          Email me offers and new arrivals. Unsubscribe anytime.
        </label>

        {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 h-14 rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-base font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:h-12 sm:text-sm"
        >
          {status === "loading" ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#716D67]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
