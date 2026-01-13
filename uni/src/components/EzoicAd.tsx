"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    // Show ad when component mounts
    if (typeof window !== "undefined" && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        window.ezstandalone.showAds(placementId);
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

  return <div id={`ezoic-pub-ad-placeholder-${placementId}`} />;
}
