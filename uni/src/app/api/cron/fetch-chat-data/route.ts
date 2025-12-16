import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';

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

    // Write to Google Sheets for historical record
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare row data for the sheet
    const timestamp = new Date().toISOString();
    const rows = [];

    // Add chat message data
    for (const msg of chatData.chat_messages) {
      rows.push([
        timestamp,
        'chat_message',
        msg.date,
        msg.count,
      ]);
    }

    // Add AI response data
    for (const resp of chatData.ai_responses) {
      rows.push([
        timestamp,
        'ai_response',
        resp.date,
        resp.count,
      ]);
    }

    // Add summary row
    rows.push([
      timestamp,
      'SUMMARY',
      chatData.period,
      `Total Messages: ${chatData.summary.total_chat_message_count}, Total Responses: ${chatData.summary.total_ai_response_count}`,
    ]);

    // Append data to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:D', // Columns: Timestamp, Event Type, Date, Count
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
  } catch (error: any) {
    console.error('Error fetching chat data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat data', details: error.message },
      { status: 500 }
    );
  }
}
