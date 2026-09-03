import { LegalPage } from "@/components/legal/legal-page";

export default function ReturnsPage() {
  return (
    <LegalPage title="Shipping & Returns" updated="September 3, 2026">
      <p>
        This page explains how delivery, returns, and refunds work at ODTSI, operated by{" "}
        <strong>Fairam (Private) Limited</strong>. It differs a little depending on the type of product you
        bought, so read the section that applies to your order.
      </p>

      <h2>1. Delivery times</h2>
      <p>
        Orders are typically processed within 1–3 business days. Delivery generally takes 7–20 business days
        depending on your location and the specific item — some items arrive sooner, others take longer during
        high-demand periods. You&rsquo;ll receive a real tracking number by email once your physical order ships.
      </p>

      <h2>2. Physical products</h2>
      <p>
        If your order arrives damaged, defective, or isn&rsquo;t what you ordered, contact us within 7 days of
        delivery with a photo of the item and we&rsquo;ll send a free replacement or full refund — no need to send
        anything back.
      </p>
      <p>
        Because items are sourced or made to order rather than kept in our own warehouse, we&rsquo;re not able to
        accept returns for change-of-mind purchases once an order has shipped. If your order hasn&rsquo;t shipped
        yet, contact us right away and we&rsquo;ll do our best to cancel or adjust it before it goes out.
      </p>
      <p>
        If you&rsquo;re a UK or EU consumer, this doesn&rsquo;t affect your statutory right of withdrawal under
        distance selling law where it applies — see Section 6 of our{" "}
        <a href="/terms" className="font-bold text-primary underline-offset-2 hover:underline">
          Terms of Service
        </a>
        .
      </p>

      <h2>3. Digital products and subscriptions</h2>
      <p>
        Digital products are delivered electronically, typically by email, once your order is confirmed. Because
        digital access and activation codes can&rsquo;t be &ldquo;returned&rdquo; the way a physical item can,
        refund eligibility depends on whether the product has been activated:
      </p>
      <ul>
        <li>
          If you haven&rsquo;t activated or used the digital product yet, contact us within 7 days of purchase for
          a full refund.
        </li>
        <li>
          Once a digital subscription or license has been activated, refunds may be limited or unavailable,
          consistent with the terms of the original software or subscription provider (see Section 3 of our{" "}
          <a href="/terms" className="font-bold text-primary underline-offset-2 hover:underline">
            Terms of Service
          </a>{" "}
          on authorized reseller products).
        </li>
        <li>
          If you received the wrong product, an invalid activation, or the digital delivery never arrived,
          we&rsquo;ll investigate and make it right — including a full refund where appropriate — regardless of
          activation status.
        </li>
      </ul>

      <h2>4. Affiliate products</h2>
      <p>
        Affiliate products are purchased directly on a third-party seller&rsquo;s own site, not through ODTSI.
        Delivery, returns, and refunds for those orders are handled entirely by that third-party seller, under
        their own policy — this page doesn&rsquo;t apply to them.
      </p>

      <h2>5. How refunds are processed</h2>
      <p>Approved refunds are issued to your original payment method within 5–10 business days.</p>

      <h2>6. How to start a return or refund</h2>
      <p>
        Contact us with your order number, a description of the issue, and a photo where relevant, via our{" "}
        <a href="/contact" className="font-bold text-primary underline-offset-2 hover:underline">
          Contact page
        </a>{" "}
        or email{" "}
        <a href="mailto:enquery@odtsi.com" className="font-bold text-primary underline-offset-2 hover:underline">
          enquery@odtsi.com
        </a>
        , and we&rsquo;ll guide you through the next steps.
      </p>
    </LegalPage>
  );
}
