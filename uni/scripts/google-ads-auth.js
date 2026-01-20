const { GoogleAdsApi } = require('google-ads-api');
const readline = require('readline');

/**
 * Google Ads API OAuth 2.0 Setup Script
 *
 * This script generates a refresh token for Google Ads API access.
 * Run this ONCE to obtain your refresh token, then store it in .env.local
 *
 * Prerequisites:
 * 1. Google Cloud project with Google Ads API enabled
 * 2. OAuth 2.0 credentials (Desktop App type)
 * 3. Google Ads Developer Token
 *
 * Usage:
 *   node scripts/google-ads-auth.js
 */

async function generateRefreshToken() {
  console.log('=== Google Ads API OAuth Setup ===\n');

  // Prompt for credentials
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  try {
    const clientId = await question('Enter your OAuth Client ID: ');
    const clientSecret = await question('Enter your OAuth Client Secret: ');
    const developerToken = await question('Enter your Developer Token: ');

    console.log('\nInitializing Google Ads API client...\n');

    const client = new GoogleAdsApi({
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      developer_token: developerToken.trim(),
    });

    // Generate authorization URL
    const authUrl = client.getAuthUrl();

    console.log('==============================================');
    console.log('STEP 1: Visit this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n==============================================');
    console.log('STEP 2: Authorize the application');
    console.log('STEP 3: Copy the authorization code from the redirect URL\n');

    const authCode = await question('Enter the authorization code: ');

    console.log('\nExchanging authorization code for refresh token...\n');

    // Exchange auth code for refresh token
    const tokens = await client.getRefreshToken(authCode.trim());

    console.log('==============================================');
    console.log('SUCCESS! Your refresh token:\n');
    console.log(tokens.refresh_token);
    console.log('\n==============================================');
    console.log('\nAdd this to your .env.local file:\n');
    console.log(`GOOGLE_ADS_CLIENT_ID=${clientId.trim()}`);
    console.log(`GOOGLE_ADS_CLIENT_SECRET=${clientSecret.trim()}`);
    console.log(`GOOGLE_ADS_DEVELOPER_TOKEN=${developerToken.trim()}`);
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_ADS_CUSTOMER_ID=YOUR_CUSTOMER_ID_HERE`);
    console.log(`ADMIN_SECRET_KEY=YOUR_ADMIN_SECRET_KEY_HERE`);
    console.log('\n==============================================\n');

  } catch (error) {
    console.error('\nError during OAuth setup:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

// Run the setup
generateRefreshToken().catch(console.error);
