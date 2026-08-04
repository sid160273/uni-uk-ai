import { getAllBlogPostsCombined, getAllCategoriesCombined } from "@/lib/blog-data";
import { BlogCardList } from "@/components/BlogCard";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { deduplicatePosts } from "@/lib/dedup-posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NOINDEX_FOLLOW } from "@/lib/seo";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ category: string }>;
}

// Convert slug to display name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Convert category name to slug
function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = slugToName(category);

  return {
    robots: NOINDEX_FOLLOW,
    title: `${categoryName} Trending Stories Today | What's Trending in ${categoryName}`,
    description: `Latest trending ${categoryName.toLowerCase()} stories and breaking news. Discover what everyone is searching for right now with AI-powered insights, updated every 10 minutes.`,
    keywords: [`${categoryName.toLowerCase()} news`, "trending stories today", "what's trending", `trending ${categoryName.toLowerCase()}`, "breaking news", "news today"],
    alternates: {
      canonical: `/blog/category/${category}`,
    },
    openGraph: {
      title: `${categoryName} Trending Stories Today | uni-uk.ai`,
      description: `Latest trending ${categoryName.toLowerCase()} stories — what everyone is searching for right now. AI-powered insights updated every 10 minutes.`,
      type: "website",
      url: `https://uni-uk.ai/blog/category/${category}`,
      siteName: "uni-uk.ai",
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: `${categoryName} Trending Stories on uni-uk.ai`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Trending Stories Today | uni-uk.ai`,
      description: `Latest trending ${categoryName.toLowerCase()} stories and breaking news, updated every 10 minutes.`,
      images: ["/logo.png"],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categorySlug = category.toLowerCase();

  // Get all posts and filter by category
  const allPosts = await getAllBlogPostsCombined();
  const categoryPosts = allPosts.filter(
    (post) => nameToSlug(post.category) === categorySlug
  );
  // Remove near-duplicate articles covering the same story (keeps most recent)
  const posts = deduplicatePosts(categoryPosts);

  if (posts.length === 0) {
    notFound();
  }

  const categoryName = posts[0].category; // Use actual category name from post
  const allCategories = await getAllCategoriesCombined();

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Blog", url: "https://uni-uk.ai/blog" },
    { name: categoryName, url: `https://uni-uk.ai/blog/category/${categorySlug}` },
  ];

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-violet-50/30 dark:from-primary/5 dark:via-background dark:to-violet-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
            >
              ← Back to all posts
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {categoryName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {posts.length} trending {categoryName.toLowerCase()} {posts.length !== 1 ? 'stories' : 'story'} right now
            </p>
          </div>
        </div>
      </section>

      {/* Categories Navigation */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium transition-colors"
            >
              All Posts
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={`/blog/category/${nameToSlug(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  nameToSlug(cat) === categorySlug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <BlogCardList posts={posts} showFeatured={false} />
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">
              Universities
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} uni-uk.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
