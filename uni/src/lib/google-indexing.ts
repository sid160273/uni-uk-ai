/**
 * Google Indexing API Utility
 *
 * Pings Google's Indexing API to request immediate crawling/indexing
 * of new or updated URLs. Uses the same service account credentials
 * as the rest of the application.
 *
 * Prerequisites:
 * - The Indexing API must be enabled in the Google Cloud project
 * - The service account must be added as an owner in Google Search Console
 *   for the property https://uni-uk.ai
 */

import { google } from 'googleapis';

const SITE_URL = 'https://uni-uk.ai';

type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

interface IndexingResult {
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Notify Google Indexing API about a URL update or deletion.
 *
 * @param url - The fully-qualified URL to submit
 * @param type - "URL_UPDATED" (default) or "URL_DELETED"
 * @returns IndexingResult with success status
 */
export async function notifyGoogleIndexing(
  url: string,
  type: IndexingAction = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.warn('[Google Indexing] No credentials configured, skipping');
      return { url, success: false, error: 'No credentials configured' };
    }

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const accessToken = await auth.getAccessToken();

    const response = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url,
          type,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[Google Indexing] Failed for ${url}: ${response.status} ${response.statusText}`,
        errorBody
      );
      return {
        url,
        success: false,
        error: `HTTP ${response.status}: ${errorBody}`,
      };
    }

    const data = await response.json();
    console.log(`[Google Indexing] Successfully notified for ${url}`, data);
    return { url, success: true };
  } catch (error: any) {
    console.error(`[Google Indexing] Error notifying for ${url}:`, error.message);
    return { url, success: false, error: error.message };
  }
}

/**
 * Notify Google about a new blog post plus related pages.
 *
 * Submits three URLs in parallel:
 * 1. The blog post itself
 * 2. The sitemap (so Google re-reads it)
 * 3. The homepage (often lists recent posts)
 *
 * Errors are caught and logged — this never throws, so it won't
 * break the calling cron job.
 *
 * @param slug - The blog post slug (e.g. "my-new-post")
 * @returns Array of IndexingResult for each URL submitted
 */
export async function notifyNewBlogPost(slug: string): Promise<IndexingResult[]> {
  const urls = [
    `${SITE_URL}/blog/${slug}`,
    `${SITE_URL}/sitemap.xml`,
    SITE_URL,
  ];

  console.log(`[Google Indexing] Submitting ${urls.length} URLs for new blog post "${slug}"`);

  const results = await Promise.allSettled(
    urls.map((url) => notifyGoogleIndexing(url))
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error(`[Google Indexing] Unexpected rejection for ${urls[i]}:`, result.reason);
    return { url: urls[i], success: false, error: result.reason?.message ?? 'Unknown error' };
  });
}
