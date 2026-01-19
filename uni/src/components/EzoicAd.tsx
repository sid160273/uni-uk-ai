"use client";

import { useEffect, useRef } from "react";
import { trackEzoicAdLoaded, trackAdClick } from "@/lib/analytics";

interface EzoicAdProps {
  placementId: number;
}

declare global {
  interface Window {
    ezstandalone: {
      cmd: Array<() => void>;
      showAds: (...ids: number[]) => void;
      destroyPlaceholders: (...ids: number[]) => void;
      destroyAll: () => void;
    };
  }
}

export function EzoicAd({ placementId }: EzoicAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show ad when component mounts
    if (typeof window !== "undefined" && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        window.ezstandalone.showAds(placementId);

        // Track ad loaded
        trackEzoicAdLoaded(placementId);
      });
    }

    // Cleanup: destroy placeholder when component unmounts
    return () => {
      if (typeof window !== "undefined" && window.ezstandalone) {
        window.ezstandalone.cmd.push(function () {
          window.ezstandalone.destroyPlaceholders(placementId);
        });
      }
    };
  }, [placementId]);

  useEffect(() => {
    // Track clicks on the ad container
    const adElement = adRef.current;
    if (!adElement) return;

    const handleClick = (e: MouseEvent) => {
      // Track any click within the ad container as a potential ad click
      trackAdClick(`ezoic_${placementId}`, 'ezoic');
    };

    adElement.addEventListener('click', handleClick, true);

    return () => {
      adElement.removeEventListener('click', handleClick, true);
    };
  }, [placementId]);

  return <div ref={adRef} id={`ezoic-pub-ad-placeholder-${placementId}`} />;
}
