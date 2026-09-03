import Link from "next/link";
import { Wallet as WalletIcon } from "lucide-react";
import { getWallet, type Wallet } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@odtsi/utils";
import { LogoutButton } from "@/components/account/logout-button";
import { WALLET_CASHBACK_LABEL } from "@/lib/wallet-rate";

async function loadWallet(token: string): Promise<Wallet | null> {
  try {
    return await getWallet(token);
  } catch {
    // ExiusCart's /wallet endpoint isn't live yet — honest state, not a
    // fake balance.
    return null;
  }
}

export default async function WalletPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <WalletIcon size={28} />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your ODTSI Wallet</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
          Earn <span className="font-bold text-primary">{WALLET_CASHBACK_LABEL} back</span> on every purchase, credited straight to your
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

  const wallet = await loadWallet(session.token);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <WalletIcon size={28} />
      </span>

      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">
        Welcome back, {session.customer.name.split(" ")[0]}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
        Earn <span className="font-bold text-primary">{WALLET_CASHBACK_LABEL} back</span> on every purchase, credited straight to your
        wallet.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-black/10 bg-[#F6F5F3] p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
        <p className="mt-1 text-3xl font-extrabold text-[#16161A]">
          {wallet ? formatCurrency(wallet.balance, wallet.currency) : "Not available yet"}
        </p>
        {!wallet && (
          <p className="mt-2 text-xs text-[#8B8880]">
            You&apos;re signed in — ExiusCart&apos;s wallet balance endpoint isn&apos;t live yet.
          </p>
        )}
      </div>

      {wallet && wallet.transactions.length > 0 && (
        <div className="mt-6 w-full text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Recent Activity</p>
          <div className="mt-3 flex flex-col gap-2">
            {wallet.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#16161A]">{t.description}</p>
                  <p className="text-xs text-[#8B8880]">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-bold ${t.type === "credit" ? "text-status" : "text-[#B9412E]"}`}>
                  {t.type === "credit" ? "+" : "-"}
                  {formatCurrency(t.amount, wallet.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 w-full">
        <LogoutButton />
      </div>
    </div>
  );
}
