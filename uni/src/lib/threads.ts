/**
 * Threads (Meta) Posting Utility
 * Posts to Threads via Meta's Graph API.
 *
 * Required env vars:
 *   THREADS_USER_ID      — your Threads user ID
 *   THREADS_ACCESS_TOKEN — long-lived access token (60 days, must be refreshed)
 *
 * Setup:
 *   1. Create Meta Developer app at developers.facebook.com
 *   2. Add "Access the Threads API" use case
 *   3. Add threads_basic + threads_content_publish permissions
 *   4. Complete OAuth flow to get access token
 *   5. Exchange for long-lived token (60 days)
 */

const THREADS_API = 'https://graph.threads.net/v1.0';

interface ThreadsResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Post to Threads. Two-step process: create container, then publish.
 * Threads auto-generates link previews from URLs in the text.
 *
 * @param text — Post text (max 500 characters)
 */
export async function postToThreads(text: string): Promise<ThreadsResult> {
  try {
    if (process.env.THREADS_ENABLED === 'false') {
      return { success: false, error: 'Threads posting disabled (THREADS_ENABLED=false)' };
    }

    const userId = process.env.THREADS_USER_ID;
    const accessToken = process.env.THREADS_ACCESS_TOKEN;

    if (!userId || !accessToken) {
      return {
        success: false,
        error: 'THREADS_USER_ID and THREADS_ACCESS_TOKEN must be set',
      };
    }

    // Truncate to 500 chars if needed
    const postText = text.length > 500 ? text.slice(0, 497) + '...' : text;

    // Step 1: Create media container
    const createRes = await fetch(
      `${THREADS_API}/${userId}/threads?media_type=TEXT&text=${encodeURIComponent(postText)}&access_token=${accessToken}`,
      { method: 'POST' }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      return { success: false, error: `Threads container creation failed (${createRes.status}): ${err}` };
    }

    const createData = await createRes.json();
    const containerId = createData.id;

    if (!containerId) {
      return { success: false, error: 'No container ID returned from Threads API' };
    }

    // Step 2: Publish the container
    const publishRes = await fetch(
      `${THREADS_API}/${userId}/threads_publish?creation_id=${containerId}&access_token=${accessToken}`,
      { method: 'POST' }
    );

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return { success: false, error: `Threads publish failed (${publishRes.status}): ${err}` };
    }

    const publishData = await publishRes.json();

    return {
      success: true,
      postId: publishData.id,
    };
  } catch (err: any) {
    console.error('[Threads] Post failed:', err.message);
    return {
      success: false,
      error: `Threads posting failed: ${err.message || String(err)}`,
    };
  }
}

/**
 * Refresh a long-lived Threads access token.
 * Call this before the 60-day expiry. Returns the new token.
 */
export async function refreshThreadsToken(): Promise<{ token: string; expiresIn: number } | null> {
  try {
    const accessToken = process.env.THREADS_ACCESS_TOKEN;
    if (!accessToken) return null;

    const res = await fetch(
      `${THREADS_API}/oauth/access_token?grant_type=th_exchange_token&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return {
      token: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch {
    return null;
  }
}
