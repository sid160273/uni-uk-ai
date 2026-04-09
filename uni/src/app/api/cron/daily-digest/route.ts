import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAllBlogPostsCombined } from '@/lib/blog-data';

/**
 * Daily Digest Cron
 * Runs at 7am UK time, sends top stories from the last 24 hours
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron auth
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get stories from the last 24 hours
    const allPosts = await getAllBlogPostsCombined();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentStories = allPosts.filter(post => {
      const postDate = new Date(post.publishedAt);
      return postDate >= yesterday;
    });

    // Take top 8 stories
    const topStories = recentStories.slice(0, 8);

    if (topStories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories from the last 24h — skipping digest',
        duration: Date.now() - startTime,
      });
    }

    // Build the email HTML
    const emailHtml = buildDigestEmail(topStories, now);

    // Format date for subject
    const dateStr = now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    // Send broadcast to all subscribers
    const { data, error } = await resend.broadcasts.create({
      audienceId,
      from: 'uni-uk.ai Daily <digest@uni-uk.ai>',
      subject: `What's Trending — ${dateStr}`,
      html: emailHtml,
      name: `Daily Digest ${now.toISOString().split('T')[0]}`,
    });

    if (error) {
      console.error('Broadcast create error:', error);
      return NextResponse.json(
        { error: 'Failed to create broadcast', details: error.message },
        { status: 500 }
      );
    }

    // Send the broadcast
    const sendResult = await resend.broadcasts.send(data!.id);

    if (sendResult.error) {
      console.error('Broadcast send error:', sendResult.error);
      return NextResponse.json(
        { error: 'Failed to send broadcast', details: sendResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Daily digest sent with ${topStories.length} stories`,
      broadcastId: data!.id,
      stories: topStories.length,
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Daily digest error:', error);
    return NextResponse.json(
      { error: 'Failed to send daily digest', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Builds the HTML email for the daily digest
 */
function buildDigestEmail(stories: any[], date: Date): string {
  const dateStr = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const storyBlocks = stories.map((story, i) => {
    const categoryColor = '#e11d48';
    const storyUrl = `https://uni-uk.ai/blog/${story.slug}`;
    const imageBlock = story.imageUrl?.startsWith('http')
      ? `<a href="${storyUrl}" style="text-decoration:none;">
           <img src="${story.imageUrl}" alt="${story.title}" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin-bottom:12px;" />
         </a>`
      : '';

    return `
      <tr>
        <td style="padding:${i === 0 ? '0' : '24px'} 0 24px 0;${i < stories.length - 1 ? 'border-bottom:1px solid #e5e5e5;' : ''}">
          ${imageBlock}
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${categoryColor};font-family:monospace;">
            ${story.category}
          </p>
          <a href="${storyUrl}" style="text-decoration:none;color:#171717;">
            <h2 style="margin:0 0 8px 0;font-size:${i === 0 ? '24px' : '20px'};font-weight:900;line-height:1.15;font-family:Georgia,'Times New Roman',serif;">
              ${story.title}
            </h2>
          </a>
          <p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#525252;font-family:Georgia,'Times New Roman',serif;">
            ${story.excerpt}
          </p>
          <a href="${storyUrl}" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#171717;text-decoration:underline;text-underline-offset:2px;font-family:monospace;">
            Read Story
          </a>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>uni-uk.ai Daily Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:3px solid #171717;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:24px;font-weight:900;font-family:Georgia,'Times New Roman',serif;color:#171717;">
                      uni-uk<span style="color:#e11d48;">.ai</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#737373;font-family:monospace;">
                      Daily Digest
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Date -->
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;font-family:monospace;">
                ${dateStr}
              </p>
              <h2 style="margin:8px 0 0 0;font-size:28px;font-weight:900;font-family:Georgia,'Times New Roman',serif;color:#171717;">
                What's Trending Today
              </h2>
            </td>
          </tr>

          <!-- Stories -->
          <tr>
            <td style="padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${storyBlocks}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:16px 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px;background-color:#171717;text-align:center;">
                    <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">
                      Want to dig deeper?
                    </p>
                    <a href="https://uni-uk.ai/blog" style="display:inline-block;padding:12px 28px;background-color:#ffffff;color:#171717;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;font-family:monospace;">
                      Read All Stories
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#737373;text-align:center;">
                You received this because you subscribed to the uni-uk.ai daily digest.
              </p>
              <p style="margin:0;font-size:12px;color:#737373;text-align:center;">
                <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="https://uni-uk.ai/blog" style="color:#737373;text-decoration:underline;">View on web</a>
                &nbsp;&middot;&nbsp;
                <a href="https://uni-uk.ai/privacy" style="color:#737373;text-decoration:underline;">Privacy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
