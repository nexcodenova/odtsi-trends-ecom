"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// Renders nothing — no script tags, no console noise — until a real ID is
// set. No placeholder pixel ID, ever: a fake one would silently "work"
// (no error, just events nobody's account ever receives), which is worse
// than the feature visibly not being there yet.
//
// strategy="beforeInteractive" is deliberate, not the more common
// "afterInteractive" — confirmed by testing this directly: a product page
// loaded straight from a URL (not a client-side nav from another page)
// fires its ViewContent tracking call from a mount effect that can run
// before an "afterInteractive" script has executed, silently dropping the
// very first pixel event of the visit (window.fbq isn't a function yet,
// so the call is a no-op, never retried). beforeInteractive runs before
// any page code hydrates, so fbq/gtag are guaranteed to exist by the time
// any component's effects fire.
function MetaPixel() {
  if (!META_PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="beforeInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${META_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}

function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;
  return (
    <>
      {/* Defines window.gtag/dataLayer before hydration, same race-condition
          reasoning as MetaPixel above. The actual gtag.js file can still
          load after interactive — it only needs dataLayer to already exist
          by the time it arrives to pick up everything queued before it. */}
      <Script id="google-ads-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
          window.gtag = gtag;
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
    </>
  );
}

// Next's App Router never does a full page reload between routes, so
// neither pixel's own base script sees a real "new page" after the first
// load — this re-fires PageView/page_view by hand on every route change so
// retargeting audiences built on "visited X pages" stay real, not stuck at
// whatever page the shopper first landed on. Pathname only (no query
// string) — keeps this out of useSearchParams' Suspense-boundary
// requirement, and a product/category's identity is in the path anyway.
function RouteChangeTracker() {
  const pathname = usePathname();
  // Both base scripts already fire their own first PageView — skip this
  // effect's very first run so a fresh page load doesn't get counted twice.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window.fbq === "function") window.fbq("track", "PageView");
    if (typeof window.gtag === "function" && GOOGLE_ADS_ID) {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  return null;
}

export function TrackingScripts() {
  return (
    <>
      <MetaPixel />
      <GoogleAdsTag />
      <RouteChangeTracker />
    </>
  );
}
