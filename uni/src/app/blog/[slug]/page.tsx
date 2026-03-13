import { getAllBlogPostsCombined } from "@/lib/blog-data";
import { MainNavigation } from "@/components/MainNavigation";
import { BlogCard } from "@/components/BlogCard";
import { ArticleSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// Force dynamic rendering to always show fresh content
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const allPosts = await getAllBlogPostsCombined();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found | uni-uk.ai",
    };
  }

  const truncatedExcerpt = post.excerpt.length > 160 ? post.excerpt.slice(0, 157) + "..." : post.excerpt;

  return {
    title: `${post.title} | Trending ${post.category} News`,
    description: truncatedExcerpt,
    keywords: [...post.tags, "trending news", post.category.toLowerCase(), "what's trending"],
    authors: [{ name: post.author }],
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: truncatedExcerpt,
      type: "article",
      url: `https://uni-uk.ai/blog/${slug}`,
      siteName: "uni-uk.ai",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.imageUrl ? [
        {
          url: post.imageUrl.startsWith("http") ? post.imageUrl : `https://uni-uk.ai${post.imageUrl}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: truncatedExcerpt,
      images: post.imageUrl ? [post.imageUrl.startsWith("http") ? post.imageUrl : `https://uni-uk.ai${post.imageUrl}`] : ["/logo.png"],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch all posts once, then find the matching post and related posts from the same data
  const allPosts = await getAllBlogPostsCombined();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    console.error(`[blog/${slug}] Post not found. Total posts available: ${allPosts.length}. Slugs sample: ${allPosts.slice(0, 5).map(p => p.slug).join(', ')}`);
    notFound();
  }

  // Get related posts from the already-fetched data
  const relatedPosts = allPosts
    .filter(p => p.slug !== slug)
    .map(p => {
      let score = 0;
      if (p.category === post.category) score += 3;
      score += p.tags.filter(t => post.tags.includes(t)).length;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.post);

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
        <header className="py-10 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                All Stories
              </Link>

              <div className="mb-4">
                <Link
                  href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[11px] font-bold uppercase tracking-editorial text-destructive hover:underline"
                >
                  {post.category}
                </Link>
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                <span className="font-semibold text-foreground">{post.author}</span>
                <span className="text-border">|</span>
                <span>{formattedDate}</span>
                <span className="text-border">|</span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display">
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
                      // Check for plain URLs: http(s)://, www., or bare domains (e.g. discoveruni.gov.uk, lnat.ac.uk)
                      const urlMatch = remaining.match(/(https?:\/\/[^\s\)\]\,]+|www\.[^\s\)\]\,]+|[a-z0-9][-a-z0-9]*\.(com|co\.uk|org|org\.uk|net|edu|gov|gov\.uk|ac\.uk|io|ai|nhs\.uk|me|info)(\/[^\s\)\]\,]*)?)/);

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
                        // Detect external domains that might be missing protocol
                        const looksExternal = /^(www\.|[a-z0-9-]+\.(com|co\.uk|org|org\.uk|net|edu|gov|gov\.uk|ac\.uk|io|ai|nhs\.uk|me|info|bbc|news))/.test(linkUrl);
                        const isExternal = linkUrl.startsWith('http') || looksExternal;
                        const isInternal = !isExternal && (linkUrl.startsWith('/') || linkUrl.startsWith('#'));
                        const href = linkUrl.startsWith('http') ? linkUrl : isInternal ? linkUrl : `https://${linkUrl.replace(/^\/+/, '')}`;
                        parts.push(
                          <a
                            key={key++}
                            href={href}
                            target={isInternal ? undefined : "_blank"}
                            rel={isInternal ? undefined : "noopener noreferrer"}
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

                  // Check headings from most specific (####) to least specific (#)
                  if (trimmed.startsWith("#### ")) {
                    return (
                      <h4 key={index} className="text-lg font-semibold mt-4 mb-2">
                        {parseInlineMarkdown(trimmed.slice(5))}
                      </h4>
                    );
                  }
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                        {parseInlineMarkdown(trimmed.slice(4))}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                        {parseInlineMarkdown(trimmed.slice(3))}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                        {parseInlineMarkdown(trimmed.slice(2))}
                      </h1>
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
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground mr-1">Tags</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 border border-border text-xs font-medium text-muted-foreground"
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
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="border-b-2 border-foreground pb-2 mb-8">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Related Stories</h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Want to know more about what&apos;s trending?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our AI assistant about any trending topic, or explore all the stories everyone is searching for right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#search"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
            >
              Ask Our AI
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border border-border font-semibold text-sm uppercase tracking-editorial hover:bg-muted transition-colors"
            >
              See All Trending Stories
            </Link>
          </div>
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
            <Link href="/blog" className="hover:text-foreground transition-colors">Stories</Link>
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
