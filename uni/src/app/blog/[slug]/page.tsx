import { getBlogPostBySlug, getAllBlogPosts, getRelatedBlogPosts } from "@/data/blog-posts";
import { MainNavigation } from "@/components/MainNavigation";
import { BlogCard } from "@/components/BlogCard";
import { ArticleSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | uni-uk.ai",
    };
  }

  return {
    title: `${post.title} | uni-uk.ai Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Blog", url: "https://uni-uk.ai/blog" },
    { name: post.title, url: `https://uni-uk.ai/blog/${slug}` },
  ];

  return (
    <main className="min-h-screen bg-background">
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        url={`https://uni-uk.ai/blog/${slug}`}
        imageUrl={`https://uni-uk.ai${post.imageUrl}`}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        authorName={post.author}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Article Header */}
      <article>
        <header className="py-12 bg-gradient-to-br from-primary/5 via-background to-violet-50/30 dark:from-primary/5 dark:via-background dark:to-violet-950/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">UK</span>
                  </div>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.content.split("\n").map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Helper function to parse inline markdown (bold, links)
                  const parseInlineMarkdown = (text: string) => {
                    const parts: React.ReactNode[] = [];
                    let remaining = text;
                    let key = 0;

                    while (remaining.length > 0) {
                      // Check for markdown links [text](url)
                      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
                      // Check for bold text **text**
                      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
                      // Check for plain URLs (www. or https:// or http://)
                      const urlMatch = remaining.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);

                      // Find the earliest match
                      const matches = [
                        linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
                        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
                        urlMatch ? { type: 'url', match: urlMatch, index: urlMatch.index! } : null,
                      ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

                      if (matches.length === 0) {
                        parts.push(remaining);
                        break;
                      }

                      // Sort by index to find earliest match
                      matches.sort((a, b) => a.index - b.index);
                      const earliest = matches[0];

                      // Add text before the match
                      if (earliest.index > 0) {
                        parts.push(remaining.slice(0, earliest.index));
                      }

                      if (earliest.type === 'link') {
                        const [fullMatch, linkText, linkUrl] = earliest.match;
                        const href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
                        parts.push(
                          <a
                            key={key++}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {linkText}
                          </a>
                        );
                        remaining = remaining.slice(earliest.index + fullMatch.length);
                      } else if (earliest.type === 'bold') {
                        parts.push(<strong key={key++}>{earliest.match[1]}</strong>);
                        remaining = remaining.slice(earliest.index + earliest.match[0].length);
                      } else if (earliest.type === 'url') {
                        const url = earliest.match[0];
                        const href = url.startsWith('http') ? url : `https://${url}`;
                        parts.push(
                          <a
                            key={key++}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {url}
                          </a>
                        );
                        remaining = remaining.slice(earliest.index + url.length);
                      }
                    }

                    return parts.length === 1 ? parts[0] : parts;
                  };

                  if (trimmed.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                        {parseInlineMarkdown(trimmed.slice(2))}
                      </h1>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                        {parseInlineMarkdown(trimmed.slice(3))}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                        {parseInlineMarkdown(trimmed.slice(4))}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 text-muted-foreground">
                        {parseInlineMarkdown(trimmed.slice(2))}
                      </li>
                    );
                  }
                  if (/^\d+\./.test(trimmed)) {
                    return (
                      <li key={index} className="ml-4 text-muted-foreground list-decimal">
                        {parseInlineMarkdown(trimmed.replace(/^\d+\.\s*/, ""))}
                      </li>
                    );
                  }

                  return (
                    <p key={index} className="text-muted-foreground leading-relaxed my-4">
                      {parseInlineMarkdown(trimmed)}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Find your perfect UK university
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Use our AI-powered search to discover universities that match your
            interests and goals.
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
