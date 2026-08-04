/**
 * UK News Feeds Source
 * Fetches latest stories from top UK news outlets via RSS.
 * Stories covered by multiple outlets are grouped and scored higher.
 * Returns NewsItem[] compatible with the trend aggregator.
 */

import { NewsItem } from './news-sources';

const USER_AGENT = 'uni-uk-ai:v1.0 (news aggregator)';

const UK_FEEDS = [
  { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/uk/rss' },
  { name: 'Sky News', url: 'https://feeds.skynews.com/feeds/rss/home.xml' },
  { name: 'Daily Mail', url: 'https://www.dailymail.co.uk/articles.rss' },
  { name: 'The Telegraph', url: 'https://www.telegraph.co.uk/rss.xml' },
  { name: 'The Independent', url: 'https://www.independent.co.uk/rss' },
  { name: 'The Sun', url: 'https://www.thesun.co.uk/feed/' },
  { name: 'Mirror', url: 'https://www.mirror.co.uk/?service=rss' },
  { name: 'Metro', url: 'https://metro.co.uk/feed/' },
  { name: 'Express', url: 'https://www.express.co.uk/?service=rss' },
] as const;

// Max items to parse per feed (recent stories only)
const PER_FEED_LIMIT = 15;

// Only consider stories from the last 6 hours
const MAX_AGE_HOURS = 6;

// A story must appear in at least this many outlets to be returned
const MIN_OUTLET_COUNT = 2;

// ---------------------------------------------------------------------------
// RSS parsing
// ---------------------------------------------------------------------------

interface RawFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  outlet: string;
}

function parseRSSFeed(xml: string, outlet: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const dateMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);

    if (titleMatch) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (!title) continue;

      items.push({
        title,
        link: linkMatch ? linkMatch[1].replace(/<[^>]*>/g, '').trim() : '',
        description: descMatch
          ? descMatch[1].replace(/<[^>]*>/g, '').trim().slice(0, 300)
          : '',
        pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
        outlet,
      });
    }

    if (items.length >= PER_FEED_LIMIT) break;
  }

  return items;
}

// ---------------------------------------------------------------------------
// Keyword similarity (mirrored from trend-aggregator for grouping)
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'as', 'and', 'or', 'but', 'not',
  'has', 'have', 'had', 'be', 'been', 'this', 'that', 'it', 'its', 'his',
  'her', 'their', 'our', 'your', 'my', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'shall', 'do', 'does', 'did', 'about', 'after',
  'says', 'said', 'new', 'over', 'out', 'up', 'more', 'than', 'into',
  'what', 'how', 'why', 'when', 'where', 'who', 'all', 'just', 'being',
  'they', 'we', 'he', 'she', 'if', 'no', 'so', 'get', 'got',
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const overlap = wordsB.filter((w) => setA.has(w)).length;
  const minLen = Math.min(wordsA.length, wordsB.length);

  return overlap / minLen;
}

// ---------------------------------------------------------------------------
// Fetch & group
// ---------------------------------------------------------------------------

async function fetchFeed(feed: typeof UK_FEEDS[number]): Promise<RawFeedItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[UK News] ${feed.name} returned ${res.status}`);
      return [];
    }

    const xml = await res.text();
    return parseRSSFeed(xml, feed.name);
  } catch (err: any) {
    console.warn(`[UK News] ${feed.name} failed: ${err.message}`);
    return [];
  }
}

/**
 * Fetches stories from all UK news outlets, groups stories about the
 * same topic, and returns the most-covered stories as NewsItem[].
 */
export async function fetchUKNewsFeeds(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(UK_FEEDS.map(fetchFeed));

  const allItems: RawFeedItem[] = [];
  let feedsOk = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.length > 0) {
      feedsOk++;
      allItems.push(...r.value);
    } else if (r.status === 'rejected') {
      console.warn(`[UK News] ${UK_FEEDS[i].name} rejected: ${r.reason}`);
    }
  });

  console.log(`[UK News] ${feedsOk}/${UK_FEEDS.length} feeds OK, ${allItems.length} total items`);

  // Filter to recent stories only
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const recent = allItems.filter((item) => {
    const d = new Date(item.pubDate).getTime();
    return !isNaN(d) && d > cutoff;
  });

  // Group similar stories across outlets
  const groups: { items: RawFeedItem[]; outlets: Set<string> }[] = [];

  for (const item of recent) {
    let matched = false;
    for (const group of groups) {
      if (titleSimilarity(item.title, group.items[0].title) > 0.4) {
        group.items.push(item);
        group.outlets.add(item.outlet);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.push({
        items: [item],
        outlets: new Set([item.outlet]),
      });
    }
  }

  // Only keep stories covered by multiple outlets
  const multiOutlet = groups
    .filter((g) => g.outlets.size >= MIN_OUTLET_COUNT)
    .sort((a, b) => b.outlets.size - a.outlets.size);

  console.log(
    `[UK News] ${groups.length} unique stories, ${multiOutlet.length} covered by ${MIN_OUTLET_COUNT}+ outlets`
  );

  // Convert to NewsItem format, cap at 20
  return multiOutlet.slice(0, 20).map((group): NewsItem => {
    // Pick the item with the best description (longest) as primary
    const primary = group.items.reduce((best, cur) =>
      cur.description.length > best.description.length ? cur : best
    );
    const outletCount = group.outlets.size;
    const outletNames = Array.from(group.outlets).join(', ');

    // Estimate traffic based on outlet coverage
    const traffic =
      outletCount >= 7
        ? '1M+'
        : outletCount >= 5
        ? '500K+'
        : outletCount >= 3
        ? '200K+'
        : '100K+';

    // Collect related articles from each outlet
    const newsItems = group.items.slice(0, 5).map((item) => ({
      title: item.title,
      url: item.link,
      source: item.outlet,
    }));

    return {
      title: primary.title,
      description: `Covered by ${outletCount} UK outlets (${outletNames}). ${primary.description}`,
      link: primary.link,
      pubDate: primary.pubDate,
      source: 'UK News',
      trafficVolume: traffic,
      pictureUrl: undefined,
      newsItems,
      region: 'GB',
      regionLabel: 'UK',
    };
  });
}
