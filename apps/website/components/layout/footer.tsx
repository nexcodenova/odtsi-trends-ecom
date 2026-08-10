import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Categories", href: "/category" },
      { label: "Trending Now", href: "/collection/trending" },
      { label: "On Sale", href: "/collection/on-sale" },
      { label: "New Arrivals", href: "/collection/new" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track My Order", href: "/order" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ODTSI", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-[#F6F5F3]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-12 sm:grid-cols-4">
        <div>
          <span className="text-lg font-extrabold text-primary">ODTSI</span>
          <p className="mt-3 max-w-[22ch] text-xs text-[#716D67]">
            Trending finds, delivered fast to the UK, US, EU, Australia and Canada.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#8B8880]">{column.title}</h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#4A4844] hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-[#8B8880]">
        &copy; {new Date().getFullYear()} ODTSI. All rights reserved.
      </div>
    </footer>
  );
}
