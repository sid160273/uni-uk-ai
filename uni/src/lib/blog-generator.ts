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
 * Generates a trending story using OpenAI
 */
export async function generateBlogPost(
  newsItem: NewsItem,
  openaiClient: OpenAI
): Promise<GeneratedBlogPost | null> {
  const relatedContext = newsItem.newsItems
    ? newsItem.newsItems.map(n => `- ${n.title} (${n.source})`).join('\n')
    : '';

  const systemPrompt = `You are a world-class journalist writing for uni-uk.ai, a fast-moving news platform that helps people understand what's trending RIGHT NOW.

BRAND VOICE:
- Sharp, engaging, and informative
- Write like you're explaining the story to a smart friend
- Make complex topics accessible without dumbing them down
- Create urgency — this is happening NOW

WRITING GUIDELINES:
- Write in British English
- Target 600-1000 words — punchy, not padded
- Use an engaging, journalistic tone — hook them in the first line
- The trending keyword MUST appear naturally in the very first sentence
- Structure with clear H2 (##) and H3 (###) headings
- Use QUESTION-BASED H2 headings that target "People Also Ask" snippets. Examples:
  - "What happened with [topic]?"
  - "Why is [topic] trending right now?"
  - "Why does this matter?"
  - "What are people saying about [topic]?"
  - "What happens next?"
- Include a "Why This Matters" and "What's Next" section (these can use the question format above)
- Cite facts and context where relevant

SEO REQUIREMENTS — LONG-TAIL TITLES (CRITICAL):
- NEVER use just the topic name as the title. "Fernando Alonso" is WRONG. We cannot rank for head terms.
- Title MUST be in a long-tail question or explainer format (50-80 characters ideal)
- Rotate between these title patterns — do NOT always use the same one:
  1. "Why Is [X] Trending Today? Latest News Explained"
  2. "[X] Explained: What You Need to Know"
  3. "What Happened With [X]? Here's What We Know"
  4. "[X]: Why Everyone Is Talking About It Right Now"
  5. "The [X] Story: What's Going On and Why It Matters"
- The title must contain the trending keyword AND a long-tail qualifier (why, what, explained, latest, etc.)
- Include the trending term 3-5 times throughout the article
- Use related long-tail keywords and question phrases in H2 headings
- Write the meta excerpt as a DIRECT ANSWER to the question implied by the title — Google pulls direct answers for featured snippets. Start the excerpt with the key fact, not a vague teaser.

LINK REQUIREMENTS (CRITICAL — you MUST use proper markdown link syntax for EVERY link):
1. HOMEPAGE CHAT LINK - Include ONE link to our AI assistant:
   [Ask our AI about this topic](/#search) or [Chat with us about this](/#search)

2. TRENDING PAGE LINK - Include ONE link:
   [See all trending stories](/blog) or [What else is trending](/blog)

3. EXTERNAL SOURCE LINKS - Include 2-3 links to REAL, authoritative sources:
   - MUST use markdown link syntax: [Source Name](https://www.example.com/article-url)
   - MUST use full, real URLs starting with https://
   - Link to major news outlets: BBC, Reuters, Guardian, Sky News, CNN, etc.
   - NEVER write "check out Source Name" or "visit Source Name" without a proper markdown link
   - NEVER use placeholder or made-up URLs — only link to real, well-known domains
   - Example: [Read more on BBC News](https://www.bbc.co.uk/news) or [Guardian report](https://www.theguardian.com)
   - If unsure of exact article URL, link to the source homepage instead of guessing

OUTPUT FORMAT:
You must respond with ONLY a valid JSON object (no markdown code blocks, no explanation):
{
  "title": "Long-tail SEO title in question/explainer format (50-80 characters)",
  "excerpt": "Direct answer to the title's question — lead with the key fact (120-160 characters)",
  "content": "Full markdown content with question-based H2 headings and all links included",
  "category": "One of: Sports, Politics, Entertainment, Technology, Business, Science, Health, World, Culture, Breaking",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const userPrompt = `Write a trending story about this topic that is EXPLODING in search right now:

TRENDING TOPIC: ${newsItem.title}
SEARCH VOLUME: ${newsItem.trafficVolume || 'High'}
TRENDING IN: ${(newsItem as any).regionLabel || 'UK'}
RELATED HEADLINES:
${relatedContext || newsItem.description}

Requirements:
1. TITLE FORMAT (CRITICAL): The title MUST be a long-tail question or explainer — NEVER just the topic name.
   BAD: "Fernando Alonso" or "iPhone 16"
   GOOD: "Why Is Fernando Alonso Trending? Latest F1 News Explained"
   GOOD: "iPhone 16 Explained: What's New and Should You Upgrade?"
   Pick a varied format — rotate between "Why Is...", "[X] Explained:...", "What Happened With...?", etc.
2. Open with a strong hook that includes the trending keyword in the FIRST sentence
3. Use 2-3 QUESTION-BASED H2 subheadings that people would actually type into Google:
   e.g. "## Why is [topic] trending today?", "## What does this mean for...?", "## What happens next?"
4. Provide essential context and background
5. Include a "Why does this matter?" section explaining the wider significance
6. Include a "What happens next?" section with what to watch for
7. Write the excerpt as a DIRECT ANSWER to the title's question — start with the key fact
8. Make it the definitive quick-read on this trending topic
9. Optimise for long-tail search traffic — people are searching questions about this topic

Remember: Output ONLY the JSON object, no other text.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
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
