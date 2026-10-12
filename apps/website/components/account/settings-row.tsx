"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

// Collapsed by default so the settings card stays a short list of rows —
// each form only opens when the shopper actually wants to change something.
export function SettingsRow({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex items-center gap-3 text-sm font-bold text-[#16161A]">
          <Icon size={18} className="text-primary" />
          {label}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {hint && <span className="truncate text-xs text-[#8B8880]">{hint}</span>}
          <ChevronDown size={18} className={`shrink-0 text-[#8B8880] transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
