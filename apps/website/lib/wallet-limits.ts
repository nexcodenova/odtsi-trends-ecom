// $25 floor before a withdrawal request is worth batching — same floor most
// cashback wallets use. Checked here before anything is sent to ExiusCart,
// and ExiusCart should enforce it again on its side.
export const MIN_REDEEM_AMOUNT = 25;
