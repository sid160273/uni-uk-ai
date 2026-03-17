/**
 * Tweet Formatter
 * Builds tweet text for auto-posting new blog stories to Twitter/X.
 * Keeps every tweet under 280 characters.
 */

const SITE_URL = 'https://uni-uk.ai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a tag like "artificial intelligence" to "ArtificialIntelligence" */
function toCamelCaseHashtag(tag: string): string {
  return tag
    .split(/[\s\-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/** Pick up to `count` hashtags from a tag list, shortest first for space. */
function pickHashtags(tags: string[], count: number): string[] {
  // Deduplicate, convert, and sort by length so we fit more in the tweet
  const seen = new Set<string>();
  const hashtags: string[] = [];

  for (const tag of tags) {
    const ht = `#${toCamelCaseHashtag(tag)}`;
    if (!seen.has(ht) && ht.length <= 30) {
      seen.add(ht);
      hashtags.push(ht);
    }
  }

  hashtags.sort((a, b) => a.length - b.length);
  return hashtags.slice(0, count);
}

/** Build the full blog URL for a slug */
function blogUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

/**
 * Truncate a title so the overall tweet stays within 280 chars.
 * Adds an ellipsis when truncated.
 */
function truncateTitle(title: string, maxLen: number): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen - 1).trimEnd() + '\u2026';
}

// ---------------------------------------------------------------------------
// Tweet format variants
// ---------------------------------------------------------------------------

interface StoryInput {
  title: string;
  slug: string;
  category: string;
  tags: string[];
}

type FormatFn = (story: StoryInput) => string;

const STANDARD_FORMATS: FormatFn[] = [
  // Format 1 — clean title + hashtags
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 3);
    const hashStr = hashtags.join(' ');
    // Structure: title \n\n hashtags \n url
    // Reserve space for scaffolding: 2 newlines + space + newline + url
    const overhead = 2 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${title}\n\n${hashStr}\n${url}`;
  },

  // Format 2 — emoji accent based on category
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 2);
    const hashStr = hashtags.join(' ');
    const emoji = categoryEmoji(story.category);
    // Structure: emoji TITLE \n\n hashtags \n url
    const prefix = `${emoji} `;
    const overhead = prefix.length + 2 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${hashStr}\n${url}`;
  },

  // Format 3 — "NEW:" prefix
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 2);
    const hashStr = hashtags.join(' ');
    const prefix = 'NEW: ';
    const overhead = prefix.length + 2 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${hashStr}\n${url}`;
  },
];

const BREAKING_FORMATS: FormatFn[] = [
  // Breaking format 1 — red circle
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 2);
    const hashStr = hashtags.join(' ');
    const prefix = '\uD83D\uDD34 TRENDING: ';
    const overhead = prefix.length + 2 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${hashStr}\n${url}`;
  },

  // Breaking format 2 — siren
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 3);
    const hashStr = hashtags.join(' ');
    const prefix = '\uD83D\uDEA8 BREAKING: ';
    const overhead = prefix.length + 2 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${hashStr}\n${url}`;
  },

  // Breaking format 3 — lightning
  (story) => {
    const url = blogUrl(story.slug);
    const hashtags = pickHashtags(story.tags, 2);
    const hashStr = hashtags.join(' ');
    const prefix = '\u26A1 ';
    const suffix = ' \u2014 Read more:';
    const overhead = prefix.length + suffix.length + 1 + hashStr.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}${suffix}\n${hashStr}\n${url}`;
  },
];

function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Sports: '\u26BD',
    Politics: '\uD83C\uDFDB\uFE0F',
    Entertainment: '\uD83C\uDFAC',
    Technology: '\uD83D\uDCBB',
    Business: '\uD83D\uDCC8',
    Science: '\uD83D\uDD2C',
    Health: '\uD83C\uDFE5',
    World: '\uD83C\uDF0D',
    Culture: '\uD83C\uDFA8',
    Breaking: '\uD83D\uDD34',
  };
  return map[category] || '\uD83D\uDCF0';
}

/** Deterministic-ish pick based on slug so the same story always gets the same format */
function pickFormat<T>(formats: ((s: T) => string)[], slug: string): (s: T) => string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % formats.length;
  return formats[index];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Format a standard tweet for a new blog story.
 * The format varies deterministically based on the slug.
 */
