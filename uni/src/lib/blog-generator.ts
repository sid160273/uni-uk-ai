/**
 * Trending Story Generator Module
 * Uses OpenAI to generate SEO-optimized articles about trending topics
 */

import OpenAI from 'openai';
import { NewsItem } from './news-sources';

// Topic-specific images — keywords matched against title for accurate hero images
const TOPIC_IMAGES: { keywords: string[]; images: string[] }[] = [
  // Football / Soccer
  { keywords: ['football', 'premier league', 'fa cup', 'champions league', 'arsenal', 'liverpool', 'manchester united', 'man utd', 'man city', 'chelsea', 'tottenham', 'spurs', 'newcastle', 'everton', 'aston villa', 'west ham', 'wolves', 'crystal palace', 'brighton', 'fulham', 'bournemouth', 'brentford', 'nottingham forest', 'leicester', 'ipswich', 'sheffield united', 'burnley', 'luton', 'efl', 'championship', 'league one', 'league two', 'peterborough', 'rotherham', 'sunderland', 'sacked manager', 'transfer', 'goalkeeper', 'striker', 'midfielder', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'europa league', 'carabao cup', 'world cup', 'euros', 'real madrid', 'barcelona', 'bayern', 'psg', 'juventus', 'inter milan'],
    images: [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&h=900&fit=crop', // football on pitch
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1600&h=900&fit=crop', // stadium
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&h=900&fit=crop', // football match
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&h=900&fit=crop', // football stadium crowd
    ] },
  // F1 / Motorsport
  { keywords: ['f1', 'formula 1', 'formula one', 'grand prix', 'hamilton', 'verstappen', 'leclerc', 'norris', 'red bull racing', 'ferrari f1', 'mclaren', 'mercedes f1', 'motogp', 'nascar'],
    images: [
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=1600&h=900&fit=crop', // race track
      'https://images.unsplash.com/photo-1541889413-bc7b3e78c8f6?w=1600&h=900&fit=crop', // racing car
    ] },
  // Tennis
  { keywords: ['tennis', 'wimbledon', 'australian open', 'french open', 'us open tennis', 'djokovic', 'alcaraz', 'sinner', 'nadal', 'federer', 'swiatek', 'gauff'],
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&h=900&fit=crop', // tennis court
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1600&h=900&fit=crop', // tennis ball
    ] },
  // Boxing / MMA / UFC
  { keywords: ['boxing', 'ufc', 'mma', 'heavyweight', 'fury', 'usyk', 'joshua', 'tyson', 'mcgregor', 'fight night', 'knockout', 'ring'],
    images: [
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1600&h=900&fit=crop', // boxing ring
      'https://images.unsplash.com/photo-1517438322307-e67111335449?w=1600&h=900&fit=crop', // boxing gloves
    ] },
  // Cricket
  { keywords: ['cricket', 'ashes', 'ipl', 'test match', 'odi', 't20', 'wicket', 'batsman', 'bowler'],
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&h=900&fit=crop', // cricket
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1600&h=900&fit=crop', // cricket stadium
    ] },
  // Basketball / NBA
  { keywords: ['nba', 'basketball', 'lakers', 'celtics', 'warriors', 'lebron', 'curry', 'dunk', 'playoffs nba'],
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&h=900&fit=crop', // basketball
      'https://images.unsplash.com/photo-1504450758481-7338bbe75005?w=1600&h=900&fit=crop', // basketball court
    ] },
  // Rugby
  { keywords: ['rugby', 'six nations', 'rugby world cup', 'premiership rugby', 'all blacks', 'springboks', 'try', 'scrum'],
    images: [
      'https://images.unsplash.com/photo-1544698422-5290fdef5e64?w=1600&h=900&fit=crop', // rugby ball
    ] },
  // Golf
  { keywords: ['golf', 'pga', 'masters', 'ryder cup', 'open championship', 'mcilroy', 'scheffler', 'woods'],
    images: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&h=900&fit=crop', // golf course
    ] },
  // NFL / American Football
  { keywords: ['nfl', 'super bowl', 'touchdown', 'quarterback', 'chiefs', 'eagles', 'cowboys', 'patriots', 'mahomes'],
    images: [
      'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1600&h=900&fit=crop', // american football
    ] },
  // Olympics / Athletics
  { keywords: ['olympics', 'olympic', 'athletics', 'marathon', 'sprint', '100m', 'medal', 'gold medal'],
    images: [
      'https://images.unsplash.com/photo-1461896836934-bd45ba7296f7?w=1600&h=900&fit=crop', // athletics track
    ] },
];

// Category fallback images (used when no topic match)
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Sports': [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&h=900&fit=crop', // football — safe default for UK
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1600&h=900&fit=crop', // stadium
    'https://images.unsplash.com/photo-1461896836934-bd45ba7296f7?w=1600&h=900&fit=crop', // athletics
  ],
  'Politics': [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1600&h=900&fit=crop',
  ],
  'Entertainment': [
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=900&fit=crop',
  ],
  'Technology': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&h=900&fit=crop',
  ],
  'Business': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop',
  ],
  'Science': [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1600&h=900&fit=crop',
  ],
  'Health': [
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=900&fit=crop',
  ],
  'World': [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop',
  ],
  'Culture': [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&h=900&fit=crop',
  ],
  'Breaking': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&h=900&fit=crop',
  ],
};

