import { storeUrl } from "./config";
import type { AuthResult } from "./auth";

// Every call is authenticated with the shopper's Bearer token, so
// ExiusCart always knows exactly which customer is asking from the token
// alone. Shapes confirmed against live responses 2026-10-12.

export type Customer = AuthResult["customer"] & { phone: string | null };

interface RawCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

function mapCustomer(raw: RawCustomer): Customer {
  return { id: String(raw.id), name: raw.name, email: raw.email, phone: raw.phone ?? null };
}

// A code ExiusCart emailed to confirm a change (new login email or new
// payout email). Nothing switches until the code is verified.
export interface PendingVerification {
  sentTo: string;
  expiresAt: string | null;
}

interface RawPending {
  sent_to: string;
  expires_at?: string | null;
}

function mapPending(raw: RawPending | null | undefined): PendingVerification | null {
  return raw ? { sentTo: raw.sent_to, expiresAt: raw.expires_at ?? null } : null;
}

// Same FastAPI detail-as-string-or-object handling as orders.ts.
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.detail?.message === "string") return body.detail.message;
    return fallback;
  } catch {
    return fallback;
  }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface Profile {
  customer: Customer;
  pendingEmail: PendingVerification | null;
}

// GET /account/profile → { customer, pending_email }
export async function getProfile(token: string): Promise<Profile> {
  const res = await fetch(storeUrl("/account/profile"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);
  const raw: { customer: RawCustomer; pending_email?: RawPending | null } = await res.json();
  return { customer: mapCustomer(raw.customer), pendingEmail: mapPending(raw.pending_email) };
}

export interface ProfileUpdate {
  customer: Customer;
  // Set when the email changed — the old email stays active until the
  // 6-digit code sent here is verified.
  emailChange: PendingVerification | null;
}

// PATCH /account/profile. current_password is required only when the
// email changes; 409 if another customer already uses that email.
export async function updateProfile(
  token: string,
  payload: { name?: string; email?: string; phone?: string; currentPassword?: string },
): Promise<ProfileUpdate> {
  const res = await fetch(storeUrl("/account/profile"), {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      current_password: payload.currentPassword || undefined,
    }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Profile update failed: ${res.status}`));
  const raw: { customer: RawCustomer; email_change?: RawPending | null } = await res.json();
  return { customer: mapCustomer(raw.customer), emailChange: mapPending(raw.email_change) };
}

// POST /account/email/verify { code } — only now does the email switch.
// Codes last 15 minutes; 5 wrong tries cancel the change. Returns the
// updated customer, re-read from /account/profile if the verify response
// doesn't carry it.
export async function verifyEmailChange(token: string, code: string): Promise<Customer> {
  const res = await fetch(storeUrl("/account/email/verify"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Verification failed: ${res.status}`));
  const raw: { customer?: RawCustomer } = await res.json().catch(() => ({}));
  return raw.customer ? mapCustomer(raw.customer) : (await getProfile(token)).customer;
}

// POST /account/password → { token, customer }. Every other device is
// signed out, so the caller must swap in the returned token.
export async function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
): Promise<{ token: string; customer: Customer }> {
  const res = await fetch(storeUrl("/account/password"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ current_password: payload.currentPassword, new_password: payload.newPassword }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Password change failed: ${res.status}`));
  const raw: { token: string; customer: RawCustomer } = await res.json();
  return { token: raw.token, customer: mapCustomer(raw.customer) };
}

// One payout option the store accepts. kind "email" means the account is
// an email address (PayPal, Payoneer, Skrill, Wise); anything else is
// free-text account details (bank).
export interface PayoutOption {
  key: string;
  label: string;
  kind: string;
}

export interface SavedPayoutMethod {
  method: string;
  methodLabel: string;
  account: string;
  accountName: string | null;
}

export interface PayoutMethod {
  current: SavedPayoutMethod | null;
  pending: (SavedPayoutMethod & PendingVerification) | null;
  withdrawalsEnabled: boolean;
  options: PayoutOption[];
}

interface RawSavedPayout {
  method?: string;
  method_label?: string;
  account?: string;
  account_name?: string | null;
}

interface RawPayoutMethod {
  payout_method: RawSavedPayout | string | null;
  paypal_email: string | null;
  pending_payout_method: (RawSavedPayout & RawPending) | null;
  withdrawals_enabled?: boolean;
  methods?: PayoutOption[];
}

function mapSaved(raw: RawSavedPayout): SavedPayoutMethod {
  return {
    method: raw.method ?? "paypal",
    methodLabel: raw.method_label ?? raw.method ?? "PayPal",
    account: raw.account ?? "",
    accountName: raw.account_name ?? null,
  };
}

function mapPayoutMethod(raw: RawPayoutMethod): PayoutMethod {
  let current: SavedPayoutMethod | null = null;
  if (raw.payout_method && typeof raw.payout_method === "object") current = mapSaved(raw.payout_method);
  // Older/PayPal-only shape: just a method key plus paypal_email.
  else if (raw.paypal_email) current = { method: "paypal", methodLabel: "PayPal", account: raw.paypal_email, accountName: null };

  const pending = raw.pending_payout_method
    ? { ...mapSaved(raw.pending_payout_method), sentTo: raw.pending_payout_method.sent_to, expiresAt: raw.pending_payout_method.expires_at ?? null }
    : null;

  return {
    current,
    pending,
    withdrawalsEnabled: raw.withdrawals_enabled ?? false,
    options: raw.methods ?? [],
  };
}

// GET /account/payout-method
export async function getPayoutMethod(token: string): Promise<PayoutMethod> {
  const res = await fetch(storeUrl("/account/payout-method"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load payout method: ${res.status}`);
  return mapPayoutMethod(await res.json());
}

export interface SavePayoutResult {
  // True when ExiusCart emailed a code to the new payout address (202) —
  // nothing is saved until verifyPayoutMethod() succeeds.
  needsVerification: boolean;
  sentTo: string | null;
}

// PUT /account/payout-method { method, account, account_name?, current_password }
export async function savePayoutMethod(
  token: string,
  payload: { method: string; account: string; accountName?: string; currentPassword: string },
): Promise<SavePayoutResult> {
  const res = await fetch(storeUrl("/account/payout-method"), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      method: payload.method,
      account: payload.account,
      account_name: payload.accountName || undefined,
      current_password: payload.currentPassword,
    }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Saving payout method failed: ${res.status}`));
  const raw: { verification?: { status: string; sent_to: string } | null } = await res.json();
  return {
    needsVerification: res.status === 202 || raw.verification?.status === "code_sent",
    sentTo: raw.verification?.sent_to ?? null,
  };
}

// POST /account/payout-method/verify { code }. A change (not the first
// add) pauses withdrawals for the store's hold period.
// Callers re-read getPayoutMethod() afterwards for the saved state.
export async function verifyPayoutMethod(token: string, code: string): Promise<void> {
  const res = await fetch(storeUrl("/account/payout-method/verify"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, `Verification failed: ${res.status}`));
}
