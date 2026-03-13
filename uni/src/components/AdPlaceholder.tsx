"use client";

import { useEffect, useRef, useState } from "react";

interface AdPlaceholderProps {
  id: string;
  className?: string;
  format?: "horizontal" | "rectangle" | "vertical";
}

export function AdPlaceholder({ id, className = "", format = "horizontal" }: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    // Try to trigger Ezoic ad display
    if (typeof window !== "undefined" && (window as any).ezstandalone) {
      (window as any).ezstandalone.cmd.push(function () {
        (window as any).ezstandalone.showAds();
      });
    }

    // Check if ad actually loaded after a delay
    const timer = setTimeout(() => {
      if (adRef.current) {
        const children = adRef.current.children;
        // If Ezoic injected content, it will have child elements
        if (children.length > 0) {
          setHasAd(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full flex flex-col items-center ${hasAd ? "my-4" : "my-1"} ${className}`}>
      {hasAd && (
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">
          Advertisement
        </span>
      )}
      <div
        ref={adRef}
        id={`ezoic-pub-ad-placeholder-${id}`}
        className="w-full flex items-center justify-center"
      />
    </div>
  );
}
