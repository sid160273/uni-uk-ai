import { NextRequest } from 'next/server';

/**
 * Admin Authentication Utilities
 *
 * Implements Data Access Layer (DAL) authentication following
 * 2025 Next.js security best practices.
 *
 * Per modern security guidelines, authentication is verified
 * at data access points (API routes), not just middleware.
 *
 * Environment variable required:
 * - ADMIN_SECRET_KEY (generate with: openssl rand -hex 32)
 */

export interface AdminAuthResult {
  isAuthenticated: boolean;
  error?: string;
}

/**
 * Verify admin authentication from request headers
 *
 * Checks the Authorization header for a valid admin token.
 * This function should be called at the start of every admin API route.
 *
 * @param request - NextRequest object
 * @returns AdminAuthResult indicating authentication status
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authResult = verifyAdminAuth(request);
 *   if (!authResult.isAuthenticated) {
 *     return NextResponse.json({ error: authResult.error }, { status: 401 });
 *   }
 *   // ... proceed with authenticated logic
 * }
 * ```
 */
export function verifyAdminAuth(request: NextRequest): AdminAuthResult {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_SECRET_KEY;

  // Check if admin authentication is configured
  if (!adminKey) {
    console.error('ADMIN_SECRET_KEY not configured in environment variables');
    return {
      isAuthenticated: false,
      error: 'Admin authentication not configured'
    };
  }

  // Check if authorization header is present
  if (!authHeader) {
    return {
      isAuthenticated: false,
      error: 'No authorization header provided'
    };
  }

  // Extract token (support both "Bearer TOKEN" and "TOKEN" formats)
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Verify token matches admin secret key
  if (token !== adminKey) {
    return {
      isAuthenticated: false,
      error: 'Invalid admin credentials'
    };
  }

  return { isAuthenticated: true };
}

/**
 * Session-based verification for server components
 *
 * Validates a session token (stored in client sessionStorage)
 * against the server-side admin secret key.
 *
 * @param sessionToken - Token from client session
 * @returns Promise<boolean> true if token is valid
 *
 * @example
 * ```typescript
 * const isValid = await verifyAdminSession(sessionToken);
 * if (!isValid) {
 *   redirect('/admin/login');
 * }
 * ```
 */
export async function verifyAdminSession(sessionToken: string): Promise<boolean> {
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey || !sessionToken) {
    return false;
  }

  return sessionToken === adminKey;
}

/**
 * Generate a secure admin secret key
 *
 * Use this in development to generate a new admin secret key.
 * Add the result to your .env.local file.
 *
 * @returns string - 256-bit hex-encoded random key
 *
 * @example
 * ```typescript
 * const key = generateAdminKey();
 * console.log(`ADMIN_SECRET_KEY=${key}`);
 * ```
 */
export function generateAdminKey(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use Web Crypto API
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Server-side: use Node crypto
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * Check if admin authentication is properly configured
 *
 * @returns boolean true if ADMIN_SECRET_KEY is set
 */
export function isAdminAuthConfigured(): boolean {
  return !!process.env.ADMIN_SECRET_KEY;
}
