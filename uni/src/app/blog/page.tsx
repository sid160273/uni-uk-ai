import { getAllBlogPostsCombined, getAllCategoriesCombined } from "@/lib/blog-data";
import { BlogCardList } from "@/components/BlogCard";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Stories Today | What's Trending Now | Breaking News",
  description:
    "Read the latest trending stories and breaking news. AI-powered coverage of what everyone is searching for — sports, politics, entertainment, tech. Updated every 10 minutes.",
  keywords: ["trending stories today", "what's trending", "trending news", "breaking news", "trending topics", "news today", "latest stories"],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Trending Stories Today | What's Trending Now | uni-uk.ai",
    description: "AI-powered trending stories on the topics everyone is searching for. Sports, politics, entertainment, tech and more — updated every 10 minutes.",
    type: "website",
    url: "https://uni-uk.ai/blog",
    siteName: "uni-uk.ai",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "uni-uk.ai Trending Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Stories Today | What's Trending Now",
    description: "AI-powered trending stories updated every 10 minutes. Sports, politics, entertainment, tech and more.",
    images: ["/logo.png"],
  },
};

// Force dynamic rendering to always show fresh content
export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const posts = await getAllBlogPostsCombined();
  const categories = await getAllCategoriesCombined();

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Blog", url: "https://uni-uk.ai/blog" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-violet-50/30 dark:from-primary/5 dark:via-background dark:to-violet-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Trending Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered stories on the topics everyone is searching for right now — updated every 10 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              All Posts
            </span>
            {categories.map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium cursor-pointer transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <BlogCardList posts={posts} showFeatured={true} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want to know more about what&apos;s trending?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our AI assistant about any trending topic — get context, background, and analysis instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Ask Our AI
            </Link>
          </div>
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
