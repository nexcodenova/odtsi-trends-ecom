import { EXIUSCART_BASE_URL, SHOP_ID } from "./config";
import type { Popup, SignupForm, SignupFormField } from "./types";

// Popups and signup forms key off the shop's numeric ID, not the slug
// every other storefront endpoint uses — ExiusCart's inconsistency, not
// ours. Field names follow its PopupIn / SignupFormIn schemas.

interface RawPopup {
  id: number;
  popup_type: string;
  title: string;
  message?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  discount_code?: string | null;
  image_url?: string | null;
  delay_seconds?: number;
  is_active?: boolean;
}

interface RawSignupForm {
  id: number;
  title: string;
  description?: string | null;
  fields?: { id: string; label: string; type: string; required?: boolean; options?: string[] | null }[];
  success_message?: string | null;
  discount_code?: string | null;
  delay_seconds?: number;
  is_active?: boolean;
}

function mapPopup(raw: RawPopup): Popup {
  return {
    id: String(raw.id),
    type: raw.popup_type,
    title: raw.title,
    message: raw.message ?? null,
    buttonText: raw.button_text ?? null,
    buttonLink: raw.button_link ?? null,
    discountCode: raw.discount_code ?? null,
    imageUrl: raw.image_url ?? null,
    delaySeconds: raw.delay_seconds ?? 0,
  };
}

function mapSignupForm(raw: RawSignupForm): SignupForm {
  const fields: SignupFormField[] = (raw.fields ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    required: f.required ?? false,
    options: f.options ?? null,
  }));
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description ?? null,
    fields,
    successMessage: raw.success_message ?? null,
    discountCode: raw.discount_code ?? null,
    delaySeconds: raw.delay_seconds ?? 0,
  };
}

// Both lists come back already filtered to active ones; the is_active
// check is only belt-and-braces. Empty when no shop ID is configured.
export async function getPopups(): Promise<Popup[]> {
  if (!SHOP_ID) return [];
  const res = await fetch(`${EXIUSCART_BASE_URL}/public/popups/${SHOP_ID}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load popups: ${res.status}`);
  const raw: { popups: RawPopup[] } = await res.json();
  return raw.popups.filter((p) => p.is_active !== false).map(mapPopup);
}

export async function getSignupForms(): Promise<SignupForm[]> {
  if (!SHOP_ID) return [];
  const res = await fetch(`${EXIUSCART_BASE_URL}/public/signup-forms/${SHOP_ID}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load signup forms: ${res.status}`);
  const raw: { forms: RawSignupForm[] } = await res.json();
  return raw.forms.filter((f) => f.is_active !== false).map(mapSignupForm);
}

// Stats only — fire-and-forget, never throws.
export async function trackPopup(popupId: string, event: "impression" | "click"): Promise<void> {
  try {
    await fetch(`${EXIUSCART_BASE_URL}/public/popups/${popupId}/track?event=${event}`, { method: "POST", keepalive: true });
  } catch {}
}

export async function trackSignupFormImpression(formId: string): Promise<void> {
  try {
    await fetch(`${EXIUSCART_BASE_URL}/public/signup-forms/${formId}/track`, { method: "POST", keepalive: true });
  } catch {}
}

export async function submitSignupForm(formId: string, answers: Record<string, string>): Promise<void> {
  const res = await fetch(`${EXIUSCART_BASE_URL}/public/signup-forms/${formId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    let message = "Couldn't send that — try again.";
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {}
    throw new Error(message);
  }
}
