import { getAllBlogPostsCombined } from '@/lib/blog-data';

export async function GET() {
  const posts = await getAllBlogPostsCombined();
  const baseUrl = 'https://uni-uk.ai';

  const rssItems = posts.slice(0, 50).map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${post.category}</category>
      <author>team@uni-uk.ai (${post.author})</author>
    </item>`).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>uni-uk.ai Blog - UK University Guides &amp; Advice</title>
    <link>${baseUrl}/blog</link>
    <description>Expert guides on choosing UK universities, UCAS applications, student life, accommodation, and more. Free advice for students and parents.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>uni-uk.ai Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
