import { getAllBlogPostsCombined, getAllCategoriesCombined } from "@/lib/blog-data";
import { BlogCardList } from "@/components/BlogCard";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Stories Today | What's Trending Now | Breaking News",
  description:
    "Read the latest trending stories and breaking news. AI-powered coverage of what everyone is searching for — sports, politics, entertainment, tech. Updated every 10 minutes.",
  keywords: ["trending stories today", "what's trending", "trending news", "breaking news", "trending topics", "news today", "latest stories"],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Trending Stories Today | What's Trending Now | uni-uk.ai",
    description: "AI-powered trending stories on the topics everyone is searching for. Updated every 10 minutes.",
    type: "website",
    url: "https://uni-uk.ai/blog",
    siteName: "uni-uk.ai",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai Trending Stories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Stories Today | What's Trending Now",
    description: "AI-powered trending stories updated every 10 minutes.",
    images: ["/logo.png"],
  },
};

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

      {/* Hero */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-4">
            Trending Stories
          </h1>
          <p className="font-body-serif text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered stories on the topics everyone is searching for right now.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className="px-3 py-1.5 bg-foreground text-background text-xs font-semibold uppercase tracking-editorial"
            >
              All Posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 border border-border text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                {category}
              </Link>
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

      {/* Newsletter */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-black mb-2">Daily Digest</h2>
            <p className="font-body-serif text-muted-foreground">
              The top trending stories, delivered to your inbox every morning.
            </p>
          </div>
          <NewsletterSignup variant="inline" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-black mb-4">
            Want to know more about what&apos;s trending?
          </h2>
          <p className="font-body-serif text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our AI assistant about any trending topic — get context, background, and analysis instantly.
          </p>
          <Link
            href="/#search"
            className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
          >
            Ask Our AI
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="font-display text-xl font-bold">
            uni-uk<span className="text-destructive">.ai</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">Universities</Link>
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
