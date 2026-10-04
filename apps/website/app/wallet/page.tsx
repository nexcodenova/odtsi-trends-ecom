import Link from "next/link";
import { Wallet as WalletIcon } from "lucide-react";
import { getWallet, type Wallet } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@odtsi/utils";
import { LogoutButton } from "@/components/account/logout-button";
import { getWalletCashbackLabel } from "@/lib/wallet-rate";

async function loadWallet(token: string): Promise<Wallet | null> {
  try {
    return await getWallet(token);
  } catch (err) {
    // Real endpoint, confirmed live and working this session — a failure
    // here now means an actual transient problem (expired token, network),
    // not "not built yet". Logged server-side so a real outage is
    // diagnosable instead of silently looking identical to "not live".
    console.error("Failed to load wallet:", err);
    return null;
  }
}

export default async function WalletPage() {
  const [session, cashbackLabel] = await Promise.all([getSession(), getWalletCashbackLabel()]);

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <WalletIcon size={28} />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Your ODTSI Wallet</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
          Earn <span className="font-bold text-primary">{cashbackLabel} back</span> on every purchase, credited straight to your
          wallet — use it on your next order, no minimum spend, no expiry.
        </p>

        <div className="mt-8 w-full rounded-2xl border border-black/10 bg-[#F6F5F3] p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
          <p className="mt-1 text-3xl font-extrabold text-[#16161A]">Sign in to view</p>
        </div>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex h-14 items-center sm:flex-1 justify-center rounded-2xl bg-primary text-base font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover sm:h-12 sm:text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex h-14 items-center sm:flex-1 justify-center rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] text-base font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 sm:h-12 sm:text-sm"
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
        Earn <span className="font-bold text-primary">{cashbackLabel} back</span> on every purchase, credited straight to your
        wallet.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-black/10 bg-[#F6F5F3] p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
        <p className="mt-1 text-3xl font-extrabold text-[#16161A]">
          {wallet ? formatCurrency(wallet.balance, wallet.currency) : "Not available yet"}
        </p>
        {!wallet && (
          <p className="mt-2 text-xs text-[#8B8880]">
            Couldn&apos;t load your balance right now — try refreshing in a moment.
          </p>
        )}
      </div>

      {wallet && wallet.transactions.length > 0 && (
        <div className="mt-6 w-full text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Recent Activity</p>
          <div className="mt-3 flex flex-col gap-2">
            {wallet.transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#16161A]">{t.description}</p>
                  {t.createdAt && <p className="text-xs text-[#8B8880]">{new Date(t.createdAt).toLocaleDateString()}</p>}
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
