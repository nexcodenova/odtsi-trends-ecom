import { Flame, Truck, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Flame,
    title: "Trend-spotted, not stockpiled",
    description: "We track what's actually going viral and get it listed fast — not warehouses of last season's guesses.",
  },
  {
    icon: Truck,
    title: "Delivered across 5 countries",
    description: "UK, US, EU, Australia and Canada — one storefront, fast delivery wherever you are.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout, every order",
    description: "Encrypted payment, real order tracking, and a team that actually answers when something's wrong.",
  },
];

export function WhyOdtsi() {
  return (
    <section className="bg-primary-light px-4 py-14 sm:px-5 sm:py-20">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-primary">Why ODTSI</p>
      <h2 className="mt-2 text-center text-2xl font-extrabold text-[#16161A] sm:text-3xl">
        The trust part, out of the way
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="flex flex-col rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <Icon size={22} />
              </span>
              <span className="text-4xl font-extrabold text-primary-light">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-base font-bold text-[#16161A]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#716D67]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