export function formatStoryTweet(story: StoryInput): string {
  const formatter = pickFormat(STANDARD_FORMATS, story.slug);
  const tweet = formatter(story);
  // Final safety check
  if (tweet.length > 280) {
    // Absolute fallback: title + url only
    const url = blogUrl(story.slug);
    const title = truncateTitle(story.title, 280 - url.length - 2);
    return `${title}\n${url}`;
  }
  return tweet;
}

/**
 * Format a high-urgency / breaking tweet for stories with high traffic potential.
 */
export function formatBreakingTweet(story: StoryInput): string {
  const formatter = pickFormat(BREAKING_FORMATS, story.slug);
  const tweet = formatter(story);
  // Final safety check
  if (tweet.length > 280) {
    const url = blogUrl(story.slug);
    const prefix = '\uD83D\uDD34 ';
    const title = truncateTitle(story.title, 280 - prefix.length - url.length - 2);
    return `${prefix}${title}\n${url}`;
  }
  return tweet;
}

// ---------------------------------------------------------------------------
// Crypto tweet formats — optimised for CT (Crypto Twitter) engagement
// ---------------------------------------------------------------------------

interface CryptoStoryInput {
  title: string;
  slug: string;
  coins: string[];   // e.g. ["BTC", "ETH"]
  tags: string[];
  priceData?: { symbol: string; price: string; change24h: number }[];
}

/** Turn coin symbols into cashtags: BTC → $BTC */
function cashtags(coins: string[], max: number = 3): string {
  return coins.slice(0, max).map(c => `$${c.toUpperCase()}`).join(' ');
}

/** Pick crypto-relevant hashtags */
function cryptoHashtags(tags: string[], coins: string[], max: number = 3): string[] {
  const base = ['#Crypto'];
  const coinTags = coins.slice(0, 2).map(c => `#${c.toUpperCase()}`);
  const topicTags = tags
    .filter(t => !coins.some(c => c.toLowerCase() === t.toLowerCase()))
    .slice(0, 2)
    .map(t => `#${toCamelCaseHashtag(t)}`);
  const all = [...base, ...coinTags, ...topicTags];
  const unique = [...new Set(all)];
  return unique.slice(0, max);
}

/** Format a price snippet: "$BTC £82,450 (+3.2%)" */
function priceSnippet(data: { symbol: string; price: string; change24h: number }): string {
  const dir = data.change24h >= 0 ? '+' : '';
  return `$${data.symbol.toUpperCase()} ${data.price} (${dir}${data.change24h.toFixed(1)}%)`;
}

function cryptoUrl(slug: string): string {
  return `${SITE_URL}/crypto/blog/${slug}`;
}

