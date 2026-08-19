"use client";

import { useState, type FormEvent } from "react";
import { Mail, Facebook, Instagram, Twitter, Youtube, MessageCircle } from "lucide-react";

// Placeholder hrefs — real profile URLs aren't set up yet. Swap "#" for the
// actual profile links once those accounts exist.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "X (Twitter)", href: "#", icon: Twitter },
  { label: "YouTube", href: "#", icon: Youtube },
  { label: "WhatsApp", href: "#", icon: MessageCircle },
];

// Form UI only — not wired to a real email service yet (Mailchimp, or an
// ExiusCart endpoint) since that's separate backend work, not yet scoped.
export function ConnectSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "error">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("submitted");
  }

  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-[#F6F5F3] px-6 py-10 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-wide text-[#16161A]">Exclusive Discounts</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">Stay Connected</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#716D67]">
            Subscribe to our news and get a 10% discount coupon.
          </p>

          {status === "submitted" ? (
            <p className="mx-auto mt-6 max-w-lg rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-primary">
              You&apos;re on the list — check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="E-mail"
                aria-label="Email address"
                className="h-16 w-full rounded-xl border-2 border-black/10 bg-white px-5 text-sm text-[#16161A] shadow-sm outline-none placeholder:text-[#a3a19c] focus:border-action sm:w-auto sm:flex-1"
              />
              <button
                type="submit"
                className="mx-auto flex h-16 w-1/2 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] px-8 text-sm font-extrabold text-[#16161A] shadow-[0_6px_16px_-6px_rgba(201,146,0,0.55)] transition hover:brightness-105 sm:mx-0 sm:w-auto"
              >
                <Mail size={15} />
                Subscribe
              </button>
            </form>
          )}
          {status === "error" && <p className="mt-2 text-xs font-bold text-[#C05A32]">Enter a valid email address.</p>}
        </div>

        <div className="rounded-3xl bg-[#F6F5F3] px-6 py-10 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-wide text-[#16161A]">Join Our Community</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">Get Social</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#716D67]">
            Follow along for new drops, behind-the-scenes and flash sales.
          </p>

          <div className="mx-auto mt-6 flex max-w-lg items-center justify-between">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm transition hover:bg-primary hover:text-white"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
