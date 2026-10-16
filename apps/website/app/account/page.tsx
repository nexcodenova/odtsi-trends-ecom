import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";
import Link from "next/link";
import { User, Wallet as WalletIcon, ChevronRight } from "lucide-react";
import { getPayoutMethod, getProfile, type PayoutMethod, type Profile } from "@odtsi/exiuscart-client";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/account/logout-button";
import { IdentifyShopper } from "@/components/account/identify-shopper";
import { TrackOrder } from "@/components/account/track-order";
import { OrderHistory } from "@/components/account/order-history";
import { EditProfileForm } from "@/components/account/edit-profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { PayoutMethodForm } from "@/components/account/payout-method-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = PRIVATE_PAGE;

// Reads the session cookie per-request — never worth prerendering, and
// forcing this explicitly avoids relying on Next's own dynamic-API
// detection to opt this route out of static generation at build time.
export const dynamic = "force-dynamic";

// Each loads on its own so one failing never blanks the whole page — the
// session cookie's name/email still show if the profile call fails.
async function loadProfile(token: string): Promise<Profile | null> {
  try {
    return await getProfile(token);
  } catch (err) {
    console.error("Failed to load profile:", err);
    return null;
  }
}

async function loadPayoutMethod(token: string): Promise<PayoutMethod | null> {
  try {
    return await getPayoutMethod(token);
  } catch (err) {
    console.error("Failed to load payout method:", err);
    return null;
  }
}

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

  const [profile, payoutMethod] = await Promise.all([loadProfile(session.token), loadPayoutMethod(session.token)]);
  const customer = profile?.customer ?? { ...session.customer, phone: null };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <User size={28} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#16161A] sm:text-3xl">{customer.name}</h1>
          <p className="mt-1 text-sm text-[#716D67]">{customer.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-black/5 p-0">
            <EditProfileForm
              name={customer.name}
              email={customer.email}
              phone={customer.phone}
              pendingEmail={profile?.pendingEmail?.sentTo ?? null}
            />
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <Link href="/wallet" className="flex items-center justify-between p-5">
            <span className="flex items-center gap-3 text-sm font-bold text-[#16161A]">
              <WalletIcon size={18} className="text-primary" />
              ODTSI Wallet
            </span>
            <ChevronRight size={18} className="text-[#8B8880]" />
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Method</CardTitle>
            <CardDescription>Where your wallet cashback goes when you withdraw it.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <PayoutMethodForm
              current={payoutMethod?.current ?? null}
              pendingSentTo={payoutMethod?.pending?.sentTo ?? null}
              options={payoutMethod?.options ?? []}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[3fr_2fr] sm:items-start">
        <TrackOrder />
        <OrderHistory />
      </div>

      <div className="mx-auto w-full max-w-lg">
        <IdentifyShopper email={session.customer.email} name={session.customer.name} />
        <LogoutButton />
      </div>
    </div>
  );
}
