/**
 * Trending Sources Module
 * Fetches and parses Google Trends RSS feeds for real-time trending topics
 * across multiple countries
 */

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  trafficVolume?: string;
  pictureUrl?: string;
  newsItems?: { title: string; url: string; source: string }[];
  region?: string;      // Country code (GB, US, etc.)
  regionLabel?: string; // Human-readable (UK, USA, etc.)
}

// Countries to fetch trends from — ordered by priority
const TREND_REGIONS = [
  { geo: 'GB', label: 'UK', limit: 10 },
  { geo: 'US', label: 'USA', limit: 8 },
  { geo: 'AU', label: 'Australia', limit: 5 },
  { geo: 'CA', label: 'Canada', limit: 5 },
  { geo: 'IN', label: 'India', limit: 5 },
] as const;

/**
 * Parses Google Trends RSS feed into trending items
 */
function parseTrendsRSS(xmlText: string, region: string, regionLabel: string): NewsItem[] {
  const items: NewsItem[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const trafficMatch = itemXml.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
    const pictureMatch = itemXml.match(/<ht:picture>(.*?)<\/ht:picture>/);

    // Extract nested news items for context
    const newsItemRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
    const relatedNews: { title: string; url: string; source: string }[] = [];
    let newsMatch;

    while ((newsMatch = newsItemRegex.exec(itemXml)) !== null) {
      const newsXml = newsMatch[1];
      const newsTitleMatch = newsXml.match(/<ht:news_item_title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:news_item_title>/);
      const newsUrlMatch = newsXml.match(/<ht:news_item_url>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:news_item_url>/);
      const newsSourceMatch = newsXml.match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/);

      if (newsTitleMatch) {
        relatedNews.push({
          title: newsTitleMatch[1].replace(/<[^>]*>/g, '').trim(),
          url: newsUrlMatch ? newsUrlMatch[1].trim() : '',
          source: newsSourceMatch ? newsSourceMatch[1].trim() : '',
        });
      }
    }

    if (titleMatch) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      const description = relatedNews.map(n => n.title).join('. ') || title;

      items.push({
        title,
        description: description.substring(0, 500),
        link: linkMatch ? linkMatch[1].trim() : `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=${region}`,
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
        source: 'Google Trends',
        trafficVolume: trafficMatch ? trafficMatch[1].trim() : undefined,
        pictureUrl: pictureMatch ? pictureMatch[1].trim() : undefined,
        newsItems: relatedNews.length > 0 ? relatedNews : undefined,
        region,
        regionLabel,
      });
    }
  }

  return items;
}

/**
 * Fetches trending topics from a single country
 */
async function fetchTrendsForRegion(geo: string, regionLabel: string, limit: number): Promise<NewsItem[]> {
  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; uni-uk.ai/1.0)',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch Google Trends for ${geo}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const items = parseTrendsRSS(xmlText, geo, regionLabel);
    return items.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching Google Trends for ${geo}:`, error);
    return [];
  }
}

/**
 * Deduplicates topics across countries
 * If the same topic trends in multiple countries, keeps the first occurrence
 * and merges the region info
 */
function deduplicateTopics(allItems: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();

  for (const item of allItems) {
    const key = item.title.toLowerCase().trim();

    if (seen.has(key)) {
      // Same topic in another country — append region to existing
      const existing = seen.get(key)!;
      if (existing.regionLabel && item.regionLabel && !existing.regionLabel.includes(item.regionLabel)) {
        existing.regionLabel = `${existing.regionLabel}, ${item.regionLabel}`;
      }
      // Keep the higher traffic volume
      if (item.trafficVolume && existing.trafficVolume) {
        const itemTraffic = parseInt(item.trafficVolume.replace(/[^0-9]/g, '')) || 0;
        const existingTraffic = parseInt(existing.trafficVolume.replace(/[^0-9]/g, '')) || 0;
        if (itemTraffic > existingTraffic) {
          existing.trafficVolume = item.trafficVolume;
        }
      }
    } else {
      seen.set(key, { ...item });
    }
  }

  return Array.from(seen.values());
}

/**
 * Fetches top trending topics from Google Trends (UK only — for homepage display)
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  return fetchTrendsForRegion('GB', 'UK', 10);
}

/**
 * Fetches trending topics from ALL configured countries
 * Used by the blog generation cron for broader coverage
 */
export async function fetchMultiRegionNews(): Promise<NewsItem[]> {
  // Fetch all regions in parallel
  const results = await Promise.allSettled(
    TREND_REGIONS.map(r => fetchTrendsForRegion(r.geo, r.label, r.limit))
  );

  const allItems: NewsItem[] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`${TREND_REGIONS[i].label}: ${result.value.length} topics`);
      allItems.push(...result.value);
    } else {
      console.error(`Failed to fetch ${TREND_REGIONS[i].label}:`, result.reason);
    }
  });

  // Deduplicate cross-country overlaps
  const unique = deduplicateTopics(allItems);
  console.log(`Total unique topics across all regions: ${unique.length}`);

  return unique;
}

/**
 * Formats trending items for the AI prompt
 */
export function formatNewsForPrompt(items: NewsItem[]): string {
  return items.map((item, index) =>
    `${index + 1}. "${item.title}" (${item.trafficVolume || 'trending'}${item.regionLabel ? ` — ${item.regionLabel}` : ''})
   Related: ${item.newsItems?.map(n => n.title).join('; ') || item.description}
   Link: ${item.link}
   Date: ${item.pubDate}`
  ).join('\n\n');
}
