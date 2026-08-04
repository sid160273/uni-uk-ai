import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';

// This endpoint is called by Vercel Cron every 24 hours
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

    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json(
        { error: 'Google Sheet ID not configured' },
        { status: 500 }
      );
    }

    // Initialize the GA4 client with credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: credentials,
    });

    const propertyId = process.env.GA4_PROPERTY_ID;

    // Fetch chat_message events from the last 24 hours with full message content
    const [chatMessagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '1daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' },
        { name: 'date' },
        { name: 'customEvent:message_number' },
        { name: 'customEvent:user_message' },
        { name: 'customEvent:chat_state' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'chat_message' },
        },
      },
      limit: 1000, // Increase limit to capture more conversations
    });

    // Fetch ai_response events from the last 24 hours with full AI messages
    const [aiResponsesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '1daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' },
        { name: 'date' },
        { name: 'customEvent:message_number' },
        { name: 'customEvent:ai_message' },
        { name: 'customEvent:new_state' },
        { name: 'customEvent:recommendations_count' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'ai_response' },
        },
      },
      limit: 1000, // Increase limit to capture more conversations
    });

    // Format the data with full conversation content
    const chatData = {
      timestamp: new Date().toISOString(),
      period: '24_hours',
      chat_messages: chatMessagesResponse.rows?.map((row) => ({
        event_name: row.dimensionValues?.[0]?.value,
        date: row.dimensionValues?.[1]?.value,
        message_number: row.dimensionValues?.[2]?.value,
        user_message: row.dimensionValues?.[3]?.value,
        chat_state: row.dimensionValues?.[4]?.value,
        count: row.metricValues?.[0]?.value,
      })) || [],
      ai_responses: aiResponsesResponse.rows?.map((row) => ({
        event_name: row.dimensionValues?.[0]?.value,
        date: row.dimensionValues?.[1]?.value,
        message_number: row.dimensionValues?.[2]?.value,
        ai_message: row.dimensionValues?.[3]?.value,
        new_state: row.dimensionValues?.[4]?.value,
        recommendations_count: row.dimensionValues?.[5]?.value,
        count: row.metricValues?.[0]?.value,
      })) || [],
      summary: {
        total_chat_messages: chatMessagesResponse.rows?.length || 0,
        total_ai_responses: aiResponsesResponse.rows?.length || 0,
        total_chat_message_count: chatMessagesResponse.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0,
        total_ai_response_count: aiResponsesResponse.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0,
      },
    };

    // Write to Google Sheets for historical record
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare row data for the sheet with full conversation content
    const timestamp = new Date().toISOString();
    const rows = [];

    // Add chat message data with full content
    for (const msg of chatData.chat_messages) {
      rows.push([
        timestamp,
        'USER',
        msg.date,
        msg.message_number || '',
        msg.user_message || '',
        msg.chat_state || '',
        '', // Empty for AI message column
        '', // Empty for recommendations column
      ]);
    }

    // Add AI response data with full content
    for (const resp of chatData.ai_responses) {
      rows.push([
        timestamp,
        'AI',
        resp.date,
        resp.message_number || '',
        '', // Empty for user message column
        resp.new_state || '',
        resp.ai_message || '',
        resp.recommendations_count || '',
      ]);
    }

    // Add summary row
    rows.push([
      timestamp,
      'SUMMARY',
      chatData.period,
      '',
      `Total User Messages: ${chatData.summary.total_chat_message_count}`,
      '',
      `Total AI Responses: ${chatData.summary.total_ai_response_count}`,
      '',
    ]);

    // Append data to Sheet2 (cron job backup from GA4)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet2!A:H', // Columns: Timestamp, Speaker, Date, Msg#, User Message, State, AI Message, Recommendations
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    // Return the data
    return NextResponse.json({
      success: true,
      message: 'Chat data fetched and saved to Google Sheets successfully',
      data: chatData,
      summary: chatData.summary,
      rowsAdded: rows.length,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching chat data:', details);
    return NextResponse.json(
      { error: 'Failed to fetch chat data', details },
      { status: 500 }
    );
  }
}
