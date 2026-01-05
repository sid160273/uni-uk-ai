import { NextRequest, NextResponse } from 'next/server';
import { getCustomer } from '@/lib/google-ads-client';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit-log';

/**
 * POST /api/admin/ads/campaigns/create
 *
 * Create a new Google Ads campaign with budget
 * Campaign starts in PAUSED status for safety
 *
 * Requires: Authorization header with admin token
 *
 * Body:
 * {
 *   campaignName: string,
 *   budgetAmount: number (in GBP),
 *   targetLocation?: string,
 *   advertisingChannelType?: 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'SHOPPING'
 * }
 */
export async function POST(request: NextRequest) {
  // Data Access Layer authentication
  const authResult = verifyAdminAuth(request);
  if (!authResult.isAuthenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      campaignName,
      budgetAmount,
      targetLocation,
      advertisingChannelType = 'SEARCH'
    } = body;

    // Validate required fields
    if (!campaignName || !budgetAmount) {
      return NextResponse.json(
        { error: 'Campaign name and budget amount are required' },
        { status: 400 }
      );
    }

    if (budgetAmount <= 0) {
      return NextResponse.json(
        { error: 'Budget amount must be greater than 0' },
        { status: 400 }
      );
    }

    const customer = getCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '');

    // Step 1: Create campaign budget
    console.log(`Creating budget: £${budgetAmount} for campaign "${campaignName}"`);

    const budgetOperation = {
      campaign_budget: {
        name: `Budget for ${campaignName}`,
        amount_micros: Math.round(budgetAmount * 1_000_000), // Convert GBP to micros
        delivery_method: 'STANDARD', // Spread budget evenly throughout the day
      },
    };

    // @ts-ignore - Google Ads SDK type mismatch
    const budgetResult = await customer.campaignBudgets.create([budgetOperation]);
    const budgetResourceName = budgetResult.results[0].resource_name;

    console.log(`Budget created: ${budgetResourceName}`);

    // Step 2: Create campaign
    console.log(`Creating campaign: "${campaignName}"`);

    const campaignOperation = {
      campaign: {
        name: campaignName,
        status: 'PAUSED', // Start paused for safety - admin can enable manually
        advertising_channel_type: advertisingChannelType,
        campaign_budget: budgetResourceName,
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: advertisingChannelType === 'DISPLAY',
        },
        // Default bidding strategy: Maximize clicks
        bidding_strategy_type: 'MAXIMIZE_CLICKS',
      },
    };

    // @ts-ignore - Google Ads SDK type mismatch
    const campaignResult = await customer.campaigns.create([campaignOperation]);
    const campaignResourceName = campaignResult.results[0].resource_name;
    const campaignId = campaignResourceName?.split('/').pop();

    console.log(`Campaign created: ${campaignResourceName}`);

    // Log admin action for audit trail
    await logAdminAction('campaign_created', {
      campaignId,
      campaignName,
      budgetAmount,
      advertisingChannelType,
      targetLocation,
      status: 'PAUSED',
    });

    return NextResponse.json({
      success: true,
      campaignId,
      campaignResourceName,
      budgetResourceName,
      message: `Campaign "${campaignName}" created successfully (status: PAUSED)`,
      note: 'Campaign is paused. Enable it in the dashboard to start serving ads.',
    });

  } catch (error: any) {
    console.error('Campaign creation error:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to create campaign';
    let errorDetails = error.message;

    if (error.message?.includes('DUPLICATE_CAMPAIGN_NAME')) {
      errorDetails = 'A campaign with this name already exists. Please use a different name.';
    } else if (error.message?.includes('INVALID_BUDGET')) {
      errorDetails = 'Invalid budget amount. Please check the value and try again.';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorDetails = 'Permission denied. Ensure your Google Ads account has permission to create campaigns.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
