/**
 * Section Data Helper
 * Fetches and filters blog posts for section hubs.
 * Caches results within a request to avoid multiple Google Sheets calls.
 */

import { getAllBlogPostsCombined } from './blog-data';
import { deduplicatePosts } from './dedup-posts';
import { getSection, SectionConfig } from './sections';

// Simple in-memory cache with TTL (shared across requests in the same serverless instance)
let cachedPosts: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getCachedPosts() {
  const now = Date.now();
  if (cachedPosts && now - cacheTimestamp < CACHE_TTL) {
    return cachedPosts;
  }
  cachedPosts = await getAllBlogPostsCombined();
  cacheTimestamp = now;
  return cachedPosts;
}

/**
 * Get all posts for a section, filtered by its mapped categories.
 * Returns deduplicated posts sorted by date (newest first).
 */
export async function getSectionPosts(sectionSlug: string, limit?: number) {
  const section = getSection(sectionSlug);
  if (!section) return [];

  const allPosts = await getCachedPosts();

  // Empty categories = all posts (for "trending" section)
  const filtered = section.categories.length > 0
    ? allPosts.filter(post => section.categories.includes(post.category))
    : allPosts;

  const deduped = deduplicatePosts(filtered);
  return limit ? deduped.slice(0, limit) : deduped;
}

/**
 * Get the top N trending stories for a section (for heroes and preview cards).
 */
export async function getSectionTopStories(sectionSlug: string, limit: number = 5) {
  return getSectionPosts(sectionSlug, limit);
}

/**
 * Get post counts per section (for homepage preview cards).
 */
export async function getSectionCounts(): Promise<Record<string, number>> {
  const allPosts = await getCachedPosts();
  const counts: Record<string, number> = {};

  // Count for each section
  const { SECTIONS } = await import('./sections');
  for (const section of SECTIONS) {
    if (section.categories.length > 0) {
      counts[section.slug] = allPosts.filter(p => section.categories.includes(p.category)).length;
    } else if (section.slug === 'trending') {
      counts[section.slug] = allPosts.length;
    }
  }

  return counts;
}
