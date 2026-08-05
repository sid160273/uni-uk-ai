import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * Enforces the Clearing adviser transcript retention period published in our
 * privacy policy (section 8).
 *
 * Deletes rows from the chat log sheets whose timestamp is older than
 * RETENTION_MONTHS. Without this the policy would be promising a deletion that
 * never happens — if you change the retention period here, change section 8 of
 * src/app/privacy/page.tsx to match, and vice versa.
 *
 * Column A of each sheet is an ISO timestamp written by /api/log-chat. Rows
 * whose column A does not parse as a date (a header row, say) are left alone.
 */

/** Must match the retention period stated in the privacy policy. */
const RETENTION_MONTHS = 12;

/** Sheets written by /api/log-chat (real-time) and /api/cron/fetch-chat-data. */
const CHAT_SHEETS = ['Sheet1', 'Sheet2'] as const;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      !process.env.GOOGLE_SHEET_ID ||
      !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ) {
      return NextResponse.json(
        { success: false, error: 'Sheets not configured' },
        { status: 200 }
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

    // Map sheet titles to the numeric IDs that batchUpdate requires.
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetIds = new Map<string, number>();
    for (const sheet of meta.data.sheets ?? []) {
      const title = sheet.properties?.title;
      const id = sheet.properties?.sheetId;
      if (title && typeof id === 'number') sheetIds.set(title, id);
    }

    const report: Record<string, number | string> = {};

    for (const title of CHAT_SHEETS) {
      const sheetId = sheetIds.get(title);
      if (sheetId === undefined) {
        report[title] = 'sheet not found';
        continue;
      }

      // Only column A is needed to decide what expires.
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${title}!A:A`,
      });
      const rows = res.data.values ?? [];

      const expiredIndices: number[] = [];
      rows.forEach((row, index) => {
        const raw = row?.[0];
        if (!raw) return;
        const when = new Date(raw);
        if (isNaN(when.getTime())) return; // header or malformed — leave it
        if (when < cutoff) expiredIndices.push(index);
      });

      if (expiredIndices.length === 0) {
        report[title] = 0;
        continue;
      }

      // Collapse to contiguous ranges and delete bottom-up, so that earlier
      // deletions do not shift the indices of rows still to be removed.
      const ranges: Array<{ start: number; end: number }> = [];
      for (const index of expiredIndices) {
        const last = ranges[ranges.length - 1];
        if (last && index === last.end) last.end = index + 1;
        else ranges.push({ start: index, end: index + 1 });
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: ranges
            .slice()
            .reverse()
            .map(({ start, end }) => ({
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: start,
                  endIndex: end,
                },
              },
            })),
        },
      });

      report[title] = expiredIndices.length;
      console.log(
        `[Purge] ${title}: deleted ${expiredIndices.length} rows older than ${cutoff.toISOString()}`
      );
    }

    return NextResponse.json({
      success: true,
      retentionMonths: RETENTION_MONTHS,
      cutoff: cutoff.toISOString(),
      deleted: report,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error purging chat logs:', details);
    return NextResponse.json(
      { error: 'Failed to purge chat logs', details },
      { status: 500 }
    );
  }
}
