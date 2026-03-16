import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Test / utility endpoint for Twitter API
 * GET /api/test-tweet?secret=CRON_SECRET&action=update-profile
 *
 * DELETE THIS AFTER TESTING
 */

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function buildOAuth(method: string, url: string, extraParams: Record<string, string> = {}) {
  const consumerKey = process.env.TWITTER_API_KEY!;
  const consumerSecret = process.env.TWITTER_API_SECRET!;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN!;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET!;

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // For form-encoded POST, body params are included in signature base
  const allParams = { ...oauthParams, ...extraParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&');
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  oauthParams['oauth_signature'] = signature;

  return 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const action = searchParams.get('action') || 'test';

  if (action === 'update-profile') {
    // Update Twitter profile name + description + URL via v1.1 API
    const url = 'https://api.twitter.com/1.1/account/update_profile.json';
    const params: Record<string, string> = {
      name: 'uni-uk.ai',
      description: 'What\'s trending right now? AI-powered news on the topics everyone is searching for. Updated every 10 minutes.',
      url: 'https://uni-uk.ai',
    };

    const authHeader = buildOAuth('POST', url, params);

    const body = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await res.text();
    return NextResponse.json({
      action: 'update-profile',
      status: res.status,
      body: data,
    });
  }

  // Default: simple test tweet
  const { postTweet } = await import('@/lib/twitter');
  const result = await postTweet('Test from uni-uk.ai — auto-tweet is working!');

  return NextResponse.json({
    success: result.success,
    tweetId: result.tweetId || null,
    error: result.error || null,
  });
}
