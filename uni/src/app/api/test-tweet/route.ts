import { NextRequest, NextResponse } from 'next/server';
import { postTweet } from '@/lib/twitter';

/**
 * Test endpoint for Twitter API
 * GET /api/test-tweet?secret=CRON_SECRET
 *
 * DELETE THIS AFTER TESTING
 */
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await postTweet('Test from uni-uk.ai — auto-tweet is working!');

  return NextResponse.json({
    success: result.success,
    tweetId: result.tweetId || null,
    error: result.error || null,
  });
}
