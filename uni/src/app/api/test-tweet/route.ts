import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Test endpoint for Twitter API — with full diagnostics
 * GET /api/test-tweet?secret=CRON_SECRET
 *
 * DELETE THIS AFTER TESTING
 */
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check which env vars are present
  const envCheck = {
    TWITTER_API_KEY: process.env.TWITTER_API_KEY ? `${process.env.TWITTER_API_KEY.slice(0, 5)}...${process.env.TWITTER_API_KEY.slice(-3)} (${process.env.TWITTER_API_KEY.length} chars)` : 'MISSING',
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET ? `${process.env.TWITTER_API_SECRET.slice(0, 5)}...${process.env.TWITTER_API_SECRET.slice(-3)} (${process.env.TWITTER_API_SECRET.length} chars)` : 'MISSING',
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN ? `${process.env.TWITTER_ACCESS_TOKEN.slice(0, 5)}...${process.env.TWITTER_ACCESS_TOKEN.slice(-3)} (${process.env.TWITTER_ACCESS_TOKEN.length} chars)` : 'MISSING',
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET ? `${process.env.TWITTER_ACCESS_SECRET.slice(0, 5)}...${process.env.TWITTER_ACCESS_SECRET.slice(-3)} (${process.env.TWITTER_ACCESS_SECRET.length} chars)` : 'MISSING',
  };

  const consumerKey = process.env.TWITTER_API_KEY!;
  const consumerSecret = process.env.TWITTER_API_SECRET!;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN!;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET!;

  if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
    return NextResponse.json({ error: 'Missing credentials', envCheck });
  }

  // Build OAuth 1.0a manually with full debug output
  const method = 'POST';
  const url = 'https://api.twitter.com/2/tweets';
  const tweetText = 'Test from uni-uk.ai — please ignore';

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // Percent encode helper
  const pctEnc = (s: string) =>
    encodeURIComponent(s)
      .replace(/!/g, '%21')
      .replace(/\*/g, '%2A')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');

  // Build signature base string
  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map(k => `${pctEnc(k)}=${pctEnc(oauthParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), pctEnc(url), pctEnc(sortedParams)].join('&');
  const signingKey = `${pctEnc(consumerSecret)}&${pctEnc(accessSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  oauthParams['oauth_signature'] = signature;

  const authHeader =
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map(k => `${pctEnc(k)}="${pctEnc(oauthParams[k])}"`)
      .join(', ');

  // Make the actual request
  let rawBody = '';
  let statusCode = 0;
  let responseHeaders: Record<string, string> = {};

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    statusCode = res.status;
    res.headers.forEach((v, k) => { responseHeaders[k] = v; });
    rawBody = await res.text();
  } catch (err: any) {
    rawBody = `Fetch error: ${err.message}`;
  }

  return NextResponse.json({
    envCheck,
    oauthDebug: {
      timestamp: oauthParams['oauth_timestamp'],
      nonce: oauthParams['oauth_nonce'],
      baseStringPreview: baseString.slice(0, 200) + '...',
    },
    twitterResponse: {
      status: statusCode,
      body: rawBody,
      headers: responseHeaders,
    },
  });
}
