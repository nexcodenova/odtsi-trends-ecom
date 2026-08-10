import Link from "next/link";
import { Wallet as WalletIcon } from "lucide-react";

// No accounts exist yet, so there's no real balance to show — this explains
// the program and points to sign-in/sign-up instead of faking a balance.
export default function WalletPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <WalletIcon size={28} />
      </span>

      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your ODTSI Wallet</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
        Earn <span className="font-bold text-primary">3.5% back</span> on every purchase, credited straight to your
        wallet — use it on your next order, no minimum spend, no expiry.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-black/10 bg-[#F6F5F3] p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
        <p className="mt-1 text-3xl font-extrabold text-[#16161A]">Sign in to view</p>
      </div>

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-action text-sm font-bold text-action-ink transition hover:brightness-95"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
