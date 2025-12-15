# Chat Data Collection Setup Guide

This guide explains how to set up automated chat data collection from Google Analytics.

## Overview

The system automatically fetches chat_message and ai_response events from Google Analytics every 48 hours and saves them to JSON files.

## Setup Steps

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Give it a name like "GA4 Data Fetcher"
6. Click **Create and Continue**
7. Grant it the **Viewer** role
8. Click **Done**
9. Click on the created service account
10. Go to **Keys** tab
11. Click **Add Key** > **Create new key**
12. Choose **JSON** format
13. Download the JSON file (keep it safe!)

### 2. Enable Google Analytics Data API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Analytics Data API"
3. Click on it and click **Enable**

### 3. Grant Service Account Access to GA4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Admin** (bottom left)
3. In the **Property** column, click **Property Access Management**
4. Click **Add users**
5. Enter the service account email (from step 1, looks like `xxx@xxx.iam.gserviceaccount.com`)
6. Select **Viewer** role
7. Click **Add**

### 4. Get Your GA4 Property ID

1. In Google Analytics, go to **Admin**
2. In the **Property** column, click **Property Settings**
3. Copy your **Property ID** (looks like `123456789`)

### 5. Set Up Vercel Environment Variables

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** > **Environment Variables**
3. Add the following variables:

   **GA4_PROPERTY_ID**
   - Value: Your GA4 Property ID from step 4
   - Example: `123456789`

   **GOOGLE_APPLICATION_CREDENTIALS_JSON**
   - Value: Paste the ENTIRE contents of the JSON file from step 1
   - This is a long JSON object with your service account credentials
   - Make sure to paste it as one line or properly formatted JSON

   **CRON_SECRET**
   - Value: Generate a random secret (e.g., run `openssl rand -base64 32` in terminal)
   - Example: `your-random-secret-key-here`
   - This protects your cron endpoint from unauthorized access

4. Click **Save** for each variable

### 6. Deploy to Vercel

Once you push the code to your repository, Vercel will automatically deploy it with:
- The cron job configured to run every 48 hours
- The API endpoint `/api/cron/fetch-chat-data` set up
- Proper authentication using your `CRON_SECRET`

## How It Works

### Automatic Collection (Every 48 Hours)

The cron job runs automatically and:
1. Fetches all `chat_message` events from the last 48 hours
2. Fetches all `ai_response` events from the last 48 hours
3. Saves the data to `data/chat-logs/chat-data-YYYY-MM-DD.json`
4. Updates `data/chat-logs/latest.json` with the most recent data

### Data Format

Each JSON file contains:
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "period": "48_hours",
  "chat_messages": [
    {
      "date": "20250115",
      "message_number": "1",
      "user_message": "I want to study medicine",
      "chat_state": "{\"course\":\"Medicine\"}",
      "count": "1"
    }
  ],
  "ai_responses": [
    {
      "date": "20250115",
      "message_number": "1",
      "ai_message": "Great choice! Medicine is...",
      "new_state": "{\"course\":\"Medicine\"}",
      "recommendations_count": "0",
      "count": "1"
    }
  ],
  "summary": {
    "total_chat_messages": 150,
    "total_ai_responses": 150
  }
}
```

## Manual Trigger (Optional)

You can also manually trigger the data fetch by calling:
```bash
curl -X GET https://your-domain.vercel.app/api/cron/fetch-chat-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace:
- `your-domain.vercel.app` with your actual Vercel domain
- `YOUR_CRON_SECRET` with the secret you set in environment variables

## Viewing the Data

The data files are stored in `data/chat-logs/`:
- `latest.json` - Always contains the most recent fetch
- `chat-data-YYYY-MM-DD.json` - Historical data by date

You can download these files from your Vercel deployment or view them in your repository (if you choose to commit them).

## Troubleshooting

### "Google Analytics credentials not configured"
- Make sure you've added all three environment variables in Vercel
- Redeploy your application after adding them

### "Unauthorized" error
- Check that your `CRON_SECRET` is set correctly
- Verify you're using the correct secret in your request header

### No data returned
- Verify that events are being logged to Google Analytics (check in GA4 interface)
- Wait 24-48 hours after deploying for data to accumulate
- Check that the service account has Viewer permissions in GA4

### API errors
- Ensure the Google Analytics Data API is enabled in Google Cloud
- Verify the service account JSON is valid
- Check that the Property ID is correct

## Security Notes

- Never commit the service account JSON file to your repository
- Keep your `CRON_SECRET` secure and don't share it
- The cron endpoint is protected and only accessible with the correct secret
- Chat data files are excluded from git (see .gitignore)

## Next Steps

After setup, you can:
- View chat logs in the `data/chat-logs` directory
- Analyze conversation patterns
- Export data for further analysis
- Set up alerts based on chat volume
- Create dashboards from the JSON data
