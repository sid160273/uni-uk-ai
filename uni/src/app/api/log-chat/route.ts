import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// This endpoint logs full chat messages directly to Google Sheets in real-time
// Bypasses GA4's 500 character limit
export async function POST(request: NextRequest) {
  try {
    const { messageType, messageNumber, userMessage, aiMessage, chatState, recommendationsCount } = await request.json();

    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Silently fail - don't block the chat if sheets aren't configured
      return NextResponse.json({ success: false, error: 'Sheets not configured' }, { status: 200 });
    }

    // Initialize Google Sheets client
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare row data
    const timestamp = new Date().toISOString();
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

    const row = [
      timestamp,
      messageType, // 'USER' or 'AI'
      date,
      messageNumber || '',
      messageType === 'USER' ? userMessage || '' : '', // User message column
      chatState ? JSON.stringify(chatState) : '', // Chat state
      messageType === 'AI' ? aiMessage || '' : '', // AI message column
      recommendationsCount || '',
    ];

    // Append to Sheet (real-time logging)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error logging to sheets:', details);
    // Return success even on error to not block the chat
    return NextResponse.json({ success: false, error: details }, { status: 200 });
  }
}
