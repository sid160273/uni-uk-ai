/**
 * Blog Generator Module
 * Uses OpenAI to generate SEO-optimized blog posts about UK higher education
 */

import OpenAI from 'openai';
import { NewsItem } from './news-sources';

// University slugs for internal linking (top universities)
const UNIVERSITY_LINKS: Record<string, string> = {
  'University of Oxford': '/universities/ox-ac-uk',
  'Oxford': '/universities/ox-ac-uk',
  'University of Cambridge': '/universities/cam-ac-uk',
  'Cambridge': '/universities/cam-ac-uk',
  'Imperial College London': '/universities/imperial-ac-uk',
  'Imperial': '/universities/imperial-ac-uk',
  'UCL': '/universities/ucl-ac-uk',
  'University College London': '/universities/ucl-ac-uk',
  'London School of Economics': '/universities/lse-ac-uk',
  'LSE': '/universities/lse-ac-uk',
  'University of Edinburgh': '/universities/ed-ac-uk',
  'Edinburgh': '/universities/ed-ac-uk',
  'University of Manchester': '/universities/manchester-ac-uk',
  'Manchester': '/universities/manchester-ac-uk',
  'King\'s College London': '/universities/kcl-ac-uk',
  'KCL': '/universities/kcl-ac-uk',
  'University of Bristol': '/universities/bristol-ac-uk',
  'Bristol': '/universities/bristol-ac-uk',
  'University of Warwick': '/universities/warwick-ac-uk',
  'Warwick': '/universities/warwick-ac-uk',
  'University of Glasgow': '/universities/gla-ac-uk',
  'Glasgow': '/universities/gla-ac-uk',
  'University of Birmingham': '/universities/birmingham-ac-uk',
  'Birmingham': '/universities/birmingham-ac-uk',
  'Durham University': '/universities/durham-ac-uk',
  'Durham': '/universities/durham-ac-uk',
  'University of Leeds': '/universities/leeds-ac-uk',
  'Leeds': '/universities/leeds-ac-uk',
  'University of Sheffield': '/universities/sheffield-ac-uk',
  'Sheffield': '/universities/sheffield-ac-uk',
  'University of Southampton': '/universities/southampton-ac-uk',
  'Southampton': '/universities/southampton-ac-uk',
  'University of Nottingham': '/universities/nottingham-ac-uk',
  'Nottingham': '/universities/nottingham-ac-uk',
  'Newcastle University': '/universities/ncl-ac-uk',
  'Newcastle': '/universities/ncl-ac-uk',
  'University of Liverpool': '/universities/liverpool-ac-uk',
  'Liverpool': '/universities/liverpool-ac-uk',
  'University of Exeter': '/universities/exeter-ac-uk',
  'Exeter': '/universities/exeter-ac-uk',
  'University of York': '/universities/york-ac-uk',
  'York': '/universities/york-ac-uk',
  'Cardiff University': '/universities/cardiff-ac-uk',
  'Cardiff': '/universities/cardiff-ac-uk',
  'Queen Mary University of London': '/universities/qmul-ac-uk',
  'Queen Mary': '/universities/qmul-ac-uk',
  'University of Bath': '/universities/bath-ac-uk',
  'Bath': '/universities/bath-ac-uk',
  'University of Aberdeen': '/universities/abdn-ac-uk',
  'Aberdeen': '/universities/abdn-ac-uk',
  'University of St Andrews': '/universities/st-andrews-ac-uk',
  'St Andrews': '/universities/st-andrews-ac-uk',
  'Loughborough University': '/universities/lboro-ac-uk',
  'Loughborough': '/universities/lboro-ac-uk',
  'Lancaster University': '/universities/lancaster-ac-uk',
  'Lancaster': '/universities/lancaster-ac-uk',
  'University of Sussex': '/universities/sussex-ac-uk',
  'Sussex': '/universities/sussex-ac-uk',
  'University of Surrey': '/universities/surrey-ac-uk',
  'Surrey': '/universities/surrey-ac-uk',
  'University of Leicester': '/universities/le-ac-uk',
  'Leicester': '/universities/le-ac-uk',
  'University of Reading': '/universities/reading-ac-uk',
  'Reading': '/universities/reading-ac-uk',
  'Queen\'s University Belfast': '/universities/qub-ac-uk',
  'Swansea University': '/universities/swansea-ac-uk',
  'Swansea': '/universities/swansea-ac-uk',
  'Heriot-Watt University': '/universities/hw-ac-uk',
  'Heriot-Watt': '/universities/hw-ac-uk',
  'University of Dundee': '/universities/dundee-ac-uk',
  'Dundee': '/universities/dundee-ac-uk',
  'University of Strathclyde': '/universities/strath-ac-uk',
  'Strathclyde': '/universities/strath-ac-uk',
  'Brunel University': '/universities/brunel-ac-uk',
  'Brunel': '/universities/brunel-ac-uk',
  'University of Kent': '/universities/kent-ac-uk',
  'Kent': '/universities/kent-ac-uk',
  'Royal Holloway': '/universities/rhul-ac-uk',
  'Aston University': '/universities/aston-ac-uk',
  'Aston': '/universities/aston-ac-uk',
  'Coventry University': '/universities/coventry-ac-uk',
  'Coventry': '/universities/coventry-ac-uk',
};

