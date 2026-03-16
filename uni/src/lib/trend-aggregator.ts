/**
 * Trend Aggregator
 *
 * Combines Google Trends + Reddit into a single ranked feed.
 * Topics that appear on multiple sources get a higher score (cross-validation).
 * Each topic is tagged with a velocity label so the cron can prioritise
 * fast-rising stories for quick-take articles.
 */

import { NewsItem, fetchMultiRegionNews } from './news-sources';
import { fetchRedditTrends } from './reddit-trends';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrendVelocity = 'breaking' | 'rising' | 'trending' | 'sustained';

export interface ScoredTrend extends NewsItem {
  /** Composite relevance score — higher is better */
  score: number;
  /** How many independent sources mention this topic */
  sourceCount: number;
  /** Which sources flagged this topic */
  sources: string[];
  /** How fast the topic is gaining interest */
  velocity: TrendVelocity;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'as', 'and', 'or', 'but', 'not',
  'has', 'have', 'had', 'be', 'been', 'this', 'that', 'it', 'its', 'his',
  'her', 'their', 'our', 'your', 'my', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'shall', 'do', 'does', 'did', 'about', 'after',
  'says', 'said', 'new', 'over', 'out', 'up', 'more', 'than', 'into',
  'what', 'how', 'why', 'when', 'where', 'who', 'all', 'just', 'being',
  'been', 'they', 'we', 'he', 'she', 'if', 'no', 'so', 'get', 'got',
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Measures how similar two topic titles are (0..1).
 * Uses keyword overlap relative to the shorter title.
 */
function topicSimilarity(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const overlap = wordsB.filter((w) => setA.has(w)).length;
  const minLen = Math.min(wordsA.length, wordsB.length);

  return overlap / minLen;
}

function classifyVelocity(pubDate: string): TrendVelocity {
  const ageHours = (Date.now() - new Date(pubDate).getTime()) / (1000 * 60 * 60);
  if (ageHours < 1) return 'breaking';
  if (ageHours < 4) return 'rising';
  if (ageHours < 12) return 'trending';
  return 'sustained';
}

function parseTrafficNumber(volume?: string): number {
  if (!volume) return 10_000;
  const num = parseInt(volume.replace(/[^0-9]/g, ''), 10) || 0;
  if (volume.includes('M')) return num * 1_000_000;
  if (volume.includes('K')) return num * 1_000;
  return num || 10_000;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches trends from all sources, deduplicates by topic similarity,
 * scores by cross-source validation + traffic + velocity, and returns
 * a sorted list with the most important topics first.
 */
export async function fetchAggregatedTrends(): Promise<ScoredTrend[]> {
  const [googleResult, redditResult] = await Promise.allSettled([
    fetchMultiRegionNews(),
    fetchRedditTrends(),
  ]);

  const google =
    googleResult.status === 'fulfilled' ? googleResult.value : [];
  const reddit =
    redditResult.status === 'fulfilled' ? redditResult.value : [];

  console.log(
    `[Aggregator] Sources — Google: ${google.length}, Reddit: ${reddit.length}`
  );

  // Tag each item with its source for grouping
  type TaggedItem = NewsItem & { _source: string };
  const allItems: TaggedItem[] = [
    ...google.map((i) => ({ ...i, _source: 'Google Trends' })),
    ...reddit.map((i) => ({ ...i, _source: 'Reddit' })),
  ];

  // Group similar topics together
  const groups: { items: TaggedItem[]; sources: Set<string> }[] = [];

  for (const item of allItems) {
    let matched = false;
    for (const group of groups) {
      if (topicSimilarity(item.title, group.items[0].title) > 0.4) {
        group.items.push(item);
        group.sources.add(item._source);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.push({
        items: [item],
        sources: new Set([item._source]),
      });
    }
  }

  // Score and flatten
  const scored: ScoredTrend[] = groups.map((group) => {
    // Prefer the Google Trends item as the representative (better title)
    const primary =
      group.items.find((i) => i._source === 'Google Trends') ||
      group.items[0];
    const sourceCount = group.sources.size;
    const maxTraffic = Math.max(
      ...group.items.map((i) => parseTrafficNumber(i.trafficVolume))
    );
    const velocity = classifyVelocity(primary.pubDate);

    // Cross-source bonus is the most powerful signal
    const sourceBonus = sourceCount * 50;
    const trafficScore = Math.log10(Math.max(1, maxTraffic)) * 10;
    const velocityBonus =
      velocity === 'breaking'
        ? 40
        : velocity === 'rising'
        ? 25
        : velocity === 'trending'
        ? 10
        : 0;
    const score = sourceBonus + trafficScore + velocityBonus;

    // Merge descriptions and newsItems from all group members
    const mergedDescription = group.items
      .map((i) => i.description)
      .filter(Boolean)
      .join('. ')
      .slice(0, 800);
    const mergedNews = group.items.flatMap((i) => i.newsItems || []).slice(0, 5);

    // Use traffic figure from Google Trends if available
    const bestTraffic =
      group.items.find((i) => i._source === 'Google Trends')?.trafficVolume ||
      primary.trafficVolume;

    return {
      ...primary,
      description: mergedDescription || primary.description,
      newsItems: mergedNews.length > 0 ? mergedNews : primary.newsItems,
      trafficVolume: bestTraffic,
      score,
      sourceCount,
      sources: Array.from(group.sources),
      velocity,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const crossValidated = scored.filter((t) => t.sourceCount > 1).length;
  console.log(
    `[Aggregator] ${scored.length} unique topics — ${crossValidated} cross-validated`
  );

  return scored;
}
