"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * This component handles refreshing Ezoic ads when navigating between pages
 * in Next.js (client-side navigation). It should be added once in the root layout.
 */
export function EzoicRouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Refresh all ads when route changes
    if (typeof window !== "undefined" && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        // Call showAds with no parameters to refresh all placeholders on the new page
        window.ezstandalone.showAds();
      });
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
