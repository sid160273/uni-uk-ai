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
    // Check if ad actually loaded after a delay
    const timer = setTimeout(() => {
      if (adRef.current) {
        const children = adRef.current.children;
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
        id={`ad-placeholder-${id}`}
        className="w-full flex items-center justify-center"
      />
    </div>
  );
}
