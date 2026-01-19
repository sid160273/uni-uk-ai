"use client";

import { useEffect, useRef } from "react";
import { trackAdSenseLoaded, trackAdClick } from "@/lib/analytics";

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
  className = "",
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        // Track ad loaded
        trackAdSenseLoaded(adSlot);
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [adSlot]);

  useEffect(() => {
    // Track clicks on the ad container
    const adElement = adRef.current;
    if (!adElement) return;

    const handleClick = (e: MouseEvent) => {
      // Check if click is on an iframe (ad content)
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || target.closest('iframe')) {
        trackAdClick(adSlot, 'adsense');
      }
    };

    adElement.addEventListener('click', handleClick, true);

    return () => {
      adElement.removeEventListener('click', handleClick, true);
    };
  }, [adSlot]);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-4540315059867204"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
