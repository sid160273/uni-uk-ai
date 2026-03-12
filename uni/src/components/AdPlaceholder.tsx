"use client";

import { useEffect, useRef } from "react";

interface AdPlaceholderProps {
  id: string;
  className?: string;
  format?: "horizontal" | "rectangle" | "vertical";
}

export function AdPlaceholder({ id, className = "", format = "horizontal" }: AdPlaceholderProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to trigger Ezoic ad display
    if (typeof window !== "undefined" && (window as any).ezstandalone) {
      (window as any).ezstandalone.cmd.push(function () {
        (window as any).ezstandalone.showAds();
      });
    }
  }, []);

  const minHeight = format === "horizontal" ? "90px" : format === "rectangle" ? "250px" : "600px";

  return (
    <div className={`w-full flex flex-col items-center my-4 ${className}`}>
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">
        Advertisement
      </span>
      <div
        ref={adRef}
        id={`ezoic-pub-ad-placeholder-${id}`}
        className="w-full flex items-center justify-center"
        style={{ minHeight }}
      />
    </div>
  );
}
