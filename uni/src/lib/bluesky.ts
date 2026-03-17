/**
 * Bluesky Posting Utility
 * Posts to Bluesky (AT Protocol) with rich text links and link card embeds.
 *
 * Required env vars:
 *   BLUESKY_HANDLE    — e.g. "uniukai.bsky.social"
 *   BLUESKY_APP_PASSWORD — app-specific password from Bluesky settings
 */

import { AtpAgent, RichText } from '@atproto/api';

interface BlueskyResult {
  success: boolean;
  uri?: string;
  error?: string;
}

const SITE_URL = 'https://uni-uk.ai';

let cachedAgent: AtpAgent | null = null;
let sessionExpiresAt = 0;

/**
 * Get an authenticated Bluesky agent, reusing session when possible.
 */
async function getAgent(): Promise<AtpAgent> {
  const now = Date.now();

  if (cachedAgent && now < sessionExpiresAt) {
    return cachedAgent;
  }

  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    throw new Error('BLUESKY_HANDLE and BLUESKY_APP_PASSWORD must be set');
  }

  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({ identifier: handle, password });

  cachedAgent = agent;
  // Sessions last ~2 hours; refresh after 90 minutes
  sessionExpiresAt = now + 90 * 60 * 1000;

  return agent;
}

/**
 * Fetch OpenGraph metadata from a URL for the link card embed.
 */
async function fetchOGData(url: string): Promise<{ title: string; description: string; imageUrl?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'uni-uk-ai-bot/1.0' },
      redirect: 'follow',
    });

    if (!res.ok) {
      return { title: url, description: '' };
    }

    const html = await res.text();

    const getMetaContent = (property: string): string => {
      // Match both property="og:X" and name="og:X"
      const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
      const altRegex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
      return regex.exec(html)?.[1] || altRegex.exec(html)?.[1] || '';
    };

    const title = getMetaContent('og:title') || getMetaContent('twitter:title') || url;
    const description = getMetaContent('og:description') || getMetaContent('twitter:description') || '';
    const imageUrl = getMetaContent('og:image') || getMetaContent('twitter:image') || undefined;

    return { title, description, imageUrl };
  } catch {
    return { title: url, description: '' };
  }
}

/**
 * Upload an image from URL to Bluesky as a blob for link card thumbnails.
 */
async function uploadImageFromUrl(agent: AtpAgent, imageUrl: string): Promise<any | null> {
  try {
    // Make image URL absolute if relative
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

    const res = await fetch(fullUrl);
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    // Bluesky max blob size is 1MB
    if (buffer.length > 1_000_000) return null;

    const uploaded = await agent.uploadBlob(new Uint8Array(buffer), { encoding: contentType });
    return uploaded.data.blob;
  } catch {
    return null;
  }
}

/**
 * Post to Bluesky with auto-detected rich text links and a link card embed.
 *
 * @param text  — Post text (max 300 graphemes). URLs will be auto-linked.
 * @param linkUrl — Optional URL to embed as a link card with OG preview.
 */
export async function postToBluesky(text: string, linkUrl?: string): Promise<BlueskyResult> {
  try {
    if (process.env.BLUESKY_ENABLED === 'false') {
      return { success: false, error: 'Bluesky posting disabled (BLUESKY_ENABLED=false)' };
    }

    const agent = await getAgent();

    // Build rich text with auto-detected links and mentions
    const rt = new RichText({ text });
    await rt.detectFacets(agent);

    // Build the post record
    const postRecord: any = {
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    // Attach link card embed if URL provided
    if (linkUrl) {
      const og = await fetchOGData(linkUrl);
      const embed: any = {
        $type: 'app.bsky.embed.external',
        external: {
          uri: linkUrl,
          title: og.title,
          description: og.description,
        },
      };

      // Upload thumbnail if available
      if (og.imageUrl) {
        const thumb = await uploadImageFromUrl(agent, og.imageUrl);
        if (thumb) {
          embed.external.thumb = thumb;
        }
      }

      postRecord.embed = embed;
    }

    const response = await agent.post(postRecord);

    return {
      success: true,
      uri: response.uri,
    };
  } catch (err: any) {
    console.error('[Bluesky] Post failed:', err.message);
    return {
      success: false,
      error: `Bluesky posting failed: ${err.message || String(err)}`,
    };
  }
}
