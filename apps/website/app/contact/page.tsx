"use client";

import { useState, type FormEvent } from "react";
import { Send, Clock, MessageCircle, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

// Form UI only — not wired to a real inbox/helpdesk yet, same honest
// "not connected" pattern as the newsletter signup form.
const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "X (Twitter)", href: "#", icon: Twitter },
  { label: "YouTube", href: "#", icon: Youtube },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitted" | "error">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email.includes("@") || !form.message) {
      setStatus("error");
      return;
    }
    setStatus("submitted");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-16">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-action">We&apos;d Love to Hear From You</p>
        <h1 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">Get in Touch</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#716D67]">
          Question about an order, a product, or just want to say hi? Send us a message and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-[#F6F5F3] p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <Clock size={20} />
            </span>
            <h2 className="mt-4 text-base font-bold text-[#16161A]">Response Time</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#716D67]">
              We typically reply within 24–48 hours. Order-related messages get priority.
            </p>
          </div>

          <div className="rounded-3xl bg-[#F6F5F3] p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <MessageCircle size={20} />
            </span>
            <h2 className="mt-4 text-base font-bold text-[#16161A]">Prefer Social?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#716D67]">Reach us on any of these instead.</p>
            <div className="mt-4 flex gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition hover:bg-primary hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 p-7 sm:p-9">
          {status === "submitted" ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-status/10 text-status">
                <Send size={24} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-[#16161A]">Message sent</h2>
              <p className="mt-1.5 max-w-xs text-sm text-[#716D67]">
                Thanks for reaching out — we&apos;ll get back to you at {form.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#16161A] outline-none focus:border-action"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#16161A] outline-none focus:border-action"
                  placeholder="you@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#16161A] outline-none focus:border-action"
                  placeholder="What's this about?"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#16161A] outline-none focus:border-action"
                  placeholder="Tell us more..."
                />
              </div>

              {status === "error" && (
                <p className="sm:col-span-2 text-xs font-bold text-[#C05A32]">
                  Please fill in your name, a valid email, and a message.
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F6C935] to-[#C99200] px-8 text-sm font-extrabold text-[#16161A] shadow-[0_6px_16px_-6px_rgba(201,146,0,0.55)] transition hover:brightness-105 sm:col-span-2 sm:w-fit"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
