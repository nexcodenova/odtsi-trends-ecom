import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/site";
import { SignupForm } from "@/components/account/signup-form";
import { getWalletCashbackLabel } from "@/lib/wallet-rate";

export const metadata: Metadata = PRIVATE_PAGE;

export default async function SignupPage() {
  const cashbackLabel = await getWalletCashbackLabel();
  return <SignupForm cashbackLabel={cashbackLabel} />;
}
