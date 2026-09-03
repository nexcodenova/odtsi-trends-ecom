import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 3, 2026">
      <p>
        ODTSI (&ldquo;ODTSI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is operated by{" "}
        <strong>Fairam (Private) Limited</strong>, a company registered in Sri Lanka and Dubai, United Arab
        Emirates, and built and maintained by <strong>NexCodeNova</strong>. This Privacy Policy explains what
        personal data we collect when you use odtsi.com (the &ldquo;Site&rdquo;), why we collect it, and the
        choices you have.
      </p>

      <h2>1. Who this applies to</h2>
      <p>
        This policy applies to all visitors and customers of the Site, wherever you&rsquo;re located, including
        customers in the United Kingdom, the European Union, the United States, Canada, and Australia. Where local
        law gives you stronger rights than this policy describes, your local law applies.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — name, email address, and password (stored securely, never in
          plain text) if you create an account.
        </li>
        <li>
          <strong>Order information</strong> — your name, email, phone number, and shipping address, which is
          shared with our order-fulfillment platform (see Section 4) to process and deliver your order.
        </li>
        <li>
          <strong>Wishlist and cart data</strong> — stored in your browser to remember what you&rsquo;ve saved or
          added; this doesn&rsquo;t leave your device unless you check out.
        </li>
        <li>
          <strong>Contact form submissions</strong> — your name, email, and message when you reach out to us.
        </li>
        <li>
          <strong>Basic usage data</strong> — such as which products you&rsquo;ve viewed, used to show real,
          honest signals like view counts and popular products. We don&rsquo;t sell this data or use it for
          third-party advertising.
        </li>
      </ul>

      <h2>3. What we don&rsquo;t do</h2>
      <p>
        We don&rsquo;t sell your personal data to third parties. We don&rsquo;t show fabricated reviews, ratings,
        or statistics — anything you see on the Site reflecting customer activity (views, sales, ratings) is real
        or hidden entirely when it isn&rsquo;t available.
      </p>

      <h2>4. Who we share data with</h2>
      <p>
        To actually fulfil your order, we share the order details above with <strong>ExiusCart</strong>, the
        commerce platform that processes and manages orders, inventory, and fulfilment on our behalf. If you buy a
        digital product or subscription, the relevant activation details may also be shared with the underlying
        service provider (e.g. the software or subscription publisher) strictly to deliver that product to you —
        see our{" "}
        <a href="/terms" className="font-bold text-primary underline-offset-2 hover:underline">
          Terms of Service
        </a>{" "}
        for more on how digital/reseller products work. We don&rsquo;t share your data with anyone else except
        where required by law.
      </p>

      <h2>5. Payment information</h2>
      <p>
        We never see or store your full card details. Payment is handled directly by our payment processor at
        checkout; ODTSI only receives confirmation that a payment succeeded or failed.
      </p>

      <h2>6. Cookies</h2>
      <p>
        The Site uses only the cookies necessary to keep you signed in and remember your cart/wishlist. We
        currently don&rsquo;t use analytics or advertising cookies. If that changes, we&rsquo;ll update this
        section and ask for your consent where required (for example, under UK/EU cookie law).
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete, or export your personal
        data, and to object to certain uses of it. UK and EU residents have these rights under the UK GDPR and EU
        GDPR respectively. To exercise any of these rights, contact us using the details below.
      </p>

      <h2>8. Data retention</h2>
      <p>
        We keep account and order data for as long as your account is active or as needed to meet legal, tax, and
        accounting obligations, then delete or anonymize it.
      </p>

      <h2>9. Children</h2>
      <p>The Site is not directed at children under 16, and we don&rsquo;t knowingly collect their data.</p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page
        will always reflect the most recent version.
      </p>

      <h2>11. Contact us</h2>
      <p>
        Questions about this policy or your data? Email us at{" "}
        <a href="mailto:privacy@odtsi.com" className="font-bold text-primary underline-offset-2 hover:underline">
          privacy@odtsi.com
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
