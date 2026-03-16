/**
 * Reddit Trending Topics Fetcher
 * Detects trending stories from major news subreddits before they hit Google Trends.
 * No auth required — uses Reddit's public JSON API.
 */

import { NewsItem } from './news-sources';

const USER_AGENT = 'uni-uk-ai:v1.0 (trending news aggregator)';

const SUBREDDITS = [
  { name: 'worldnews', limit: 15, region: 'GLOBAL', regionLabel: 'Global' },
  { name: 'news', limit: 15, region: 'US', regionLabel: 'USA' },
  { name: 'unitedkingdom', limit: 10, region: 'GB', regionLabel: 'UK' },
  { name: 'technology', limit: 8, region: 'GLOBAL', regionLabel: 'Global' },
  { name: 'sports', limit: 8, region: 'GLOBAL', regionLabel: 'Global' },
];

interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
  url: string;
  thumbnail?: string;
  is_self: boolean;
  stickied: boolean;
}

/**
 * Engagement rate: upvotes + weighted comments, divided by age in hours.
 * Favours rapidly-rising posts over older high-score posts.
 */
function engagementRate(post: RedditPost): number {
  const ageHours = Math.max(0.1, (Date.now() / 1000 - post.created_utc) / 3600);
  return (post.score + post.num_comments * 3) / ageHours;
}

/** Strip common Reddit title noise */
function cleanTitle(title: string): string {
  return title
    .replace(/\[.*?\]\s*/g, '')
    .replace(/^(BREAKING|UPDATE|MEGATHREAD|LIVE|TIL|ELI5|CMV):?\s*/i, '')
    .replace(/\s*\|.*$/, '')
    .trim();
}

async function fetchSubreddit(name: string, limit: number): Promise<RedditPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${name}/hot.json?limit=${limit}&raw_json=1`,
      {
        headers: { 'User-Agent': USER_AGENT },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) {
      console.warn(`[Reddit] r/${name} returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data?.data?.children || [])
      .map((c: any) => c.data as RedditPost)
      .filter((p: RedditPost) => !p.stickied);
  } catch (err: any) {
    console.error(`[Reddit] Error fetching r/${name}:`, err.message);
    return [];
  }
}

/**
 * Fetches trending topics from Reddit.
 * Returns NewsItem[] compatible with the Google Trends format so
 * they can be merged seamlessly in the aggregator.
 */
export async function fetchRedditTrends(): Promise<NewsItem[]> {
  const allPosts: { post: RedditPost; region: string; regionLabel: string }[] = [];

  const results = await Promise.allSettled(
    SUBREDDITS.map(async (sub) => {
      const posts = await fetchSubreddit(sub.name, sub.limit);
      return posts.map((p) => ({
        post: p,
        region: sub.region === 'GLOBAL' ? 'US' : sub.region,
        regionLabel: sub.regionLabel,
      }));
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allPosts.push(...result.value);
    }
  }

  // Keep only recent posts (last 12 h) sorted by engagement
  const cutoff = Date.now() / 1000 - 12 * 3600;
  const trending = allPosts
    .filter(({ post }) => post.created_utc > cutoff && !post.is_self)
    .sort((a, b) => engagementRate(b.post) - engagementRate(a.post))
    .slice(0, 15);

  return trending.map(({ post, region, regionLabel }) => ({
    title: cleanTitle(post.title),
    description: `Trending on r/${post.subreddit} — ${post.score.toLocaleString()} upvotes, ${post.num_comments.toLocaleString()} comments`,
    link: post.url.startsWith('http') ? post.url : `https://reddit.com${post.permalink}`,
    pubDate: new Date(post.created_utc * 1000).toISOString(),
    source: 'Reddit',
    trafficVolume:
      post.score > 50000
        ? '500K+'
        : post.score > 20000
        ? '200K+'
        : post.score > 10000
        ? '100K+'
        : post.score > 5000
        ? '50K+'
        : '20K+',
    pictureUrl:
      post.thumbnail && post.thumbnail.startsWith('http')
        ? post.thumbnail
        : undefined,
    region,
    regionLabel,
  }));
}