// Category-based stock images
const CATEGORY_IMAGES: Record<string, string[]> = {
  'News': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop',
  ],
  'Research': [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=630&fit=crop',
  ],
  'Student Life': [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=630&fit=crop',
  ],
  'Admissions': [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=630&fit=crop',
  ],
  'Finance': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=630&fit=crop',
  ],
  'Careers': [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
  ],
  'Rankings': [
    'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop',
  ],
  'Policy': [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&h=630&fit=crop',
  ],
  'International': [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=1200&h=630&fit=crop',
  ],
  'Technology': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=630&fit=crop',
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
  return Math.ceil(words / 200); // Average 200 words per minute
}

/**
 * Selects an image based on category
 */
function selectImage(category: string): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['News'];
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Generates a blog post using OpenAI
 */
export async function generateBlogPost(
  newsItem: NewsItem,
  openaiClient: OpenAI
): Promise<GeneratedBlogPost | null> {
  const universityList = Object.entries(UNIVERSITY_LINKS)
    .filter(([name]) => !name.includes('\'')) // Filter out short names
    .map(([name, slug]) => `- ${name}: ${slug}`)
    .join('\n');

  const systemPrompt = `You are an expert UK higher education journalist writing for uni-uk.ai, a website that helps students find the perfect UK university.

WRITING GUIDELINES:
- Write in British English (use "s" not "z" spellings: organise, recognise, etc.)
- Target 800-1200 words
- Use an informative but engaging tone
- Structure with clear H2 (##) and H3 (###) headings
- Include practical advice and actionable insights
- Cite statistics and facts where relevant

CRITICAL LINK REQUIREMENTS:
1. INTERNAL LINKS - Include at least 3-5 university links using this EXACT format:
   [University Name](/universities/SLUG)
   Example: [University of Oxford](/universities/ox-ac-uk)

2. HOMEPAGE CHAT LINK - Always include ONE link to our AI finder:
   [Try our AI university finder](/#search) or [find your perfect university](/#search)

3. UNIVERSITIES PAGE LINK - Include ONE link to browse all:
   [Browse all UK universities](/universities) or [explore all UK universities](/universities)

4. EXTERNAL LINKS - Include 2-3 links to authoritative sources:
   - Link to the original news source
   - Link to official university websites or gov.uk when relevant
   - Use full URLs with https://

UNIVERSITY SLUGS FOR INTERNAL LINKS:
${universityList}

OUTPUT FORMAT:
You must respond with ONLY a valid JSON object (no markdown code blocks, no explanation):
{
  "title": "Engaging title (50-70 characters ideal)",
  "excerpt": "Compelling summary for previews (120-160 characters)",
  "content": "Full markdown content with all links included",
  "category": "One of: News, Research, Student Life, Admissions, Finance, Careers, Rankings, Policy, International, Technology",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const userPrompt = `Write a blog post based on this UK higher education news:

HEADLINE: ${newsItem.title}
SOURCE: ${newsItem.source}
LINK: ${newsItem.link}
SUMMARY: ${newsItem.description}

Requirements:
1. Expand on this news with context and analysis
2. Explain what this means for prospective students
3. Mention relevant universities by name WITH links
4. Include the original news source as an external link
5. Add a call-to-action to explore universities on our site
6. Make it helpful for students researching UK universities

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

    // Parse JSON response (handle potential markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    // Build the full blog post
    const now = new Date().toISOString().split('T')[0];
    const blogPost: GeneratedBlogPost = {
      slug: generateSlug(parsed.title),
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      author: 'uni-uk.ai Team',
      publishedAt: now,
      updatedAt: now,
      imageUrl: selectImage(parsed.category),
      category: parsed.category || 'News',
      tags: parsed.tags || [],
      readingTime: calculateReadingTime(parsed.content),
      newsSource: newsItem.link,
      status: 'published',
    };

    return blogPost;
  } catch (error) {
    console.error('Error generating blog post:', error);
    return null;
  }
}

