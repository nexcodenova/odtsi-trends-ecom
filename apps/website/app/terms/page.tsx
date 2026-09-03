import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 3, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of odtsi.com (the &ldquo;Site&rdquo;) and any
        purchase you make through it. ODTSI is operated by <strong>Fairam (Private) Limited</strong>, a company
        registered in Sri Lanka and Dubai, United Arab Emirates, and built and maintained by{" "}
        <strong>NexCodeNova</strong>. By using the Site or placing an order, you agree to these Terms.
      </p>

      <h2>1. Who we are</h2>
      <p>
        ODTSI is a storefront selling trending lifestyle products to customers in the UK, EU, US, Canada,
        Australia, and beyond. Orders, payments, inventory, and fulfilment are processed through{" "}
        <strong>ExiusCart</strong>, our commerce platform partner. When you place an order, you&rsquo;re entering
        into a sale with Fairam (Private) Limited trading as ODTSI, fulfilled via ExiusCart.
      </p>

      <h2>2. Product types</h2>
      <p>The Site sells three kinds of listings, and it matters which one you&rsquo;re buying:</p>
      <ul>
        <li>
          <strong>Physical products</strong> — shipped to your address, with real tracking once dispatched.
        </li>
        <li>
          <strong>Digital products</strong> — delivered electronically (typically by email) after your order is
          processed, with no physical shipment.
        </li>
        <li>
          <strong>Affiliate products</strong> — listed on the Site for discovery, but purchased directly through a
          third-party seller&rsquo;s own site via an external link. ODTSI does not process payment, fulfil, or take
          responsibility for these orders — the third-party seller&rsquo;s own terms and policies apply instead.
        </li>
      </ul>

      <h2>3. Authorized reseller of digital products</h2>
      <p>
        For digital subscriptions and software listed on the Site (for example, learning platforms or productivity
        software), ODTSI acts as an <strong>authorized reseller</strong>, not the original publisher. Your access
        to the underlying product or service is granted according to the terms of the original provider in
        addition to these Terms, and features, availability, and support for that underlying product remain that
        provider&rsquo;s responsibility. We&rsquo;ll always tell you clearly on the product page when this applies.
      </p>

      <h2>4. Pricing and currency</h2>
      <p>
        Prices are shown exactly as set by the seller for each product, in the currency shown on the product page.
        We don&rsquo;t apply hidden markups or currency conversions on top of what&rsquo;s displayed. Prices can
        change at any time before you complete checkout; the price at checkout is the price you pay.
      </p>

      <h2>5. Orders and payment</h2>
      <p>
        Placing an order is an offer to buy, which we accept once payment is confirmed and your order is created.
        We reserve the right to cancel or refuse an order — for example if a product is no longer available, if
        there&rsquo;s a pricing error, or if we suspect fraud — and will refund you in full if that happens.
      </p>

      <h2>6. Refunds and returns</h2>
      <p>
        Our full refund and returns terms, including our money-back guarantee, are set out in our{" "}
        <a href="/returns" className="font-bold text-primary underline-offset-2 hover:underline">
          Returns &amp; Refund Policy
        </a>
        . Nothing in these Terms limits the statutory rights you have as a consumer under the law of your country
        of residence — including the 14-day right of withdrawal available to UK and EU consumers under distance
        selling law.
      </p>

      <h2>7. Your account</h2>
      <p>
        If you create an account, you&rsquo;re responsible for keeping your login details secure and for any
        activity under your account. Tell us right away if you think your account has been compromised.
      </p>

      <h2>8. Acceptable use</h2>
      <p>
        You agree not to misuse the Site — including attempting to access it in unauthorized ways, interfering
        with its operation, or using it for any unlawful purpose.
      </p>

      <h2>9. Liability</h2>
      <p>
        We aim to describe every product accurately using the seller&rsquo;s real information. To the extent
        permitted by law, ODTSI&rsquo;s liability for any claim relating to your order is limited to the amount
        you paid for that order. Nothing in these Terms excludes liability that can&rsquo;t legally be excluded,
        including liability for fraud or for death or personal injury caused by negligence.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to Fairam (Private) Limited&rsquo;s place of registration.
        If you&rsquo;re a consumer in the UK or EU, this doesn&rsquo;t take away the protections you&rsquo;re
        entitled to under the mandatory consumer-protection laws of your own country of residence.
      </p>

      <h2>11. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date above always reflects the
        current version. Continuing to use the Site after a change means you accept the updated Terms.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:support@odtsi.com" className="font-bold text-primary underline-offset-2 hover:underline">
          support@odtsi.com
        </a>{" "}
        or use our{" "}
        <a href="/contact" className="font-bold text-primary underline-offset-2 hover:underline">
          Contact page
        </a>
        .
      </p>
    </LegalPage>
  );
}
