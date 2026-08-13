import Link from "next/link";
import { User, Wallet as WalletIcon } from "lucide-react";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/account/logout-button";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <User size={28} />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your Account</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
          Sign in to view your details, track orders, and manage your wallet.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
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

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <User size={28} />
      </span>

      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">{session.customer.name}</h1>
      <p className="mt-1 text-sm text-[#716D67]">{session.customer.email}</p>

      <Link
        href="/wallet"
        className="mt-8 flex h-14 w-full items-center justify-between rounded-2xl border border-black/10 px-5 transition hover:border-black/20"
      >
        <span className="flex items-center gap-3 text-sm font-bold text-[#16161A]">
          <WalletIcon size={18} className="text-primary" />
          ODTSI Wallet
        </span>
        <span className="text-sm text-[#8B8880]">View →</span>
      </Link>

      <div className="mt-4 w-full">
        <LogoutButton />
      </div>
    </div>
  );
}
