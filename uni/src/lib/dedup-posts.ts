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
]);

/**
 * Extract significant keywords from a blog post title.
 * Strips common SEO filler words to get the core topic.
 */
function extractCoreKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Measures topic similarity between two post titles.
 * Returns a value between 0 (no overlap) and 1 (identical topics).
 */
function titleSimilarity(titleA: string, titleB: string): number {
  const wordsA = extractCoreKeywords(titleA);
  const wordsB = extractCoreKeywords(titleB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  const overlap = wordsA.filter((w) => setB.has(w)).length;
  const minLen = Math.min(setA.size, setB.size);

  return overlap / minLen;
}

/**
 * Deduplicates blog posts for display.
 * Groups posts by topic similarity and keeps only the most recent
 * from each group.
 *
 * @param posts - Already sorted by date (newest first)
 * @param threshold - Similarity threshold (0.6 = 60% keyword overlap)
 * @returns Deduplicated posts, maintaining sort order
 */
export function deduplicatePosts<
  T extends { title: string; publishedAt: string; slug: string }
>(posts: T[], threshold: number = 0.6): T[] {
  const kept: T[] = [];
  const seenSlugs = new Set<string>();

  for (const post of posts) {
    // Exact slug dedup
    if (seenSlugs.has(post.slug)) continue;

    // Check if this post's topic is too similar to one we've already kept
    const isDuplicate = kept.some(
      (existing) => titleSimilarity(existing.title, post.title) >= threshold
    );

    if (!isDuplicate) {
      kept.push(post);
      seenSlugs.add(post.slug);
    }
  }

  return kept;
}
