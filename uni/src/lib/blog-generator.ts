/**
 * Trending Story Generator Module
 * Uses OpenAI to generate SEO-optimized articles about trending topics
 */

import OpenAI from 'openai';
import { NewsItem } from './news-sources';

// Category-based stock images for trending stories
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-bd45ba7296f7?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=630&fit=crop',
  ],
  'Politics': [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1200&h=630&fit=crop',
  ],
  'Entertainment': [
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&fit=crop',
  ],
  'Technology': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop',
  ],
  'Business': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
  ],
  'Science': [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop',
  ],
  'Health': [
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop',
  ],
  'World': [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
  ],
  'Culture': [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=630&fit=crop',
  ],
  'Breaking': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop',
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
 * Calculates reading time based on word count
 */
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Selects an image based on category
 */
function selectImage(category: string): string {
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
      imageUrl: newsItem.pictureUrl || selectImage(parsed.category),
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
