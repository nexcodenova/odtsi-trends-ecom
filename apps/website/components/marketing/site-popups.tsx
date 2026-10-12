"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getPopups,
  getSignupForms,
  trackPopup,
  trackSignupFormImpression,
  submitSignupForm,
  type Popup,
  type SignupForm,
} from "@odtsi/exiuscart-client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Popups and signup forms built in the ExiusCart dashboard. Loaded in the
// browser (not in the layout) so they never force every page dynamic.
// Only one shows at a time, each at most once per visitor, and nothing
// renders at all when the seller hasn't made any.

type Item = { kind: "popup"; popup: Popup } | { kind: "form"; form: SignupForm };

const SEEN_KEY = "odtsi_seen_marketing";

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function markSeen(id: string) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...readSeen(), id]));
  } catch {}
}

function itemKey(item: Item) {
  return item.kind === "popup" ? `popup-${item.popup.id}` : `form-${item.form.id}`;
}

export function SitePopups() {
  const [active, setActive] = useState<Item | null>(null);
  const activeRef = useRef<Item | null>(null);
  activeRef.current = active;
  // Items that came due while another was open — shown after it closes.
  const queueRef = useRef<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let exitHandler: ((e: MouseEvent) => void) | null = null;

    function show(item: Item) {
      if (cancelled || activeRef.current) {
        // Something's already open — try again once it's closed.
        if (!cancelled) queueRef.current.push(item);
        return;
      }
      markSeen(itemKey(item));
      if (item.kind === "popup") trackPopup(item.popup.id, "impression");
      else trackSignupFormImpression(item.form.id);
      setActive(item);
    }

    Promise.allSettled([getPopups(), getSignupForms()]).then(([popups, forms]) => {
      if (cancelled) return;
      const seen = new Set(readSeen());
      const items: Item[] = [
        ...(popups.status === "fulfilled" ? popups.value.map((popup) => ({ kind: "popup" as const, popup })) : []),
        ...(forms.status === "fulfilled" ? forms.value.map((form) => ({ kind: "form" as const, form })) : []),
      ].filter((item) => !seen.has(itemKey(item)));

      for (const item of items) {
        if (item.kind === "popup" && item.popup.type.includes("exit")) {
          // Exit intent: the cursor leaving through the top of the window.
          if (!exitHandler) {
            exitHandler = (e: MouseEvent) => {
              if (e.clientY > 0) return;
              document.removeEventListener("mouseout", exitHandler!);
              show(item);
            };
            document.addEventListener("mouseout", exitHandler);
          }
          continue;
        }
        const delay = item.kind === "popup" ? item.popup.delaySeconds : item.form.delaySeconds;
        timers.push(setTimeout(() => show(item), Math.max(delay, 0) * 1000));
      }
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (exitHandler) document.removeEventListener("mouseout", exitHandler);
    };
  }, []);

  function close() {
    setActive(null);
    const next = queueRef.current.shift();
    if (next) {
      setTimeout(() => {
        markSeen(itemKey(next));
        if (next.kind === "popup") trackPopup(next.popup.id, "impression");
        else trackSignupFormImpression(next.form.id);
        setActive(next);
      }, 1500);
    }
  }

  return (
    <Dialog open={active !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="overflow-hidden p-0">
        {active?.kind === "popup" && <PopupBody popup={active.popup} onDone={close} />}
        {active?.kind === "form" && <SignupFormBody form={active.form} />}
      </DialogContent>
    </Dialog>
  );
}

function PopupBody({ popup, onDone }: { popup: Popup; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      {popup.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={popup.imageUrl} alt="" className="max-h-56 w-full object-cover" />
      )}
      <div className="flex flex-col gap-3 p-6 text-center">
        <DialogTitle className="text-xl leading-snug">{popup.title}</DialogTitle>
        {popup.message ? (
          <DialogDescription className="leading-relaxed">{popup.message}</DialogDescription>
        ) : (
          <DialogDescription className="sr-only">{popup.title}</DialogDescription>
        )}
        {popup.discountCode && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(popup.discountCode!).catch(() => {});
              setCopied(true);
              trackPopup(popup.id, "click");
            }}
            className="mx-auto rounded-xl border-2 border-dashed border-primary px-5 py-2 font-mono text-lg font-extrabold tracking-widest text-primary"
          >
            {copied ? "Copied!" : popup.discountCode}
          </button>
        )}
        {popup.buttonText && (
          <Button
            onClick={() => {
              trackPopup(popup.id, "click");
              if (popup.buttonLink) window.location.href = popup.buttonLink;
              else onDone();
            }}
          >
            {popup.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

function SignupFormBody({ form }: { form: SignupForm }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitSignupForm(form.id, answers);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that — try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-3 p-6 text-center">
        <DialogTitle className="text-xl">{form.successMessage || "Thanks — you're on the list!"}</DialogTitle>
        <DialogDescription className="sr-only">Signup complete</DialogDescription>
        {form.discountCode && (
          <p className="mx-auto rounded-xl border-2 border-dashed border-primary px-5 py-2 font-mono text-lg font-extrabold tracking-widest text-primary">
            {form.discountCode}
          </p>
        )}
      </div>
    );
  }

  const set = (id: string, value: string) => setAnswers((a) => ({ ...a, [id]: value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <DialogTitle className="text-xl leading-snug">{form.title}</DialogTitle>
      {form.description ? (
        <DialogDescription className="leading-relaxed">{form.description}</DialogDescription>
      ) : (
        <DialogDescription className="sr-only">{form.title}</DialogDescription>
      )}
      {form.fields.map((field) => {
        const id = `signup-${form.id}-${field.id}`;
        const value = answers[field.id] ?? "";
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <Label htmlFor={id}>
              {field.label}
              {field.required && " *"}
            </Label>
            {field.options && field.options.length > 0 ? (
              <select
                id={id}
                required={field.required}
                value={value}
                onChange={(e) => set(field.id, e.target.value)}
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Choose…</option>
                {field.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={id}
                required={field.required}
                value={value}
                onChange={(e) => set(field.id, e.target.value)}
                rows={3}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            ) : (
              <Input
                id={id}
                type={["email", "tel", "number", "date"].includes(field.type) ? field.type : field.type === "phone" ? "tel" : "text"}
                required={field.required}
                value={value}
                onChange={(e) => set(field.id, e.target.value)}
              />
            )}
          </div>
        );
      })}
      {status === "error" && <p className="text-sm font-bold text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Submit"}
      </Button>
    </form>
  );
}
