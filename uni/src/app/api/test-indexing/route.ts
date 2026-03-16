import { NextRequest, NextResponse } from 'next/server';
import { notifyGoogleIndexing } from '@/lib/google-indexing';

/**
 * Test endpoint for Google Indexing API
 * GET /api/test-indexing?secret=CRON_SECRET
 *
 * DELETE THIS AFTER TESTING
 */
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testUrl = 'https://uni-uk.ai';

  console.log('[Test Indexing] Testing Google Indexing API...');
  const result = await notifyGoogleIndexing(testUrl);

  return NextResponse.json({
    test: 'Google Indexing API',
    url: testUrl,
    success: result.success,
    error: result.error || null,
    message: result.success
      ? 'Indexing API is working! Google has been notified.'
      : 'Indexing API failed — check the error above.',
  });
}
