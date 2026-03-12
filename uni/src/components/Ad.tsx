"use client";

import { AdSense } from "./AdSense";
import { MediaNetAd } from "./MediaNetAd";
import { EzoicAd } from "./EzoicAd";

/**
 * Unified Ad Component
 *
 * Switches between ad networks based on AD_NETWORK environment variable.
 * Set AD_NETWORK in .env.local to: "adsense" | "medianet" | "ezoic"
 *
 * Default: adsense
 */

type AdNetwork = "adsense" | "medianet" | "ezoic";

interface AdProps {
  // AdSense props
  adSlot?: string;
  adFormat?: string;

  // Media.net props - maps to standard IAB sizes
  size?: "leaderboard" | "rectangle" | "skyscraper" | "mobile" | "large-rectangle";

  // Ezoic props
  placementId?: number;

  // Common props
  className?: string;
  style?: React.CSSProperties;
}

// Map our simplified size names to Media.net dimensions
const sizeMap: Record<string, "728x90" | "300x250" | "160x600" | "320x50" | "300x600"> = {
  leaderboard: "728x90",      // Horizontal banner
  rectangle: "300x250",       // Medium rectangle (most common)
  skyscraper: "160x600",      // Vertical sidebar
  mobile: "320x50",           // Mobile banner
  "large-rectangle": "300x600", // Large vertical
};

// Default AdSense slots for different sizes
const defaultAdSlots: Record<string, string> = {
  leaderboard: "5017740535",
  rectangle: "5811947452",
  skyscraper: "4285622107",
  mobile: "5017740535",
  "large-rectangle": "5811947452",
};

// Default Ezoic placement IDs
const defaultEzoicPlacements: Record<string, number> = {
  leaderboard: 101,
  rectangle: 102,
  skyscraper: 103,
  mobile: 104,
  "large-rectangle": 105,
};

export function Ad({
  adSlot,
  adFormat = "auto",
  size = "rectangle",
  placementId,
  className = "",
  style = { display: "block" },
}: AdProps) {
  // Get the ad network from environment variable
  // Default to adsense if not set
  const adNetwork = (process.env.NEXT_PUBLIC_AD_NETWORK || "adsense") as AdNetwork;

  switch (adNetwork) {
    case "medianet":
      return (
        <MediaNetAd
          size={sizeMap[size] || "300x250"}
          className={className}
        />
      );

    case "ezoic":
      return (
        <EzoicAd
          placementId={placementId || defaultEzoicPlacements[size] || 101}
        />
      );

    case "adsense":
    default:
      return (
        <AdSense
          adSlot={adSlot || defaultAdSlots[size] || "5017740535"}
          adFormat={adFormat}
          style={style}
          className={className}
        />
      );
  }
}
