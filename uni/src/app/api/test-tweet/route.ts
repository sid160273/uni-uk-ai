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

  const tweetText = `🔴 TRENDING NOW: What's everyone searching for today?\n\nFind out at https://uni-uk.ai\n\n#TrendingNews #WhatsHappening`;

  console.log('[Test Tweet] Sending test tweet...');
  const result = await postTweet(tweetText);

  return NextResponse.json({
    test: 'Twitter API',
    success: result.success,
    tweetId: result.tweetId || null,
    error: result.error || null,
  });
}
