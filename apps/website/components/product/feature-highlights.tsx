import type { ProductSpec } from "@odtsi/exiuscart-client";

// Only ever called when specs.length > 0 (gated in the product page) — no
// placeholder icon row when ExiusCart hasn't set specs for a product yet.
export function FeatureHighlights({ specs }: { specs: ProductSpec[] }) {
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-3 rounded-2xl border border-black/10 p-5 sm:grid-cols-4">
      {specs.map((spec) => (
        <div key={spec.label} className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-lg">
            {spec.icon}
          </span>
          <p className="mt-2 text-xs font-bold leading-tight text-[#16161A]">{spec.label}</p>
        </div>
      ))}
    </div>
  );
}
