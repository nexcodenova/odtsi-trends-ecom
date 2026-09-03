import { LegalPage } from "@/components/legal/legal-page";

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns & Refund Policy" updated="September 3, 2026">
      <p>
        We want you to be happy with what you buy from ODTSI, operated by{" "}
        <strong>Fairam (Private) Limited</strong>. This policy explains how returns and refunds work, and it
        differs depending on the type of product you bought.
      </p>

      <h2>1. Physical products — 30-Day Money-Back Guarantee</h2>
      <p>
        Physical products come with a 30-day money-back guarantee. If you&rsquo;re not satisfied, contact us
        within 30 days of delivery and we&rsquo;ll arrange a return and a full refund to your original payment
        method once the item is received back in its original condition. Shipping costs for the return itself may
        apply unless the item arrived faulty or wasn&rsquo;t what you ordered, in which case we cover it.
      </p>
      <p>
        If you&rsquo;re a UK or EU consumer, you also have a statutory 14-day right of withdrawal under distance
        selling law, separate from and in addition to this guarantee — whichever gives you more time and better
        terms applies.
      </p>

      <h2>2. Digital products and subscriptions</h2>
      <p>
        Digital products are delivered electronically, typically by email, once your order is confirmed. Because
        digital access and activation codes can&rsquo;t be &ldquo;returned&rdquo; the way a physical item can,
        refund eligibility depends on whether the product has been activated:
      </p>
      <ul>
        <li>
          If you haven&rsquo;t activated or used the digital product yet, contact us within 14 days of purchase
          for a full refund.
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
          If you received the wrong product, an invalid activation, or the digital delivery never arrived, we&rsquo;ll
          investigate and make it right — including a full refund where appropriate — regardless of activation
          status.
        </li>
      </ul>

      <h2>3. Affiliate products</h2>
      <p>
        Affiliate products are purchased directly on a third-party seller&rsquo;s own site, not through ODTSI.
        Returns and refunds for those orders are handled entirely by that third-party seller, under their own
        policy — this Returns &amp; Refund Policy doesn&rsquo;t apply to them.
      </p>

      <h2>4. Damaged, faulty, or incorrect items</h2>
      <p>
        If a physical item arrives damaged, faulty, or different from what you ordered, contact us within 30 days
        with photos where possible. We&rsquo;ll arrange a replacement or full refund, including return shipping,
        at no cost to you.
      </p>

      <h2>5. How refunds are processed</h2>
      <p>
        Approved refunds are issued to your original payment method. Processing times depend on your bank or
        card provider, typically a few business days after we confirm the refund.
      </p>

      <h2>6. How to start a return or refund</h2>
      <p>
        Contact us with your order number and the reason for your request via our{" "}
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
