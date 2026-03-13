/**
 * Blog Data Module
 * Combines static blog posts with dynamically generated posts from Google Sheets
 */

import { google } from 'googleapis';
import {
  BlogPost,
  blogPosts as staticBlogPosts,
  getAllBlogPosts as getStaticBlogPosts,
  getBlogPostBySlug as getStaticBlogPostBySlug,
} from '@/data/blog-posts';

// Extended interface for dynamic posts
export interface DynamicBlogPost extends BlogPost {
  newsSource?: string;
  status?: 'published' | 'draft';
  _sheetRow?: number; // Internal: row index for tiebreaking sort
}

/**
 * Fetches blog posts from Google Sheets (BlogPosts sheet)
 */
async function fetchBlogPostsFromSheets(): Promise<DynamicBlogPost[]> {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GOOGLE_SHEET_ID) {
      console.warn('Google Sheets credentials not configured');
      return [];
    }

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from BlogPosts sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'BlogPosts!A:M', // Columns A through M
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      // No data or only header row
      return [];
    }

    // Skip header row and parse data
    const posts: DynamicBlogPost[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // Skip empty rows

      // Only include published posts
      const status = (row[12] || 'published').toLowerCase();
      if (status === 'draft') continue;

      try {
        const post: DynamicBlogPost = {
          slug: row[0] || '',
          title: row[1] || '',
          excerpt: row[2] || '',
          content: row[3] || '',
          author: row[4] || 'uni-uk.ai Team',
          publishedAt: row[5] || new Date().toISOString(),
          updatedAt: row[6] || row[5] || new Date().toISOString(),
          imageUrl: row[7] || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=630&fit=crop',
          category: row[8] || 'News',
          tags: parseJsonArray(row[9]),
          readingTime: parseInt(row[10], 10) || 5,
          newsSource: row[11] || '',
          status: status as 'published' | 'draft',
          _sheetRow: i,
        };

        // Basic validation
        if (post.slug && post.title && post.content) {
          posts.push(post);
        }
      } catch (parseError) {
        console.error(`Error parsing row ${i}:`, parseError);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts from Sheets:', error);
    return [];
  }
}

/**
 * Parses a JSON array string or returns empty array
 */
function parseJsonArray(value: string | undefined): string[] {
  if (!value) return [];

  try {
    // Try parsing as JSON
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    // If not valid JSON, try splitting by comma
    if (value.includes(',')) {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Single value
    return value ? [value.trim()] : [];
  }
}

/**
 * Gets all blog posts (static + dynamic), sorted by date
 */
export async function getAllBlogPostsCombined(): Promise<DynamicBlogPost[]> {
  // Get static posts
  const staticPosts = getStaticBlogPosts();

  // Try to get dynamic posts from Sheets
  let dynamicPosts: DynamicBlogPost[] = [];
  try {
    dynamicPosts = await fetchBlogPostsFromSheets();
  } catch (error) {
    console.error('Error fetching dynamic posts:', error);
  }

  // Combine and deduplicate (dynamic posts take precedence by slug)
  const slugMap = new Map<string, DynamicBlogPost>();

  // Add static posts first
  for (const post of staticPosts) {
    slugMap.set(post.slug, post);
  }

  // Dynamic posts override static posts with same slug
  for (const post of dynamicPosts) {
    slugMap.set(post.slug, post);
  }

  // Convert to array and sort by date (newest first)
  // When dates are equal (e.g. same-day YYYY-MM-DD), use sheet row as tiebreaker
  const allPosts = Array.from(slugMap.values());
  allPosts.sort((a, b) => {
    const timeDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    // Higher sheet row = more recent = should come first
    return (b._sheetRow ?? 0) - (a._sheetRow ?? 0);
  });

  return allPosts;
}

/**
 * Gets a single blog post by slug (checks dynamic first, then static)
 */
export async function getBlogPostBySlugCombined(slug: string): Promise<DynamicBlogPost | undefined> {
  // First try dynamic posts
  try {
    const dynamicPosts = await fetchBlogPostsFromSheets();
    const dynamicPost = dynamicPosts.find(p => p.slug === slug);
    if (dynamicPost) {
      return dynamicPost;
    }
  } catch (error) {
    console.error('Error fetching dynamic post:', error);
  }

  // Fall back to static posts
  const staticPost = getStaticBlogPostBySlug(slug);
  return staticPost;
}

/**
 * Gets all unique categories from combined posts
 */
export async function getAllCategoriesCombined(): Promise<string[]> {
  const posts = await getAllBlogPostsCombined();
  const categories = new Set(posts.map(post => post.category));
  return Array.from(categories).sort();
}

/**
 * Gets all unique tags from combined posts
 */
export async function getAllTagsCombined(): Promise<string[]> {
  const posts = await getAllBlogPostsCombined();
  const tags = new Set(posts.flatMap(post => post.tags));
  return Array.from(tags).sort();
}

/**
 * Gets related posts based on category and tags
 */
export async function getRelatedBlogPostsCombined(
  currentSlug: string,
  limit: number = 3
): Promise<DynamicBlogPost[]> {
  const allPosts = await getAllBlogPostsCombined();
  const currentPost = allPosts.find(p => p.slug === currentSlug);

  if (!currentPost) return [];

  const scored = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      let score = 0;
      if (post.category === currentPost.category) score += 3;
      const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += commonTags.length;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.post);
}

/**
 * Checks if a slug already exists in the database
 */
export async function slugExists(slug: string): Promise<boolean> {
  // Check static posts first (faster)
  if (staticBlogPosts.some(p => p.slug === slug)) {
    return true;
  }

  // Check dynamic posts
  try {
    const dynamicPosts = await fetchBlogPostsFromSheets();
    return dynamicPosts.some(p => p.slug === slug);
  } catch {
    return false;
  }
}

/**
 * Gets all news source URLs that have already been used for blog posts
 */
export async function getUsedNewsSourceUrls(): Promise<Set<string>> {
  const usedUrls = new Set<string>();

  try {
    const dynamicPosts = await fetchBlogPostsFromSheets();
    for (const post of dynamicPosts) {
      if (post.newsSource) {
        // Normalize URL by removing trailing slashes and query params
        const normalizedUrl = normalizeUrl(post.newsSource);
        usedUrls.add(normalizedUrl);
      }
    }
  } catch (error) {
    console.error('Error fetching used news sources:', error);
  }

  return usedUrls;
}

/**
 * Normalizes a URL for comparison (removes query params, trailing slashes, etc.)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('at_medium');
    parsed.searchParams.delete('at_campaign');
    // Return pathname + remaining params
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    // If URL parsing fails, just normalize the string
    return url.replace(/\/$/, '').toLowerCase();
  }
}
