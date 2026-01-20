import { GoogleAdsApi, Customer } from 'google-ads-api';

/**
 * Google Ads API Client Singleton
 *
 * Manages a single instance of the Google Ads API client
 * and provides customer access with authentication.
 *
 * Environment variables required:
 * - GOOGLE_ADS_CLIENT_ID
 * - GOOGLE_ADS_CLIENT_SECRET
 * - GOOGLE_ADS_DEVELOPER_TOKEN
 * - GOOGLE_ADS_REFRESH_TOKEN
 * - GOOGLE_ADS_CUSTOMER_ID
 * - GOOGLE_ADS_LOGIN_CUSTOMER_ID (optional, for manager accounts)
 */

let adsClient: GoogleAdsApi | null = null;

/**
 * Get or create the Google Ads API client singleton
 * @returns GoogleAdsApi instance
 * @throws Error if credentials are not configured
 */
export function getGoogleAdsClient(): GoogleAdsApi {
  if (!adsClient) {
    // Validate required environment variables
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!clientId || !clientSecret || !developerToken) {
      throw new Error(
        'Google Ads API credentials not configured. ' +
        'Please set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN in .env.local'
      );
    }

    // Initialize the Google Ads API client
    adsClient = new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: developerToken,
    });
  }

  return adsClient;
}

/**
 * Get an authenticated customer instance
 * @returns Customer instance ready for API queries
 * @throws Error if customer credentials are not configured
 */
export function getCustomer(): Customer {
  const client = getGoogleAdsClient();

  // Validate customer-specific environment variables
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!customerId || !refreshToken) {
    throw new Error(
      'Google Ads customer credentials not configured. ' +
      'Please set GOOGLE_ADS_CUSTOMER_ID and GOOGLE_ADS_REFRESH_TOKEN in .env.local'
    );
  }

  // Remove hyphens from customer ID (Google Ads API expects format without hyphens)
  const cleanCustomerId = customerId.replace(/-/g, '');

  // Optional: login_customer_id for manager accounts
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const cleanLoginCustomerId = loginCustomerId?.replace(/-/g, '');

  return client.Customer({
    customer_id: cleanCustomerId,
    refresh_token: refreshToken,
    login_customer_id: cleanLoginCustomerId,
  });
}

/**
 * Test the Google Ads API connection
 * @returns Promise<boolean> true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const customer = getCustomer();

    // Simple query to test connection
    await customer.query(`
      SELECT customer.id, customer.descriptive_name
      FROM customer
      LIMIT 1
    `);

    return true;
  } catch (error) {
    console.error('Google Ads API connection test failed:', error);
    return false;
  }
}
