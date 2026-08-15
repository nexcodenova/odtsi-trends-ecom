import Link from "next/link";
import { User, Wallet as WalletIcon, ChevronRight, Pencil, Lock } from "lucide-react";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/account/logout-button";
import { TrackOrder } from "@/components/account/track-order";
import { OrderHistory } from "@/components/account/order-history";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Reads the session cookie per-request — never worth prerendering, and
// forcing this explicitly avoids relying on Next's own dynamic-API
// detection to opt this route out of static generation at build time.
export const dynamic = "force-dynamic";

// Not wired to anything — ExiusCart has no profile-update or
// change-password endpoint yet. Shown as an honest "coming soon" row
// instead of a form that would submit nowhere, or hiding it entirely.
function ComingSoonRow({ icon: Icon, label }: { icon: typeof Pencil; label: string }) {
  return (
    <div className="flex items-center justify-between p-5 opacity-50">
      <span className="flex items-center gap-3 text-sm font-bold text-[#16161A]">
        <Icon size={18} className="text-[#8B8880]" />
        {label}
      </span>
      <span className="rounded-full bg-[#F6F5F3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8B8880]">
        Coming Soon
      </span>
    </div>
  );
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
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <User size={28} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#16161A] sm:text-3xl">{session.customer.name}</h1>
          {/* Email is read-only — ExiusCart doesn't have a profile-update
              endpoint yet, so there's nothing real to change it into. */}
          <p className="mt-1 text-sm text-[#716D67]">{session.customer.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-black/5 p-0">
            <ComingSoonRow icon={Pencil} label="Edit Profile" />
            <ComingSoonRow icon={Lock} label="Change Password" />
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
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[3fr_2fr] sm:items-start">
        <TrackOrder />
        <OrderHistory />
      </div>

      <div className="mx-auto w-full max-w-lg">
        <LogoutButton />
      </div>
    </div>
  );
}
