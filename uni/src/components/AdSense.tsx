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
    // Track potential ad clicks using blur detection
    // When user clicks an ad in iframe, they leave the page (blur event)
    const adElement = adRef.current;
    if (!adElement) return;

    let mouseOverAd = false;
    let blurTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      mouseOverAd = true;
    };

    const handleMouseLeave = () => {
      mouseOverAd = false;
    };

    const handleBlur = () => {
      // If mouse was over ad when page lost focus, likely an ad click
      if (mouseOverAd) {
        // Small delay to avoid false positives
        blurTimeout = setTimeout(() => {
          trackAdClick(adSlot, 'adsense');
        }, 100);
      }
    };

    const handleFocus = () => {
      // User came back, cancel the tracking
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };

    adElement.addEventListener('mouseenter', handleMouseEnter);
    adElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      adElement.removeEventListener('mouseenter', handleMouseEnter);
      adElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (blurTimeout) clearTimeout(blurTimeout);
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
