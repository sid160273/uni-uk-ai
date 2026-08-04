/**
 * UK education and Clearing news source.
 *
 * The general trend pipeline (Google Trends + Reddit + UK front pages) surfaces
 * whatever the country is talking about, which during Clearing is mostly not
 * university admissions. This source polls education-desk feeds and targeted
 * Google News queries instead, then filters on education vocabulary so that
 * what reaches the writer is on-topic.
 *
 * Returns NewsItem[] so it drops straight into the existing aggregator.
 */

import { NewsItem } from './news-sources';
import { CLEARING_CYCLE } from './clearing';

const USER_AGENT = 'uni-uk-ai:v1.0 (education news aggregator)';

/** Education desks at UK outlets. */
const EDUCATION_FEEDS = [
  { name: 'BBC Education', url: 'https://feeds.bbci.co.uk/news/education/rss.xml' },
  { name: 'Guardian Education', url: 'https://www.theguardian.com/education/rss' },
  {
    name: 'Guardian Higher Education',
    url: 'https://www.theguardian.com/education/higher-education/rss',
  },
  { name: 'Times Higher Education', url: 'https://www.timeshighereducation.com/news/rss' },
  { name: 'FE News', url: 'https://www.fenews.co.uk/feed/' },
  { name: 'Schools Week', url: 'https://schoolsweek.co.uk/feed/' },
] as const;

/**
 * Google News queries. These catch Clearing coverage that never appears on an
 * education desk — local papers covering a university's Clearing hotline, for
 * instance.
 */
const NEWS_QUERIES = [
  `UCAS Clearing ${CLEARING_CYCLE.year}`,
  'university clearing places',
  'A-level results day',
  'SQA results',
  'university admissions UK',
  'student finance UK',
] as const;

function googleNewsUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-GB&gl=GB&ceid=GB:en`;
}

/**
 * A story must contain at least one of these to count as education news.
 * Deliberately broad — the aggregator scores relevance afterwards, so the cost
 * of a false positive here is low and the cost of a false negative is a missed
 * Clearing story.
 */
const EDUCATION_TERMS = [
  'clearing', 'ucas', 'university', 'universities', 'undergraduate',
  'a-level', 'a level', 'alevel', 'gcse', 'btec', 't-level', 'sqa', 'highers',
  'results day', 'admissions', 'applicant', 'applicants', 'campus',
  'student', 'students', 'tuition', 'degree', 'degrees', 'graduate',
  'higher education', 'sixth form', 'college', 'apprenticeship',
  'russell group', 'freshers', 'accommodation', 'maintenance loan',
  'student finance', 'foundation year',
];

/** Terms that mean the story is not about UK higher education. */
const EXCLUSIONS = [
  'clearing house', 'cheque clearing', 'clearing the pitch',
  'snow clearing', 'clearing the air', 'land clearing', 'clearance sale',
];

const PER_FEED_LIMIT = 20;
const MAX_AGE_HOURS = 48;
const MAX_RESULTS = 25;

interface RawItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  outlet: string;
}

function parseRSS(xml: string, outlet: string): RawItem[] {
  const items: RawItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (!titleMatch) continue;
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

    if (items.length >= PER_FEED_LIMIT) break;
  }

  return items;
}

/** Is this story about UK higher education? */
export function isEducationStory(title: string, description = ''): boolean {
  const text = `${title} ${description}`.toLowerCase();
  if (EXCLUSIONS.some((term) => text.includes(term))) return false;
  return EDUCATION_TERMS.some((term) => text.includes(term));
}

async function fetchFeed(name: string, url: string): Promise<RawItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Education] ${name} returned ${res.status}`);
      return [];
    }

    return parseRSS(await res.text(), name);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.warn(`[Education] ${name} failed: ${message}`);
    return [];
  }
}

/** Rank Clearing stories above general education stories. */
function priorityFor(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('clearing')) return 3;
  if (text.includes('results day') || text.includes('ucas')) return 2;
  return 1;
}

/**
 * Fetches UK education and Clearing stories from education desks and targeted
 * news queries, deduplicates by title, and returns them newest-and-most-relevant
 * first as NewsItem[].
 */
export async function fetchEducationNews(): Promise<NewsItem[]> {
  const sources: Array<Promise<RawItem[]>> = [
    ...EDUCATION_FEEDS.map((feed) => fetchFeed(feed.name, feed.url)),
    ...NEWS_QUERIES.map((query) =>
      fetchFeed(`Google News: ${query}`, googleNewsUrl(query))
    ),
  ];

  const settled = await Promise.allSettled(sources);
  const all: RawItem[] = [];
  let ok = 0;

  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      ok++;
      all.push(...result.value);
    }
  }

  const cutoff = Date.now() - MAX_AGE_HOURS * 3_600_000;
  const relevant = all.filter((item) => {
    const published = new Date(item.pubDate).getTime();
    if (isNaN(published) || published < cutoff) return false;
    return isEducationStory(item.title, item.description);
  });

  // Deduplicate on a normalised title — the same story reaches us via several
  // queries and desks.
  const seen = new Map<string, RawItem>();
  for (const item of relevant) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (!seen.has(key)) seen.set(key, item);
  }

  const deduped = Array.from(seen.values()).sort((a, b) => {
    const byPriority =
      priorityFor(b.title, b.description) - priorityFor(a.title, a.description);
    if (byPriority !== 0) return byPriority;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  console.log(
    `[Education] ${ok}/${sources.length} feeds OK, ${all.length} items, ${relevant.length} education-relevant, ${deduped.length} unique`
  );

  return deduped.slice(0, MAX_RESULTS).map(
    (item): NewsItem => ({
      title: item.title,
      description: item.description,
      link: item.link,
      pubDate: item.pubDate,
      source: 'UK Education',
      trafficVolume: priorityFor(item.title, item.description) >= 3 ? '200K+' : '50K+',
      pictureUrl: undefined,
      newsItems: [{ title: item.title, url: item.link, source: item.outlet }],
      region: 'GB',
      regionLabel: 'UK',
    })
  );
}
