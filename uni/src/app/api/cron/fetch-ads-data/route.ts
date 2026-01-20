import { NextRequest, NextResponse } from 'next/server';
import { getCustomer } from '@/lib/google-ads-client';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/cron/fetch-ads-data
 *
 * Automated cron job to fetch Google Ads data
 * Runs on a schedule via Vercel Cron (every 12 hours recommended)
 *
 * Requires: CRON_SECRET environment variable for authentication
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return NextResponse.json(
      { error: 'Cron authentication not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Invalid cron authentication');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[Cron] Starting Google Ads data fetch...');

    const customer = getCustomer();

    // Fetch campaigns with metrics for the last 24 hours
    const campaigns = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE
        campaign.status != 'REMOVED'
        AND segments.date = TODAY
    `);

    // Transform data
    const campaignData = campaigns.map((row: any) => ({
      id: row.campaign.id?.toString() || '',
      name: row.campaign.name || 'Unnamed Campaign',
      status: row.campaign.status || 'UNKNOWN',
      type: row.campaign.advertising_channel_type || 'UNKNOWN',
      budget: row.campaign_budget?.amount_micros
        ? row.campaign_budget.amount_micros / 1_000_000
        : 0,
      metrics: {
        impressions: row.metrics?.impressions || 0,
        clicks: row.metrics?.clicks || 0,
        cost: row.metrics?.cost_micros ? row.metrics.cost_micros / 1_000_000 : 0,
        conversions: row.metrics?.conversions || 0,
        conversionsValue: row.metrics?.conversions_value || 0,
        ctr: row.metrics?.ctr || 0,
        avgCpc: row.metrics?.average_cpc ? row.metrics.average_cpc / 1_000_000 : 0,
      },
    }));

    // Save to file storage
    const dataDir = path.join(process.cwd(), 'data', 'ads-metrics');
    await fs.mkdir(dataDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];
    const filename = `ads-data-${today}.json`;
    const filepath = path.join(dataDir, filename);

    const dataPayload = {
      timestamp: new Date().toISOString(),
      date: today,
      campaigns: campaignData,
      summary: {
        totalCampaigns: campaignData.length,
        totalSpend: campaignData.reduce((sum, c) => sum + c.metrics.cost, 0),
        totalConversions: campaignData.reduce((sum, c) => sum + c.metrics.conversions, 0),
        totalImpressions: campaignData.reduce((sum, c) => sum + c.metrics.impressions, 0),
        totalClicks: campaignData.reduce((sum, c) => sum + c.metrics.clicks, 0),
      },
    };

    await fs.writeFile(filepath, JSON.stringify(dataPayload, null, 2));

    console.log(`[Cron] Successfully saved ads data to ${filename}`);

    return NextResponse.json({
      success: true,
      message: 'Google Ads data fetched successfully',
      filename,
      campaignsCount: campaignData.length,
      summary: dataPayload.summary,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Cron] Google Ads data fetch failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Google Ads data',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
