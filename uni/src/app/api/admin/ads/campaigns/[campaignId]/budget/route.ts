import { NextRequest, NextResponse } from 'next/server';
import { getCustomer } from '@/lib/google-ads-client';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/audit-log';

interface RouteParams {
  params: Promise<{
    campaignId: string;
  }>;
}

/**
 * PATCH /api/admin/ads/campaigns/[campaignId]/budget
 *
 * Update the budget for a specific campaign
 *
 * Requires: Authorization header with admin token
 *
 * Body:
 * {
 *   budgetAmount: number (in GBP)
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  // Data Access Layer authentication
  const authResult = verifyAdminAuth(request);
  if (!authResult.isAuthenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: 401 }
    );
  }

  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { budgetAmount } = body;

    // Validate input
    if (!budgetAmount || budgetAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid budget amount (> 0) is required' },
        { status: 400 }
      );
    }

    const customer = getCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '');

    // First, get the campaign to find its budget resource name
    console.log(`Fetching campaign ${campaignId} details...`);

    const campaignQuery = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign_budget.resource_name,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.id = ${campaignId}
      LIMIT 1
    `);

    if (campaignQuery.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignQuery[0];
    if (!campaign.campaign_budget || !campaign.campaign_budget.amount_micros) {
      return NextResponse.json(
        { error: 'Campaign budget not found' },
        { status: 404 }
      );
    }
    const budgetResourceName = campaign.campaign_budget.resource_name;
    const oldBudget = campaign.campaign_budget.amount_micros / 1_000_000;
    const campaignName = campaign.campaign?.name || 'Unknown';

    console.log(`Updating budget from £${oldBudget} to £${budgetAmount}`);

    // Update the campaign budget using the campaignBudgets service
    // Must pass array of operations
    const updateResult = await customer.campaignBudgets.update([
      {
        resource_name: budgetResourceName,
        amount_micros: Math.round(budgetAmount * 1_000_000), // Convert GBP to micros
      }
    ]);

    console.log(`Budget updated successfully for campaign: ${campaignName}`, updateResult);

    // Log admin action for audit trail
    await logAdminAction('budget_updated', {
      campaignId,
      campaignName,
      oldBudget,
      newBudget: budgetAmount,
      budgetResourceName,
    });

    return NextResponse.json({
      success: true,
      campaignId,
      campaignName,
      oldBudget,
      newBudget: budgetAmount,
      message: `Budget updated to £${budgetAmount}`,
    });

  } catch (error: any) {
    console.error('Budget update error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error name:', error.name);
    console.error('Error constructor:', error.constructor?.name);
    console.error('Error keys:', Object.keys(error));

    // Write detailed error to file for debugging
    try {
      const fs = require('fs');
      const errorLog = {
        timestamp: new Date().toISOString(),
        campaignId: await params.then(p => p.campaignId),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          toString: error.toString(),
          ...error
        }
      };
      fs.writeFileSync('/Users/Sid12/uni/budget-error.log', JSON.stringify(errorLog, null, 2));
    } catch (logError) {
      console.error('Failed to write error log:', logError);
    }

    // Provide helpful error messages
    let errorMessage = 'Failed to update budget';
    let errorDetails = error.message || error.toString() || 'Unknown error';

    if (error.message?.includes('CAMPAIGN_BUDGET_CANNOT_BE_SHARED')) {
      errorDetails = 'This budget is shared across multiple campaigns. Update it separately.';
    } else if (error.message?.includes('INVALID_VALUE')) {
      errorDetails = 'Invalid budget value. Ensure the amount is positive and reasonable.';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorDetails = 'Permission denied. Ensure your account has permission to modify budgets.';
    } else if (error.message?.includes('is not a function')) {
      errorDetails = 'Google Ads API error: ' + error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        debugInfo: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        } : undefined,
      },
      { status: 500 }
    );
  }
}
