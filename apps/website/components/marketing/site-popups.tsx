"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  SHOP_ID,
  getSignupForms,
  identifyShopper,
  trackSignupFormImpression,
  submitSignupForm,
  type SignupForm,
} from "@odtsi/exiuscart-client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Marketing popups and signup forms built in the ExiusCart dashboard.
//
// Popups (email capture, exit intent, spin wheel) are shown by ExiusCart's
// own popup.js: it applies the seller's page/device/frequency rules,
// re-checks them on every client-side page change (it reads the URL, so no
// data-page attribute — that would go stale between pages), shows one at a
// time, and holds back while any of our dialogs is open (see dialog.tsx).
//
// Signup forms stay ours, below. Each shows at most once per visitor, and
// never on top of an ExiusCart popup.

declare global {
  interface Window {
    ExiusCartPopups?: { pause(): void; resume(): void; refresh(): void };
  }
}

const POPUP_SCRIPT = "https://api.exiuscart.com/api/v1/widget/popup.js";
// No popups over payment or download pages.
const QUIET_PATHS = ["/checkout", "/download"];

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

function exiusPopupOpen() {
  return document.querySelector(".exc-popup") !== null;
}

export function SitePopups() {
  const pathname = usePathname();
  const quiet = QUIET_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const quietRef = useRef(quiet);
  quietRef.current = quiet;

  useEffect(() => {
    if (quiet) window.ExiusCartPopups?.pause();
    else window.ExiusCartPopups?.resume();
  }, [quiet]);

  const [active, setActive] = useState<SignupForm | null>(null);
  const activeRef = useRef<SignupForm | null>(null);
  activeRef.current = active;
  // Forms that came due while something else was open.
  const queueRef = useRef<SignupForm[]>([]);

  function open(form: SignupForm) {
    markSeen(`form-${form.id}`);
    trackSignupFormImpression(form.id);
    setActive(form);
  }

  function showNextQueued() {
    if (activeRef.current || quietRef.current || exiusPopupOpen()) return;
    const next = queueRef.current.shift();
    if (next) open(next);
  }

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function show(form: SignupForm) {
      if (cancelled) return;
      if (activeRef.current || quietRef.current || exiusPopupOpen()) {
        queueRef.current.push(form);
        return;
      }
      open(form);
    }

    getSignupForms()
      .then((forms) => {
        if (cancelled) return;
        const seen = new Set(readSeen());
        for (const form of forms.filter((f) => !seen.has(`form-${f.id}`))) {
          timers.push(setTimeout(() => show(form), Math.max(form.delaySeconds, 0) * 1000));
        }
      })
      .catch(() => {});

    // A queued form waits for the ExiusCart popup to close, plus a pause.
    const onExiusClosed = () => timers.push(setTimeout(showNextQueued, 3000));
    document.addEventListener("exiuscart:popup:closed", onExiusClosed);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      document.removeEventListener("exiuscart:popup:closed", onExiusClosed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving checkout releases anything that queued up there.
  useEffect(() => {
    if (!quiet) {
      const t = setTimeout(showNextQueued, 3000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet]);

  function close() {
    setActive(null);
    setTimeout(showNextQueued, 1500);
  }

  return (
    <>
      {SHOP_ID && (
        <Script
          src={POPUP_SCRIPT}
          data-shop-id={SHOP_ID}
          strategy="lazyOnload"
          onLoad={() => {
            if (quietRef.current) window.ExiusCartPopups?.pause();
          }}
        />
      )}
      <Dialog open={active !== null} onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent className="overflow-hidden p-0">{active && <SignupFormBody form={active} />}</DialogContent>
      </Dialog>
    </>
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
      const emailField = form.fields.find((f) => f.type === "email");
      const email = emailField ? answers[emailField.id] : undefined;
      if (email) identifyShopper({ email });
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
