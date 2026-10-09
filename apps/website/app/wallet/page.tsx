import Link from "next/link";
import { Wallet as WalletIcon, ShoppingBag, Landmark, PiggyBank } from "lucide-react";
import { getWallet, type Wallet } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@odtsi/utils";
import { LogoutButton } from "@/components/account/logout-button";
import { getWalletCashbackLabel } from "@/lib/wallet-rate";

// Real cash, not points — every dollar credited to a wallet is a dollar
// that came off a real order. $25 is the minimum balance ExiusCart will
// need before a redemption (checkout or payout) request is worth batching,
// same floor most cashback wallets use. Neither redemption path is wired
// to ExiusCart yet (no checkout wallet-apply, no payout endpoint), so this
// is shown as the honest target balance, not a live "redeem" button.
const MIN_REDEEM_AMOUNT = 25;

function HowItWorks({ currency }: { currency: string }) {
  return (
    <div className="w-full rounded-2xl border border-black/10 bg-white p-6 text-left sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">How your wallet works</p>
      <p className="mt-2 text-sm leading-relaxed text-[#4A4844]">
        This isn&apos;t store credit with strings attached — it&apos;s real money you earned back, and it stays
        yours until you use it.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <PiggyBank size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#16161A]">Save it</p>
            <p className="mt-1 text-xs leading-relaxed text-[#716D67]">
              Cashback builds up automatically on every order — no minimum spend, no expiry.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <ShoppingBag size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#16161A]">Spend it</p>
            <p className="mt-1 text-xs leading-relaxed text-[#716D67]">
              Put it toward your next order at checkout, once you&apos;ve reached {formatCurrency(MIN_REDEEM_AMOUNT, currency)}.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Landmark size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#16161A]">Withdraw it</p>
            <p className="mt-1 text-xs leading-relaxed text-[#716D67]">
              Take it out as cash to your own PayPal account once you&apos;ve reached{" "}
              {formatCurrency(MIN_REDEEM_AMOUNT, currency)} — save your PayPal details from your{" "}
              <Link href="/account" className="font-bold text-primary underline-offset-2 hover:underline">
                account page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-xl bg-[#F6F5F3] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#8B8880]">
        Checkout redemption &amp; PayPal withdrawals — coming soon
      </p>
    </div>
  );
}

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
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-[1.1fr_1fr] sm:items-center sm:gap-14 sm:py-20 lg:px-8">
        <div>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <WalletIcon size={28} />
          </span>

          <h1 className="mt-5 text-3xl font-extrabold text-[#16161A] sm:text-4xl">
            Spend It. Save It. It&apos;s Yours.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
            Earn <span className="font-bold text-primary">{cashbackLabel} back</span> on every purchase, credited
            straight to your wallet as real money — not points. Use it like your own account: keep it, spend it at
            checkout, or take it out to PayPal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(27,42,94,0.5)] transition hover:bg-primary-hover sm:h-12 sm:text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F6C935] to-[#C99200] px-8 text-base font-extrabold text-[#16161A] shadow-[0_10px_24px_-8px_rgba(201,146,0,0.55)] transition hover:brightness-105 sm:h-12 sm:text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-black/10 bg-[#F6F5F3] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
          <p className="mt-1 text-3xl font-extrabold text-[#16161A] sm:text-4xl">Sign in to view</p>
        </div>

        <div className="sm:col-span-2">
          <HowItWorks currency="USD" />
        </div>
      </div>
    );
  }

  const wallet = await loadWallet(session.token);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14 lg:px-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <WalletIcon size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-[#16161A] sm:text-3xl">
            Welcome back, {session.customer.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-[#716D67]">
            Earn <span className="font-bold text-primary">{cashbackLabel} back</span> on every purchase — it&apos;s
            yours to keep, spend, or withdraw.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1.4fr] sm:items-start">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-black/10 bg-[#F6F5F3] p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Wallet Balance</p>
            <p className="mt-1 text-3xl font-extrabold text-[#16161A] sm:text-4xl">
              {wallet ? formatCurrency(wallet.balance, wallet.currency) : "Not available yet"}
            </p>
            {!wallet && (
              <p className="mt-2 text-xs text-[#8B8880]">
                Couldn&apos;t load your balance right now — try refreshing in a moment.
              </p>
            )}
            {wallet && wallet.balance < MIN_REDEEM_AMOUNT && (
              <p className="mt-2 text-xs text-[#8B8880]">
                {formatCurrency(MIN_REDEEM_AMOUNT - wallet.balance, wallet.currency)} more to unlock spending or
                withdrawing it.
              </p>
            )}
          </div>

          {wallet && wallet.transactions.length > 0 && (
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">Recent Activity</p>
              <div className="mt-3 flex flex-col gap-2">
                {wallet.transactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#16161A]">{t.description}</p>
                      {t.createdAt && (
                        <p className="text-xs text-[#8B8880]">{new Date(t.createdAt).toLocaleDateString()}</p>
                      )}
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

          <LogoutButton />
        </div>

        <HowItWorks currency={wallet?.currency ?? "USD"} />
      </div>
    </div>
  );
}
