import { LegalPage } from "@/components/legal/legal-page";

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Info" updated="October 9, 2026">
      <p>
        This page covers how delivery works at ODTSI, operated by <strong>Fairam (Private) Limited</strong>. For
        returns and refunds, see our{" "}
        <a href="/returns" className="font-bold text-primary underline-offset-2 hover:underline">
          Shipping &amp; Returns
        </a>{" "}
        page.
      </p>

      <h2>1. Processing time</h2>
      <p>Orders are typically processed within 1–3 business days before they ship.</p>

      <h2>2. Delivery time</h2>
      <p>
        Delivery generally takes 7–20 business days depending on your location and the specific item — some items
        arrive sooner, others take longer during high-demand periods.
      </p>

      <h2>3. Tracking</h2>
      <p>
        You&rsquo;ll receive a real tracking number by email once your physical order ships. You can also look it
        up any time on our{" "}
        <a href="/order" className="font-bold text-primary underline-offset-2 hover:underline">
          Track My Order
        </a>{" "}
        page.
      </p>

      <h2>4. Digital products</h2>
      <p>Digital products are delivered electronically by email once your order is confirmed — nothing ships.</p>

      <h2>5. ODTSI Picks (affiliate products)</h2>
      <p>
        ODTSI Picks are purchased directly on a third-party seller&rsquo;s own site. Shipping for those orders is
        handled entirely by that seller, under their own shipping policy.
      </p>

      <h2>6. Questions</h2>
      <p>
        Contact us via our{" "}
        <a href="/contact" className="font-bold text-primary underline-offset-2 hover:underline">
          Contact page
        </a>{" "}
        or email{" "}
        <a href="mailto:enquery@odtsi.com" className="font-bold text-primary underline-offset-2 hover:underline">
          enquery@odtsi.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
