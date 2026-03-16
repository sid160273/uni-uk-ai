import { getAllBlogPostsCombined, DynamicBlogPost } from '@/lib/blog-data';

/**
 * Converts a topic string to a URL-safe slug
 */
export function topicToSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Converts a URL slug back to a display-friendly topic name
 */
export function slugToTopic(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Returns all blog posts matching a keyword against titles, tags, and content (case-insensitive).
 * Results are sorted by relevance: tag match > title match > content match, then by date.
 */
export async function getPostsByTopic(keyword: string): Promise<DynamicBlogPost[]> {
  const allPosts = await getAllBlogPostsCombined();
  const normalizedKeyword = keyword.toLowerCase().trim();

  if (!normalizedKeyword) return [];

  const scored = allPosts
    .map(post => {
      let score = 0;

      // Exact tag match (highest relevance)
      const hasTagMatch = post.tags.some(
        tag => tag.toLowerCase() === normalizedKeyword
      );
      if (hasTagMatch) score += 10;

      // Partial tag match
      const hasPartialTagMatch = post.tags.some(
        tag => tag.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(tag.toLowerCase())
      );
      if (hasPartialTagMatch && !hasTagMatch) score += 5;

      // Title match
      if (post.title.toLowerCase().includes(normalizedKeyword)) score += 7;

      // Content match
      if (post.content.toLowerCase().includes(normalizedKeyword)) score += 2;

      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Sort by relevance first, then by date
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    });

  return scored.map(s => s.post);
}

/**
 * Extracts all unique topics from post tags for sitemap/discovery.
 * Returns slugified topic strings.
 */
export async function getAllTopics(): Promise<string[]> {
  const allPosts = await getAllBlogPostsCombined();
  const tagSet = new Set<string>();

  for (const post of allPosts) {
    for (const tag of post.tags) {
      const slug = topicToSlug(tag);
      if (slug) tagSet.add(slug);
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * Finds topics that frequently co-occur with the given keyword.
 * Returns display-name topics (not slugs) sorted by co-occurrence count.
 */
export async function getRelatedTopics(keyword: string): Promise<string[]> {
  const matchingPosts = await getPostsByTopic(keyword);
  const normalizedKeyword = keyword.toLowerCase().trim();

  // Count co-occurring tags across matched posts
  const tagCounts = new Map<string, number>();

  for (const post of matchingPosts) {
    for (const tag of post.tags) {
      // Skip the keyword itself
      if (tag.toLowerCase() === normalizedKeyword) continue;
      if (topicToSlug(tag) === topicToSlug(keyword)) continue;

      const key = tag; // preserve original casing
      tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }
  }

  // Sort by frequency, then alphabetically
  return Array.from(tagCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([tag]) => tag)
    .slice(0, 15);
}
