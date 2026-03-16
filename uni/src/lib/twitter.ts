/**
 * Twitter/X API v2 Posting Utility
 * Uses OAuth 1.0a User Context authentication with manual signature generation.
 * No external dependencies — uses only Node.js built-in crypto and native fetch.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TweetResult {
  success: boolean;
  tweetId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// OAuth 1.0a helpers
// ---------------------------------------------------------------------------

/** RFC 3986 percent-encode (Twitter requires this exact encoding) */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

/** Generate a cryptographically random nonce */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Build the OAuth 1.0a signature base string and compute the HMAC-SHA1 signature.
 *
 * Reference: https://developer.twitter.com/en/docs/authentication/oauth-1-0a/creating-a-signature
 */
function buildOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string,
): string {
  // 1. Collect and sort parameters (no body params for JSON requests)
  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  // 2. Build the signature base string
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join('&');

  // 3. Build the signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // 4. HMAC-SHA1
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(baseString);
  return hmac.digest('base64');
}

/**
 * Build the Authorization header value for an OAuth 1.0a request.
 */
function buildAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const signature = buildOAuthSignature(
    method,
    url,
    oauthParams,
    consumerSecret,
    accessSecret,
  );

  oauthParams['oauth_signature'] = signature;

  // Build the header value — keys sorted alphabetically
  const headerParts = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const TWITTER_TWEETS_ENDPOINT = 'https://api.twitter.com/2/tweets';

/**
 * Posts a tweet using the Twitter API v2 with OAuth 1.0a User Context.
 *
 * Required environment variables:
 *  - TWITTER_API_KEY        (consumer / app key)
 *  - TWITTER_API_SECRET     (consumer / app secret)
 *  - TWITTER_ACCESS_TOKEN   (user access token)
 *  - TWITTER_ACCESS_SECRET  (user access token secret)
 *
 * Never throws — always returns a result object.
 */
export async function postTweet(text: string): Promise<TweetResult> {
  try {
    // --- Validate env vars ------------------------------------------------
    const consumerKey = process.env.TWITTER_API_KEY;
    const consumerSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
      return {
        success: false,
        error: 'Twitter API credentials not configured. Need: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET',
      };
    }

    // --- Validate tweet text -----------------------------------------------
    if (!text || text.length === 0) {
      return { success: false, error: 'Tweet text is empty' };
    }

    if (text.length > 280) {
      return {
        success: false,
        error: `Tweet exceeds 280 characters (${text.length})`,
      };
    }

    // --- Build OAuth header and send request --------------------------------
    const authHeader = buildAuthHeader(
      'POST',
      TWITTER_TWEETS_ENDPOINT,
      consumerKey,
      consumerSecret,
      accessToken,
      accessSecret,
    );

    const response = await fetch(TWITTER_TWEETS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const body = await response.json();

    if (!response.ok) {
      const detail =
        body?.detail || body?.errors?.[0]?.message || JSON.stringify(body);
      return {
        success: false,
        error: `Twitter API ${response.status}: ${detail}`,
      };
    }

    const tweetId = body?.data?.id;
    return { success: true, tweetId };
  } catch (err: any) {
    return {
      success: false,
      error: `Twitter posting failed: ${err.message || String(err)}`,
    };
  }
}