export interface GeneratedBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  readingTime: number;
  newsSource: string;
  status: 'published' | 'draft';
}

/**
 * Generates a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

/**
 * Pick a hero image. Google Trends thumbnails (encrypted-tbn*) are tiny
 * newspaper logos — always use our curated Unsplash images instead.
 * Only use source images from domains we know serve real photos.
 */
function getHeroImage(sourceUrl: string | undefined, category: string, title: string = ''): string {
  if (!sourceUrl) return selectImage(category, title);

  // Reject Google's tiny thumbnails (80×80 logos)
  if (sourceUrl.includes('encrypted-tbn')) return selectImage(category, title);

  // Reject common logo/favicon patterns
  const rejectPatterns = [
    '/favicon', '/logo', '/brand', '/icon',
    'static/images/logo', 'masthead', 'header-image',
    'apple-touch-icon', 'og-default', 'placeholder',
  ];
  const lower = sourceUrl.toLowerCase();
  if (rejectPatterns.some(p => lower.includes(p))) return selectImage(category, title);

  // Only trust known photo CDNs / high-quality sources
  const trustedDomains = [
    'images.unsplash.com',
    'images.pexels.com',
    'cdn.pixabay.com',
    'media.gettyimages.com',
    'ichef.bbci.co.uk',
    'static.reuters.com',
    'static01.nyt.com',
    'i.guim.co.uk',
    'media.cnn.com',
    's.yimg.com',
    'dims.apnews.com',
  ];

  try {
    const hostname = new URL(sourceUrl).hostname;
    if (trustedDomains.some(d => hostname.includes(d))) return sourceUrl;
  } catch {
    // invalid URL
  }

  // Default: use topic-aware category image
  return selectImage(category, title);
}

/**
 * Calculates reading time based on word count
 */
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Selects an image by matching topic keywords in the title first,
 * then falling back to category-level images.
 */
