import type { ReactNode } from "react";

// Inline SVG marks so the row costs no extra requests and stays crisp.
const BADGES: { name: string; mark: ReactNode }[] = [
  {
    name: "Visa",
    mark: (
      <text x="30" y="21" textAnchor="middle" fontSize="15" fontWeight="900" fontStyle="italic" fill="#1A1F71" fontFamily="Arial, sans-serif">
        VISA
      </text>
    ),
  },
  {
    name: "Mastercard",
    mark: (
      <>
        <circle cx="24" cy="16" r="9" fill="#EB001B" />
        <circle cx="36" cy="16" r="9" fill="#F79E1B" />
        <path d="M30 8.9a9 9 0 0 1 0 14.2 9 9 0 0 1 0-14.2z" fill="#FF5F00" />
      </>
    ),
  },
  {
    name: "American Express",
    mark: (
      <>
        <rect x="6" y="5" width="48" height="22" rx="3" fill="#2E77BC" />
        <text x="30" y="20" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">
          AMEX
        </text>
      </>
    ),
  },
  {
    name: "Discover",
    mark: (
      <>
        <text x="27" y="19.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#231F20" fontFamily="Arial, sans-serif">
          DISCOVER
        </text>
        <circle cx="50" cy="16" r="4" fill="#F58220" />
      </>
    ),
  },
  {
    name: "Apple Pay",
    mark: (
      <>
        <path
          transform="translate(11 8.5) scale(0.6)"
          fill="#000"
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        />
        <text x="27" y="21" fontSize="13" fontWeight="700" fill="#000" fontFamily="Arial, sans-serif">
          Pay
        </text>
      </>
    ),
  },
  {
    name: "Google Pay",
    mark: (
      <text x="30" y="21" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#5F6368"> Pay</tspan>
      </text>
    ),
  },
  {
    name: "PayPal",
    mark: (
      <text x="30" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="Arial, sans-serif">
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    ),
  },
];

export function PaymentBadges({
  className = "",
  compact = false,
  align = "center",
}: {
  className?: string;
  /** Smaller tiles and no heading line — for tight spots like under Add to Cart. */
  compact?: boolean;
  align?: "center" | "start";
}) {
  const justify = align === "start" ? "justify-start" : "justify-center";
  return (
    <div className={className}>
      {!compact && (
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#716D67]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Secure payment — all major cards &amp; wallets accepted
        </p>
      )}
      <ul className={`${compact ? "" : "mt-2.5"} flex flex-nowrap items-center ${justify} gap-1.5`} aria-label="Accepted payment methods">
        {BADGES.map((b) => (
          <li key={b.name} className={`flex flex-shrink-0 items-center justify-center rounded-md border border-black/10 bg-white shadow-sm ${compact ? "h-7 w-11" : "h-8 w-[3.25rem] sm:w-14"}`}>
            <svg viewBox="0 0 60 32" className="h-full w-full" role="img" aria-label={b.name}>
              {b.mark}
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
