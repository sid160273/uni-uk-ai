/**
 * Trending Sources Module
 * Fetches and parses Google Trends RSS feed for real-time trending topics
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
}

const TRENDS_RSS_URL = 'https://trends.google.com/trending/rss?geo=GB';

/**
 * Parses Google Trends RSS feed into trending items
 */
function parseTrendsRSS(xmlText: string): NewsItem[] {
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
        link: linkMatch ? linkMatch[1].trim() : `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=GB`,
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
        source: 'Google Trends',
        trafficVolume: trafficMatch ? trafficMatch[1].trim() : undefined,
        pictureUrl: pictureMatch ? pictureMatch[1].trim() : undefined,
        newsItems: relatedNews.length > 0 ? relatedNews : undefined,
      });
    }
  }

  return items;
}

/**
 * Fetches top trending topics from Google Trends
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(TRENDS_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; uni-uk.ai/1.0)',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch Google Trends: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const items = parseTrendsRSS(xmlText);

    // Return top 10 trending topics
    return items.slice(0, 10);
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}

/**
 * Formats trending items for the AI prompt
 */
export function formatNewsForPrompt(items: NewsItem[]): string {
  return items.map((item, index) =>
    `${index + 1}. "${item.title}" (${item.trafficVolume || 'trending'})
   Related: ${item.newsItems?.map(n => n.title).join('; ') || item.description}
   Link: ${item.link}
   Date: ${item.pubDate}`
  ).join('\n\n');
}
