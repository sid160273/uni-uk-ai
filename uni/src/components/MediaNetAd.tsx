"use client";

import { useEffect, useRef } from "react";
import { trackAdClick } from "@/lib/analytics";

interface MediaNetAdProps {
  // Media.net uses different ad sizes
  size: "728x90" | "300x250" | "160x600" | "320x50" | "300x600";
  className?: string;
}

declare global {
  interface Window {
    _mNHandle: {
      queue: Array<() => void>;
    };
    _mNDetails: {
      loadTag: (containerId: string, options: object) => void;
    };
  }
}

export function MediaNetAd({ size, className = "" }: MediaNetAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const containerId = useRef(`medianet-ad-${Math.random().toString(36).substr(2, 9)}`);

  // Parse dimensions from size
  const [width, height] = size.split("x").map(Number);

  useEffect(() => {
    // Load Media.net ad when component mounts
    if (typeof window !== "undefined" && window._mNHandle) {
      window._mNHandle.queue.push(() => {
        window._mNDetails.loadTag(containerId.current, {
          type: "banner",
          width,
          height,
        });
      });
    }
  }, [width, height]);

  useEffect(() => {
    // Track clicks on the ad container
    const adElement = adRef.current;
    if (!adElement) return;

    const handleClick = () => {
      trackAdClick(`medianet_${size}`, "medianet");
    };

    adElement.addEventListener("click", handleClick, true);

    return () => {
      adElement.removeEventListener("click", handleClick, true);
    };
  }, [size]);

  return (
    <div
      ref={adRef}
      id={containerId.current}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    />
  );
}
