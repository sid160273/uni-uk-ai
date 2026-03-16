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
function pickFormat(formats: FormatFn[], slug: string): FormatFn {
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
