import { getAllBlogPostsCombined, getAllCategoriesCombined } from "@/lib/blog-data";
import { BlogCardList } from "@/components/BlogCard";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK University Guides & Advice - Blog | uni-uk.ai",
  description:
    "Expert guides on choosing UK universities, UCAS applications, student life, accommodation, and more. Free advice for students and parents.",
  alternates: {
    canonical: "/blog",
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
              University Guides & Advice
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert insights to help you navigate university applications, student
              life, and make informed decisions about your education.
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
      <section className="py-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect university?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Use our AI-powered search to discover universities that match your interests,
            goals, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try AI Search
            </Link>
            <Link
              href="/universities"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Browse Universities
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
