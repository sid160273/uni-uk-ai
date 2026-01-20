import { NextResponse } from 'next/server';
import { getAllBlogPostsCombined } from '@/lib/blog-data';

// Debug endpoint to check blog data fetching
export async function GET() {
  try {
    const posts = await getAllBlogPostsCombined();

    return NextResponse.json({
      success: true,
      totalPosts: posts.length,
      // Show just the slugs and titles of the 5 most recent
      recentPosts: posts.slice(0, 5).map(p => ({
        slug: p.slug,
        title: p.title,
        publishedAt: p.publishedAt,
        category: p.category,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
