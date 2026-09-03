import { Cloud, Zap, Star, ShieldCheck } from "lucide-react";

// Digital-only trust strip, full width. Each tile is either a plain fact
// (no shipping, delivered by email, SSL) or a qualitative claim with no
// invented number — no fake "10,000+ customers" or "4.9 stars" since
// product.rating is null on every real product and there's no real
// customer-count figure to show.
const ITEMS = [
  { icon: Cloud, color: "text-[#2F6FED]", bg: "bg-[#EAF1FE]", title: "Digital Product", subtitle: "No Physical Shipping" },
  { icon: Zap, color: "text-[#D97706]", bg: "bg-[#FEF3E2]", title: "Instant Delivery", subtitle: "Delivered by Email" },
  { icon: Star, color: "text-action-ink", bg: "bg-action/15", title: "Trusted by Customers", subtitle: "Real Digital Delivery" },
  { icon: ShieldCheck, color: "text-primary", bg: "bg-primary-light", title: "Secure Checkout", subtitle: "SSL Encrypted" },
];

export function DigitalTrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-5 rounded-2xl border border-black/5 bg-white p-5 sm:grid-cols-4 sm:gap-6 sm:p-6">
      {ITEMS.map(({ icon: Icon, color, bg, title, subtitle }) => (
        <div key={title} className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
            <Icon size={20} />
          </span>
          <div>
            <p className="text-[13px] font-extrabold leading-tight text-[#16161A]">{title}</p>
            <p className="text-[11.5px] text-[#8B8880]">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
