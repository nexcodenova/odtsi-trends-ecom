// Single source of truth for the wallet cashback rate shown across the
// site (product pages, wallet page, signup). Checked live 2026-09-03:
// ExiusCart's /wallet endpoint returns real balance/transactions but no
// rate field, and there's no public settings/config endpoint that exposes
// one either — this genuinely can't be fetched from the API yet, so it's
// hardcoded here instead of being duplicated as a literal in five files.
// If ExiusCart changes the real rate, this is the only place to update —
// and the moment they expose a real rate field, this constant is the one
// place that needs to become an API call instead.
export const WALLET_CASHBACK_RATE = 3.5;
export const WALLET_CASHBACK_LABEL = `${WALLET_CASHBACK_RATE}%`;
