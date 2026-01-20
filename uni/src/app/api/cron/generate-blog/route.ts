import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { fetchAllNews } from '@/lib/news-sources';
import {
  generateBlogPost,
  validateBlogPost,
  selectBestTopic,
  GeneratedBlogPost,
} from '@/lib/blog-generator';
import { slugExists } from '@/lib/blog-data';

const ALERT_EMAIL = 'sidspace.info@gmail.com';

/**
 * Automated Blog Generation Cron Endpoint
 * Runs every 6 hours to generate SEO-optimized blog posts about UK higher education
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check required environment variables
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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Step 1: Fetch news from RSS feeds
    console.log('Fetching news from RSS feeds...');
    const newsItems = await fetchAllNews();

    if (newsItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No relevant news items found',
        duration: Date.now() - startTime,
      });
    }

    console.log(`Found ${newsItems.length} relevant news items`);

    // Step 2: Select the best topic
    console.log('Selecting best topic...');
    const selectedNews = await selectBestTopic(newsItems, openai);

    if (!selectedNews) {
      return NextResponse.json({
        success: false,
        message: 'Failed to select a topic',
        duration: Date.now() - startTime,
      });
    }

    console.log(`Selected topic: "${selectedNews.title}"`);

    // Step 3: Generate the blog post
    console.log('Generating blog post...');
    const blogPost = await generateBlogPost(selectedNews, openai);

    if (!blogPost) {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate blog post',
        selectedTopic: selectedNews.title,
        duration: Date.now() - startTime,
      });
    }

    // Step 4: Validate the blog post
    console.log('Validating blog post...');
    const validation = validateBlogPost(blogPost);

    if (!validation.valid) {
      console.warn('Validation errors:', validation.errors);
      // Continue anyway but log the issues
    }

    // Step 5: Check if slug already exists
    const existingSlug = await slugExists(blogPost.slug);
    if (existingSlug) {
      // Append timestamp to make slug unique
      blogPost.slug = `${blogPost.slug}-${Date.now()}`;
    }

    // Step 6: Save to Google Sheets
    console.log('Saving to Google Sheets...');
    const saved = await saveBlogPostToSheets(blogPost);

    if (!saved) {
      return NextResponse.json({
        success: false,
        message: 'Failed to save blog post to Google Sheets',
        blogPost: {
          slug: blogPost.slug,
          title: blogPost.title,
        },
        duration: Date.now() - startTime,
      });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Blog post generated and saved successfully',
      blogPost: {
        slug: blogPost.slug,
        title: blogPost.title,
        category: blogPost.category,
        excerpt: blogPost.excerpt,
        readingTime: blogPost.readingTime,
        wordCount: blogPost.content.split(/\s+/).length,
      },
      newsSource: {
        title: selectedNews.title,
        source: selectedNews.source,
        link: selectedNews.link,
      },
      validation: {
        valid: validation.valid,
        errors: validation.errors,
      },
      newsItemsConsidered: newsItems.length,
      duration: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('Error in blog generation cron:', error);

    // Send failure notification email
    await sendFailureEmail('Blog Generation Error', error.message);

    return NextResponse.json(
      {
        error: 'Failed to generate blog post',
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
        <h2>Blog Generation Cron Failed</h2>
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
 * Saves a blog post to Google Sheets
 */
async function saveBlogPostToSheets(post: GeneratedBlogPost): Promise<boolean> {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the row data
    // Columns: A=slug, B=title, C=excerpt, D=content, E=author, F=publishedAt,
    //          G=updatedAt, H=imageUrl, I=category, J=tags, K=readingTime,
    //          L=newsSource, M=status
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

    // Append to BlogPosts sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'BlogPosts!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log(`Blog post saved: ${post.slug}`);
    return true;
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return false;
  }
}
