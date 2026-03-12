"use client";

import Script from "next/script";

/**
 * AdScripts Component
 *
 * Loads the appropriate ad network scripts based on NEXT_PUBLIC_AD_NETWORK env variable.
 * Include this component in your layout.tsx
 *
 * Options:
 * - "adsense" (default): Google AdSense
 * - "medianet": Media.net (Yahoo/Bing)
 * - "ezoic": Ezoic (already loaded separately via Ezoic scripts)
 */

export function AdScripts() {
  const adNetwork = process.env.NEXT_PUBLIC_AD_NETWORK || "adsense";

  if (adNetwork === "medianet") {
    // Media.net requires a Customer ID - you'll get this when you sign up
    const mediaNetCustomerId = process.env.NEXT_PUBLIC_MEDIANET_CUSTOMER_ID || "";

    return (
      <>
        {/* Media.net Script */}
        <Script id="medianet-init" strategy="afterInteractive">
          {`
            window._mNHandle = window._mNHandle || {};
            window._mNHandle.queue = window._mNHandle.queue || [];
          `}
        </Script>
        {mediaNetCustomerId && (
          <Script
            id="medianet-ads"
            src={`https://contextual.media.net/dmedianet.js?cid=${mediaNetCustomerId}`}
            strategy="afterInteractive"
            async
          />
        )}
      </>
    );
  }

  if (adNetwork === "adsense") {
    return (
      <>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4540315059867204"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </>
    );
  }

  // For Ezoic, scripts are loaded separately in layout.tsx
  // Return null as Ezoic has its own script management
  return null;
}
