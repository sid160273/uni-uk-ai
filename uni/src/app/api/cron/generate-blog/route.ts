import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { fetchMultiRegionNews } from '@/lib/news-sources';
import {
  generateBlogPost,
  validateBlogPost,
  GeneratedBlogPost,
} from '@/lib/blog-generator';
import { slugExists, getAllBlogPostsCombined } from '@/lib/blog-data';
import { notifyNewBlogPost } from '@/lib/google-indexing';

const ALERT_EMAIL = 'sidspace.info@gmail.com';

/**
 * Trending Stories Cron Endpoint
 * Runs every 30 minutes to generate stories about top trending topics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json(
        { error: 'Google Sheets credentials not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Step 1: Fetch trending topics from Google Trends (multiple countries)
    console.log('Fetching trending topics from Google Trends (multi-region)...');
    const trendingTopics = await fetchMultiRegionNews();

    if (trendingTopics.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No trending topics found',
        duration: Date.now() - startTime,
      });
    }

    console.log(`Found ${trendingTopics.length} trending topics`);

    // Step 2: Filter out topics we already have stories for
    // Check by matching the trending topic keyword against existing story titles/slugs
    let existingPosts: any[] = [];
    try {
      existingPosts = await getAllBlogPostsCombined();
    } catch (error) {
      console.error('Error fetching existing posts:', error);
    }

    // Only deduplicate against posts from the last 48 hours — a topic can re-trend and deserve a new story
    const DEDUP_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours
    const now = Date.now();
    const recentPosts = existingPosts.filter(post => {
      const postTime = new Date(post.publishedAt).getTime();
      return now - postTime < DEDUP_WINDOW_MS;
    });

    console.log(`Dedup window: checking against ${recentPosts.length} posts from last 48h (of ${existingPosts.length} total)`);

    const newTopics = [];
    for (const topic of trendingTopics) {
      const topicLower = topic.title.toLowerCase();
      // Keep words with 2+ characters to catch short but meaningful terms like "UFC", "NBA", "EV"
      const topicWords = topicLower.split(/\s+/).filter(w => w.length > 1);

      // Check if any RECENT post title contains the main keywords of this topic
      const alreadyCovered = recentPosts.some(post => {
        const postTitle = post.title.toLowerCase();
        const postSlug = post.slug.toLowerCase();
        const combined = `${postTitle} ${postSlug}`;

        const matchCount = topicWords.filter(word => combined.includes(word)).length;

        if (topicWords.length <= 2) {
          // Short topics: ALL words must match AND title lengths must be similar (within 2x)
          // Prevents "Trump" matching "Trump Trade War Analysis"
          const topicLen = topicWords.join(' ').length;
          const postTitleLen = postTitle.length;
          const lengthRatio = Math.max(topicLen, postTitleLen) / Math.max(1, Math.min(topicLen, postTitleLen));
          return matchCount >= topicWords.length && lengthRatio <= 2;
        } else {
          // Longer topics: 70% of words must match (raised from 50%)
          const threshold = Math.ceil(topicWords.length * 0.7);
          return matchCount >= threshold;
        }
      });

      if (!alreadyCovered) {
        newTopics.push(topic);
      } else {
        console.log(`Skipping "${topic.title}" — already covered in last 48h`);
      }
    }

    if (newTopics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All trending topics already have stories',
        topicsChecked: trendingTopics.length,
        duration: Date.now() - startTime,
      });
    }

    console.log(`${newTopics.length} new topics to generate stories for`);

    // Step 3: Generate stories for new topics (max 5 per cycle — Vercel Pro 60s timeout is plenty for parallel OpenAI calls)
    const topicsToProcess = newTopics.slice(0, 5);
    const results = await Promise.allSettled(
      topicsToProcess.map(topic => generateBlogPost(topic, openai))
    );

    const generatedStories: GeneratedBlogPost[] = [];
    const failures: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        generatedStories.push(result.value);
      } else {
        const reason = result.status === 'rejected' ? result.reason?.message : 'Generation returned null';
        failures.push(`"${topicsToProcess[index].title}": ${reason}`);
      }
    });

    // Step 4: Validate and save stories to Google Sheets
    let savedCount = 0;
    for (const story of generatedStories) {
      const validation = validateBlogPost(story);
      if (!validation.valid) {
        console.warn(`Validation warnings for "${story.title}":`, validation.errors);
      }

      // Ensure unique slug
      const existingSlug = await slugExists(story.slug);
      if (existingSlug) {
        story.slug = `${story.slug}-${Date.now()}`;
      }

      const saved = await saveBlogPostToSheets(story);
      if (saved) {
        savedCount++;
        console.log(`Saved story: "${story.title}"`);

        // Ping Google Indexing API so the new post gets indexed quickly
        try {
          const indexingResults = await notifyNewBlogPost(story.slug);
          const successCount = indexingResults.filter(r => r.success).length;
          console.log(`[Indexing] Submitted ${successCount}/${indexingResults.length} URLs for "${story.slug}"`);
        } catch (indexError: any) {
          // Never let indexing failures break the cron
          console.error(`[Indexing] Failed for "${story.slug}":`, indexError.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${savedCount} trending stories`,
      trendingTopics: trendingTopics.length,
      newTopics: newTopics.length,
      generated: generatedStories.length,
      saved: savedCount,
      failures: failures.length > 0 ? failures : undefined,
      stories: generatedStories.map(s => ({
        slug: s.slug,
        title: s.title,
        category: s.category,
      })),
      duration: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Error in trending story generation cron:', error);
    await sendFailureEmail('Trending Story Generation Error', error.message);

    return NextResponse.json(
      {
        error: 'Failed to generate trending stories',
        details: error.message,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Sends a failure notification email
 */
async function sendFailureEmail(subject: string, errorDetails: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'uni-uk.ai <onboarding@resend.dev>',
      to: ALERT_EMAIL,
      subject: `[uni-uk.ai] Cron Failed: ${subject}`,
      html: `
        <h2>Trending Story Cron Failed</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Error:</strong></p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${errorDetails}</pre>
        <p>Check the Vercel logs for more details.</p>
      `,
    });

    console.log('Failure notification email sent');
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
  }
}

/**
 * Saves a story to Google Sheets
 */
async function saveBlogPostToSheets(post: GeneratedBlogPost): Promise<boolean> {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      post.slug,
      post.title,
      post.excerpt,
      post.content,
      post.author,
      post.publishedAt,
      post.updatedAt,
      post.imageUrl,
      post.category,
      JSON.stringify(post.tags),
      post.readingTime.toString(),
      post.newsSource,
      post.status,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'BlogPosts!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log(`Story saved: ${post.slug}`);
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return false;
  }
}
