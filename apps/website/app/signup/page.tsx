import { SignupForm } from "@/components/account/signup-form";
import { getWalletCashbackLabel } from "@/lib/wallet-rate";

export default async function SignupPage() {
  const cashbackLabel = await getWalletCashbackLabel();
  return <SignupForm cashbackLabel={cashbackLabel} />;
}
