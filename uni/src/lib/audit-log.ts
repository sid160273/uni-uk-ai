import fs from 'fs/promises';
import path from 'path';

/**
 * Audit Logging System
 *
 * Tracks all admin actions for security and compliance.
 * Logs are stored as daily JSON files in /data/audit-logs/
 *
 * Each log entry includes:
 * - timestamp (ISO 8601)
 * - userId (default: 'admin')
 * - action (descriptive string)
 * - details (arbitrary JSON data)
 */

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  details: Record<string, any>;
}

/**
 * Log an admin action to the audit trail
 *
 * @param action - Description of the action (e.g., "campaign_created")
 * @param details - Additional details about the action
 * @param userId - User identifier (default: 'admin')
 *
 * @example
 * ```typescript
 * await logAdminAction('campaign_created', {
 *   campaignId: '12345',
 *   campaignName: 'Summer Sale 2025',
 *   budget: 100.00
 * });
 * ```
 */
export async function logAdminAction(
  action: string,
  details: Record<string, any>,
  userId: string = 'admin'
): Promise<void> {
  try {
    const logEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
    };

    // Ensure audit logs directory exists
    const logDir = path.join(process.cwd(), 'data', 'audit-logs');
    await fs.mkdir(logDir, { recursive: true });

    // Generate daily log filename
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `admin-${date}.json`);

    // Read existing logs for today (if any)
    let logs: AuditLogEntry[] = [];
    try {
      const existing = await fs.readFile(logFile, 'utf-8');
      logs = JSON.parse(existing);
    } catch {
      // File doesn't exist yet, start with empty array
    }

    // Append new log entry
    logs.push(logEntry);

    // Write updated logs back to file
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

    // Also update "latest" log file for easy access
    const latestFile = path.join(logDir, 'admin-latest.json');
    await fs.writeFile(latestFile, JSON.stringify(logEntry, null, 2));

  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging failures shouldn't break the app
  }
}

/**
 * Retrieve audit logs for a specific date
 *
 * @param date - Date string in YYYY-MM-DD format (default: today)
 * @returns Promise<AuditLogEntry[]> Array of log entries
 *
 * @example
 * ```typescript
 * const logs = await getAuditLogs('2025-01-15');
 * console.log(`Found ${logs.length} actions on that date`);
 * ```
 */
export async function getAuditLogs(date?: string): Promise<AuditLogEntry[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(
      process.cwd(),
      'data',
      'audit-logs',
      `admin-${targetDate}.json`
    );

    const content = await fs.readFile(logFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    // No logs for this date
    return [];
  }
}

/**
 * Retrieve the most recent audit log entry
 *
 * @returns Promise<AuditLogEntry | null>
 *
 * @example
 * ```typescript
 * const lastAction = await getLatestAuditLog();
 * if (lastAction) {
 *   console.log(`Last action: ${lastAction.action} at ${lastAction.timestamp}`);
 * }
 * ```
 */
export async function getLatestAuditLog(): Promise<AuditLogEntry | null> {
  try {
    const latestFile = path.join(
      process.cwd(),
      'data',
      'audit-logs',
      'admin-latest.json'
    );

    const content = await fs.readFile(latestFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Get a summary of audit log activity
 *
 * @param daysBack - Number of days to look back (default: 7)
 * @returns Promise<{totalActions: number, actionsByType: Record<string, number>}>
 *
 * @example
 * ```typescript
 * const summary = await getAuditLogSummary(30);
 * console.log(`${summary.totalActions} actions in last 30 days`);
 * console.log('Breakdown:', summary.actionsByType);
 * ```
 */
export async function getAuditLogSummary(daysBack: number = 7): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
}> {
  const actionsByType: Record<string, number> = {};
  let totalActions = 0;

  const today = new Date();

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const logs = await getAuditLogs(dateStr);

    logs.forEach(log => {
      totalActions++;
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });
  }

  return { totalActions, actionsByType };
}
