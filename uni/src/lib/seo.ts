import type { Metadata } from "next";

/**
 * Applied to the legacy general-news archive (blog posts, topic hubs, crypto
 * and the sport/tech/business/entertainment hubs).
 *
 * These pages were generated when the site ran as a news portal. They stay
 * live so existing links do not 404, but they are excluded from the index and
 * from sitemap.xml so that Google reads uni-uk.ai as a UK university and
 * Clearing site rather than a stale general-news one. `follow` is kept so link
 * equity still flows through to the university pages.
 *
 * To bring a section back into the index, remove this from its metadata and
 * add its URLs back to src/app/sitemap.ts.
 */
export const NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
};
