import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// This endpoint is called by Vercel Cron every 48 hours
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if GA credentials are configured
    if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return NextResponse.json(
        { error: 'Google Analytics credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize the GA4 client with credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials,
    });

    const propertyId = process.env.GA4_PROPERTY_ID;

    // Fetch chat_message events from the last 48 hours
    const [chatMessagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '2daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' },
        { name: 'date' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'chat_message' },
        },
      },
    });

    // Fetch ai_response events from the last 48 hours
    const [aiResponsesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '2daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' },
        { name: 'date' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'ai_response' },
        },
      },
    });

    // Format the data
    const chatData = {
      timestamp: new Date().toISOString(),
      period: '48_hours',
      chat_messages: chatMessagesResponse.rows?.map((row) => ({
        event_name: row.dimensionValues?.[0]?.value,
        date: row.dimensionValues?.[1]?.value,
        count: row.metricValues?.[0]?.value,
      })) || [],
      ai_responses: aiResponsesResponse.rows?.map((row) => ({
        event_name: row.dimensionValues?.[0]?.value,
        date: row.dimensionValues?.[1]?.value,
        count: row.metricValues?.[0]?.value,
      })) || [],
      summary: {
        total_chat_messages: chatMessagesResponse.rows?.length || 0,
        total_ai_responses: aiResponsesResponse.rows?.length || 0,
        total_chat_message_count: chatMessagesResponse.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0,
        total_ai_response_count: aiResponsesResponse.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0,
      },
    };

    // Return the data (Vercel serverless functions have read-only filesystem)
    // In the future, this data could be sent to a database or external storage
    return NextResponse.json({
      success: true,
      message: 'Chat data fetched successfully',
      data: chatData,
      summary: chatData.summary,
    });
  } catch (error: any) {
    console.error('Error fetching chat data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat data', details: error.message },
      { status: 500 }
    );
  }
}
