import { getWalletSettings } from "@odtsi/exiuscart-client";

// Real seller-set cashback rate from ExiusCart's /wallet-settings endpoint
// (added to ExiusCart this session specifically to replace the hardcoded
// 3.5% guess this file used to export — ExiusCart previously had no public
// field exposing it at all). Server components await this directly; client
// components that need it receive the resolved label as a prop from a
// server-rendered parent instead of calling this themselves.
export async function getWalletCashbackLabel(): Promise<string> {
  try {
    const settings = await getWalletSettings();
    return settings.isEnabled && settings.cashbackPercent > 0 ? `${settings.cashbackPercent}%` : "Cashback";
  } catch {
    // Real endpoint unreachable — a generic word is honest, a guessed
    // number isn't.
    return "Cashback";
  }
}