/**
 * Validation checks for generated blog posts
 */
export function validateBlogPost(post: GeneratedBlogPost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title checks
  if (post.title.length < 20) errors.push('Title too short (min 20 chars)');
  if (post.title.length > 100) errors.push('Title too long (max 100 chars)');

  // Excerpt checks
  if (post.excerpt.length < 50) errors.push('Excerpt too short (min 50 chars)');
  if (post.excerpt.length > 250) errors.push('Excerpt too long (max 250 chars)');

  // Content checks
  if (post.content.length < 500) errors.push('Content too short (min 500 chars)');

  // Internal university links
  const uniLinkPattern = /\[.*?\]\(\/universities\/[a-z0-9-]+\)/g;
  const uniLinks = post.content.match(uniLinkPattern);
  if (!uniLinks || uniLinks.length < 2) {
    errors.push('Missing internal university links (need at least 2)');
  }

  // Homepage link
  if (!post.content.includes('/#search')) {
    errors.push('Missing homepage search link (/#search)');
  }

  // External links
  const externalLinkPattern = /https?:\/\/[^\s\)]+/g;
  const externalLinks = post.content.match(externalLinkPattern);
  if (!externalLinks || externalLinks.length < 1) {
    errors.push('Missing external links (need at least 1)');
  }

  // Slug format
  if (!/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('Invalid slug format (must be lowercase alphanumeric with hyphens)');
  }

  // Category validation
  const validCategories = ['News', 'Research', 'Student Life', 'Admissions', 'Finance', 'Careers', 'Rankings', 'Policy', 'International', 'Technology'];
  if (!validCategories.includes(post.category)) {
    errors.push(`Invalid category: ${post.category}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Selects the best news item to write about
 */
export async function selectBestTopic(
  newsItems: NewsItem[],
  openaiClient: OpenAI
): Promise<NewsItem | null> {
  if (newsItems.length === 0) return null;
  if (newsItems.length === 1) return newsItems[0];

  const prompt = `You are selecting the best news story for a UK university student audience.

Here are the news items (newest first):

${newsItems.slice(0, 10).map((item, i) =>
    `${i + 1}. "${item.title}" (${item.source})
   ${item.description.substring(0, 150)}...`
  ).join('\n\n')}

Select the ONE story that would be most valuable for students researching UK universities. Consider:
- Relevance to prospective students
- Timeliness and newsworthiness
- Potential for practical advice
- Interest level

Respond with ONLY the number (1-10) of your selection.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    const index = parseInt(response || '1', 10) - 1;

    if (index >= 0 && index < newsItems.length) {
      return newsItems[index];
    }
    return newsItems[0]; // Fallback to first item
  } catch (error) {
    console.error('Error selecting topic:', error);
    return newsItems[0]; // Fallback to first item
  }
}
