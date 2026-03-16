/**
 * Display-time deduplication for blog posts.
 * Removes near-duplicate articles that cover the same story,
 * keeping the most recent version.
 */

const STOP_WORDS = new Set([
  'why', 'is', 'the', 'a', 'an', 'what', 'how', 'does', 'do', 'are',
  'was', 'were', 'has', 'have', 'had', 'this', 'that', 'it', 'its',
  'and', 'or', 'but', 'not', 'for', 'with', 'about', 'you', 'need',
  'to', 'know', 'today', 'now', 'right', 'trending', 'latest', 'news',
  'explained', 'happening', 'everyone', 'talking', 'here', 'heres',
  'whats', 'going', 'on', 'all', 'we', 'in', 'of', 'at', 'by', 'from',
  'up', 'out', 'into', 'over', 'just', 'more', 'than', 'been', 'being',
  'story', 'update', 'breaking', 'game', 'match', 'between',
]);

/**
 * Extract significant keywords from text (title + slug combined).
 * Strips SEO filler and stop words to get the core topic.
 */
function extractCoreKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Measures topic similarity between two posts.
 * Combines title + slug for comparison to catch cases where titles differ
 * but slugs reveal the same underlying topic.
 */
function postSimilarity(
  titleA: string,
  slugA: string,
  titleB: string,
  slugB: string
): number {
  // Combine title + slug for richer keyword extraction
  const textA = `${titleA} ${slugA.replace(/-/g, ' ')}`;
  const textB = `${titleB} ${slugB.replace(/-/g, ' ')}`;

  const wordsA = extractCoreKeywords(textA);
  const wordsB = extractCoreKeywords(textB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  // Count unique overlapping keywords
  const overlap = [...setA].filter((w) => setB.has(w)).length;
  const minLen = Math.min(setA.size, setB.size);

  return overlap / minLen;
}

/**
 * Deduplicates blog posts for display.
 * Groups posts by topic similarity and keeps only the most recent
 * from each group. Uses both title and slug for matching.
 *
 * @param posts - Already sorted by date (newest first)
 * @param threshold - Similarity threshold (0.5 = 50% keyword overlap)
 * @returns Deduplicated posts, maintaining sort order
 */
export function deduplicatePosts<
  T extends { title: string; publishedAt: string; slug: string }
>(posts: T[], threshold: number = 0.5): T[] {
  const kept: T[] = [];
  const seenSlugs = new Set<string>();

  for (const post of posts) {
    // Exact slug dedup
    if (seenSlugs.has(post.slug)) continue;

    // Check if this post's topic is too similar to one we've already kept
    const isDuplicate = kept.some(
      (existing) =>
        postSimilarity(existing.title, existing.slug, post.title, post.slug) >=
        threshold
    );

    if (!isDuplicate) {
      kept.push(post);
      seenSlugs.add(post.slug);
    }
  }

  return kept;
}