const CRYPTO_FORMATS: ((story: CryptoStoryInput) => string)[] = [
  // Format 1 — Price data lead + question title
  (story) => {
    const url = cryptoUrl(story.slug);
    const prices = (story.priceData || []).slice(0, 2).map(priceSnippet).join('\n');
    const tags = cryptoHashtags(story.tags, story.coins, 3).join(' ');
    const priceBlock = prices ? `${prices}\n\n` : '';
    const overhead = priceBlock.length + 2 + tags.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${priceBlock}${title}\n\n${tags}\n${url}`;
  },

  // Format 2 — Cashtag lead + chart emoji
  (story) => {
    const url = cryptoUrl(story.slug);
    const cash = cashtags(story.coins, 3);
    const tags = cryptoHashtags(story.tags, story.coins, 2).join(' ');
    const prefix = `\uD83D\uDCC9 ${cash}\n\n`;
    const overhead = prefix.length + 2 + tags.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${tags}\n${url}`;
  },

  // Format 3 — Engagement hook (question)
  (story) => {
    const url = cryptoUrl(story.slug);
    const cash = cashtags(story.coins, 2);
    const tags = cryptoHashtags(story.tags, story.coins, 2).join(' ');
    const hook = story.priceData?.[0]
      ? `${priceSnippet(story.priceData[0])}\n\nBullish or bearish? \uD83D\uDC47\n\n`
      : `${cash} \u2014 What do you think? \uD83D\uDC47\n\n`;
    const overhead = hook.length + 2 + tags.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${hook}${title}\n\n${tags}\n${url}`;
  },

  // Format 4 — Alert style
  (story) => {
    const url = cryptoUrl(story.slug);
    const cash = cashtags(story.coins, 2);
    const tags = cryptoHashtags(story.tags, story.coins, 2).join(' ');
    const prefix = `\uD83D\uDEA8 CRYPTO ALERT: `;
    const overhead = prefix.length + `\n\n${cash} `.length + 2 + tags.length + 1 + url.length + 1;
    const title = truncateTitle(story.title, 280 - overhead);
    return `${prefix}${title}\n\n${cash} ${tags}\n${url}`;
  },
];

/**
 * Format a tweet for a crypto story.
 * Uses cashtags ($BTC), price data, and engagement hooks for CT audience.
 */
export function formatCryptoTweet(story: CryptoStoryInput): string {
  const formatter = pickFormat(CRYPTO_FORMATS, story.slug);
  const tweet = formatter(story);
  if (tweet.length > 280) {
    const url = cryptoUrl(story.slug);
    const cash = cashtags(story.coins, 2);
    const title = truncateTitle(story.title, 280 - cash.length - url.length - 4);
    return `${cash}\n${title}\n${url}`;
  }
  return tweet;
}

// ---------------------------------------------------------------------------
// Bluesky formatting (300 grapheme limit)
// ---------------------------------------------------------------------------

/**
 * Format a Bluesky post for a blog story.
 * Returns { text, linkUrl } — linkUrl is used for the embed card.
 * Bluesky limit: 300 graphemes. URL is in the embed, not the text body.
 */
export function formatBlueskyPost(story: StoryInput): { text: string; linkUrl: string } {
  const linkUrl = blogUrl(story.slug);
  const hashtags = pickHashtags(story.tags, 2).join(' ');
  // No URL in text body — it goes in the link card embed
  const available = 300 - hashtags.length - 2; // 2 for \n\n
  const title = truncateTitle(story.title, available);
  return {
    text: `${title}\n\n${hashtags}`,
    linkUrl,
  };
}

/**
 * Format a Bluesky post for a crypto story.
 */
export function formatBlueskyPostCrypto(story: CryptoStoryInput): { text: string; linkUrl: string } {
  const linkUrl = cryptoUrl(story.slug);
  const cash = cashtags(story.coins, 3);
  const priceLine = story.priceData?.[0] ? `\n${priceSnippet(story.priceData[0])}` : '';
  const available = 300 - cash.length - priceLine.length - 2;
  const title = truncateTitle(story.title, available);
  return {
    text: `${cash}\n${title}${priceLine}`,
    linkUrl,
  };
}

// ---------------------------------------------------------------------------
// Threads formatting (500 character limit)
// Threads auto-generates link cards from URLs in text, so include the URL.
// ---------------------------------------------------------------------------

/**
 * Format a Threads post for a blog story.
 * More space (500 chars) = more personality. Include URL for auto-preview.
 */
export function formatThreadsPost(story: StoryInput): string {
  const url = blogUrl(story.slug);
  const hashtags = pickHashtags(story.tags, 3).join(' ');
  const overhead = 4 + hashtags.length + 1 + url.length; // \n\n + hashtags + \n + url
  const title = truncateTitle(story.title, 500 - overhead);
  return `${title}\n\n${hashtags}\n${url}`;
}

/**
 * Format a Threads post for a crypto story.
 */
export function formatThreadsPostCrypto(story: CryptoStoryInput): string {
  const url = cryptoUrl(story.slug);
  const cash = cashtags(story.coins, 3);
  const priceLine = (story.priceData || []).slice(0, 2).map(priceSnippet).join('\n');
  const priceBlock = priceLine ? `${priceLine}\n\n` : '';
  const hashtags = cryptoHashtags(story.tags, story.coins, 3).join(' ');
  const overhead = priceBlock.length + 4 + hashtags.length + 1 + url.length;
  const title = truncateTitle(story.title, 500 - overhead);
  return `${priceBlock}${title}\n\n${hashtags}\n${url}`;
}
