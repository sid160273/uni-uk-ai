/**
 * News Sources Module
 * Fetches and parses RSS feeds from UK higher education news sources
 */

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

// RSS feed URLs for UK higher education news
const RSS_FEEDS = [
  {
    name: 'Times Higher Education',
    url: 'https://www.timeshighereducation.com/rss/news.rss',
    keywords: ['university', 'higher education', 'student', 'UK', 'research', 'funding', 'Russell Group'],
  },
  {
    name: 'The Guardian Education',
    url: 'https://www.theguardian.com/education/rss',
    keywords: ['university', 'universities', 'student', 'UCAS', 'degree', 'tuition'],
  },
  {
    name: 'BBC Education',
    url: 'https://feeds.bbci.co.uk/news/education/rss.xml',
    keywords: ['university', 'universities', 'student', 'higher education', 'degree'],
  },
];

/**
 * Parses XML RSS feed into news items
 */
function parseRSSFeed(xmlText: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Simple regex-based XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    // Extract fields using regex
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      const description = descMatch
        ? descMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
        : '';

      items.push({
        title,
        description: description.substring(0, 500), // Limit description length
        link: linkMatch[1].trim(),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
        source: sourceName,
      });
    }
  }

  return items;
}

/**
 * Checks if a news item is relevant to UK higher education
 */
function isRelevantToUKHigherEd(item: NewsItem, keywords: string[]): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();

  // Must contain at least one higher education keyword
  const hasRelevantKeyword = keywords.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  if (!hasRelevantKeyword) return false;

  // Exclude irrelevant topics
  const excludePatterns = [
    'primary school',
    'secondary school',
    'gcse results',
    'a-level results day',
    'school closure',
    'teacher strike',
    'nursery',
    'childcare',
    'ofsted',
    'american university',
    'us college',
  ];

  const isExcluded = excludePatterns.some(pattern =>
    text.includes(pattern.toLowerCase())
  );

  return !isExcluded;
}

/**
 * Fetches news from all configured RSS feeds
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; uni-uk.ai/1.0)',
        },
        next: { revalidate: 0 }, // Don't cache
      });

      if (!response.ok) {
        console.warn(`Failed to fetch ${feed.name}: ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const items = parseRSSFeed(xmlText, feed.name);

      // Filter for relevant items
      const relevantItems = items.filter(item =>
        isRelevantToUKHigherEd(item, feed.keywords)
      );

      allItems.push(...relevantItems);
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
    }
  }

  // Sort by publication date (newest first)
  allItems.sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Return top items from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return allItems.filter(item =>
    new Date(item.pubDate) > oneWeekAgo
  ).slice(0, 20); // Limit to 20 most recent relevant items
}

/**
 * Formats news items for the AI prompt
 */
export function formatNewsForPrompt(items: NewsItem[]): string {
  return items.map((item, index) =>
    `${index + 1}. "${item.title}" (${item.source})
   Summary: ${item.description.substring(0, 200)}...
   Link: ${item.link}
   Date: ${item.pubDate}`
  ).join('\n\n');
}