function selectImage(category: string, title: string = ''): string {
  const lower = title.toLowerCase();

  // Try topic-specific match
  for (const topic of TOPIC_IMAGES) {
    if (topic.keywords.some(kw => lower.includes(kw))) {
      return topic.images[Math.floor(Math.random() * topic.images.length)];
    }
  }

  // Fallback to category
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Breaking'];
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Generates a trending story using OpenAI.
 * When quickTake is true, generates a shorter ~300-word article
 * for maximum speed on fast-breaking topics.
 */
export async function generateBlogPost(
  newsItem: NewsItem,
  openaiClient: OpenAI,
  quickTake: boolean = false
): Promise<GeneratedBlogPost | null> {
  const relatedContext = newsItem.newsItems
    ? newsItem.newsItems.map(n => `- ${n.title} (${n.source})`).join('\n')
    : '';

  const wordTarget = quickTake ? '250-350 words' : '600-1000 words';

  const systemPrompt = `You are the voice of uni-uk.ai — think a sharp, witty mate who happens to be obsessed with the news. You're the person at the pub everyone turns to when something big happens because you always know the story AND make it entertaining.

YOUR CHARACTER:
- Witty, slightly irreverent, but never mean-spirited
- You have genuine opinions — don't sit on the fence. Take a stance, make a call
- You use vivid language, unexpected analogies, and the occasional dry joke
- You're British but globally aware. You'll reference everything from Premier League to K-pop if the story demands it
- You swear very occasionally for emphasis (damn, bloody hell) but never gratuitously
- You genuinely find this stuff fascinating — your enthusiasm is infectious

WHAT YOU NEVER DO:
- NEVER use these dead phrases: "Here's what you need to know", "Here's what we know", "Everything you need to know", "Let's dive in", "In this article", "What you need to know", "Buckle up"
- NEVER use generic SEO filler headings like "Why Does This Matter?" or "What's Next?" as standalone headings. Instead make them SPECIFIC: "Why Arsenal Fans Should Be Worried" or "The Domino Effect on EU Trade Talks"
- NEVER write like a corporate blog or press release
- NEVER start with "In a shocking turn of events" or similar clichés
- NEVER use "landscape", "paradigm", "deep dive", "unpack", or "at the end of the day"

WRITING STYLE:
- Write in British English
- Target ${wordTarget}${quickTake ? '\n- QUICK TAKE — hit hard and fast. What happened, why it\'s wild, what to watch. No fluff.' : ''}
- Open with a HOOK that grabs — a striking fact, a bold claim, a surprising comparison. The first line should make someone stop scrolling
- The trending keyword must appear naturally in the first sentence
- H2 headings should be SPECIFIC and COMPELLING, not generic. They should make someone want to read that section
  Good: "## The £400M Gamble That Backfired", "## Three Stats That Tell the Real Story", "## Why This Keeps Happening"
  Bad: "## Why Does This Matter?", "## What's Next?", "## Here's What We Know"
- Write like you're telling a story, not filing a report. Build narrative tension
- End with a punchy closer — a prediction, a provocative question, or a mic-drop observation

TITLE RULES:
- NEVER use just the topic name. "Fernando Alonso" is WRONG.
- Titles should be MAGNETIC — someone should feel compelled to click
- Mix up your title styles. Rotate between:
  1. Bold declarations: "Bitcoin Just Did Something It Hasn't Done Since 2021"
  2. Intriguing questions: "Is This the End of the Road for TikTok in the US?"
  3. Dramatic framing: "The 90 Seconds That Changed the Championship Race"
  4. Punchy takes: "England's Batting Collapse Was Entirely Predictable"
  5. Curiosity gaps: "The Real Reason Netflix Just Lost 2 Million Subscribers"
- 50-80 characters ideal. Must contain the trending keyword.
- The excerpt should be a DIRECT, factual answer — Google uses this for featured snippets

LINKS:
1. ONE link to our AI: [Ask our AI about this](/#search)
2. ONE link to trending: [More trending stories](/blog)
3. 2-3 external links to REAL sources (BBC, Reuters, Guardian, Sky News, CNN etc.)
   - Use proper markdown: [BBC News](https://www.bbc.co.uk/news)
   - If unsure of exact URL, link to source homepage
   - NEVER use fake URLs

OUTPUT FORMAT (JSON only, no markdown blocks):
{
  "title": "Magnetic, specific title with trending keyword (50-80 chars)",
  "excerpt": "Direct factual answer — lead with the key fact (120-160 chars)",
  "content": "Full markdown with compelling headings and all links",
  "category": "One of: Sports, Politics, Entertainment, Technology, Business, Science, Health, World, Culture, Breaking",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const userPrompt = `Write about this topic that's blowing up right now:

TRENDING TOPIC: ${newsItem.title}
SEARCH VOLUME: ${newsItem.trafficVolume || 'High'}
TRENDING IN: ${(newsItem as any).regionLabel || 'UK'}
RELATED HEADLINES:
${relatedContext || newsItem.description}

Key requirements:
1. TITLE: Must be magnetic and specific. Include the trending keyword but make it INTERESTING.
   BAD: "Fernando Alonso Explained: What You Need to Know"
   GOOD: "Fernando Alonso's Bombshell Move Just Shook Up the F1 Grid"
   GOOD: "The Numbers Behind Fernando Alonso's Stunning Season"
   BAD: "iPhone 16: Here's Everything We Know"
   GOOD: "Apple's Biggest iPhone Gamble in Years — and It Might Actually Work"
2. Open with a line that STOPS THE SCROLL — a striking fact, bold take, or vivid scene
3. H2 headings must be SPECIFIC to the story, not generic templates
   BAD: "## Why Does This Matter?" / "## What Happens Next?"
   GOOD: "## The Ripple Effect on Red Bull's Title Hopes" / "## Why Wall Street Is Sweating"
4. Give the reader context they can't get from a headline — the WHY behind the news
5. Have a genuine take — what do YOU think this means?
6. End strong — a prediction, a provocative thought, or a killer one-liner
7. Excerpt must be a DIRECT factual answer (Google featured snippets)
8. Naturally include the trending keyword 3-5 times

Output ONLY the JSON object.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: quickTake ? 1200 : 2500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      console.error('No response from OpenAI');
      return null;
    }

    let jsonText = responseText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    const now = new Date().toISOString();
    const blogPost: GeneratedBlogPost = {
      slug: generateSlug(parsed.title),
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      author: 'uni-uk.ai Newsroom',
      publishedAt: now,
      updatedAt: now,
      imageUrl: getHeroImage(newsItem.pictureUrl, parsed.category, parsed.title),
      category: parsed.category || 'Breaking',
      tags: parsed.tags || [],
      readingTime: calculateReadingTime(parsed.content),
      newsSource: newsItem.link,
      status: 'published',
    };

    return blogPost;
  } catch (error) {
    console.error('Error generating story:', error);
    return null;
  }
}

/**
 * Validation checks for generated stories
 */
export function validateBlogPost(post: GeneratedBlogPost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (post.title.length < 20) errors.push('Title too short (min 20 chars)');
  if (post.title.length > 100) errors.push('Title too long (max 100 chars)');
  if (post.excerpt.length < 50) errors.push('Excerpt too short (min 50 chars)');
  if (post.excerpt.length > 250) errors.push('Excerpt too long (max 250 chars)');
  if (post.content.length < 500) errors.push('Content too short (min 500 chars)');

  if (!/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('Invalid slug format');
  }

  const validCategories = ['Sports', 'Politics', 'Entertainment', 'Technology', 'Business', 'Science', 'Health', 'World', 'Culture', 'Breaking'];
  if (!validCategories.includes(post.category)) {
    errors.push(`Invalid category: ${post.category}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Not needed for trending — we process all topics, not select one
 * Kept for API compatibility
 */
export async function selectBestTopic(
  newsItems: NewsItem[],
  openaiClient: OpenAI
): Promise<NewsItem | null> {
  if (newsItems.length === 0) return null;
  return newsItems[0];
}
