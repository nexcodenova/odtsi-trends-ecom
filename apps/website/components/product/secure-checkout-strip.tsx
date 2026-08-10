import { ShieldCheck, Lock } from "lucide-react";

// Static trust strip — no payment-brand logos listed here since PayHere
// integration isn't confirmed live yet; only claim what's actually true.
export function SecureCheckoutStrip() {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#F6F5F3] px-4 py-3">
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A4844]">
        <ShieldCheck size={14} className="text-status" />
        Fast &amp; Secure Checkout
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-[#8B8880]">
        <Lock size={12} />
        256-bit SSL encryption
      </span>
    </div>
  );
}
