import { Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";

// Physical's equivalent of DigitalTrustStrip — same full-width, colorful-icon
// treatment, replacing the old narrower in-column benefits row + separate
// SecureCheckoutStrip bar with one consistent strip. Every tile is a real
// claim matching our real Returns & Refund Policy (/returns) — items are
// sourced/made to order, so it's damaged/defective/wrong-item coverage,
// not a blanket "return for any reason" guarantee.
const ITEMS = [
  { icon: Truck, color: "text-[#2F6FED]", bg: "bg-[#EAF1FE]", title: "Free Shipping", subtitle: "Tracked Delivery" },
  { icon: ShieldCheck, color: "text-primary", bg: "bg-primary-light", title: "Secure Checkout", subtitle: "SSL Encrypted" },
  { icon: RotateCcw, color: "text-[#D97706]", bg: "bg-[#FEF3E2]", title: "Damage Protection", subtitle: "Free Replacement" },
  { icon: Star, color: "text-action-ink", bg: "bg-action/15", title: "Trusted by Customers", subtitle: "Genuine Products" },
];

export function PhysicalTrustStrip() {
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
