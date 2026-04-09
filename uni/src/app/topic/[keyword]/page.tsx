import { getPostsByTopic, getRelatedTopics, slugToTopic, topicToSlug } from "@/lib/topic-utils";
import { BlogCardList } from "@/components/BlogCard";
import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { keyword } = await params;
  const topicName = slugToTopic(keyword);

  return {
    title: `${topicName} News & Updates — What's Trending | uni-uk.ai`,
    description: `Explore the latest ${topicName.toLowerCase()} stories, news, and analysis. Discover what's trending in ${topicName.toLowerCase()} right now with AI-powered insights.`,
    keywords: [
      topicName.toLowerCase(),
      `${topicName.toLowerCase()} news`,
      `${topicName.toLowerCase()} updates`,
      "trending stories",
      "what's trending",
    ],
    alternates: {
      canonical: `/topic/${keyword}`,
    },
    openGraph: {
      title: `${topicName} News & Updates — What's Trending | uni-uk.ai`,
      description: `Latest ${topicName.toLowerCase()} stories and trending news. AI-powered insights updated every 10 minutes.`,
      type: "website",
      url: `https://uni-uk.ai/topic/${keyword}`,
      siteName: "uni-uk.ai",
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: `${topicName} Trending Stories on uni-uk.ai`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topicName} News & Updates | uni-uk.ai`,
      description: `Latest ${topicName.toLowerCase()} stories and trending news, updated every 10 minutes.`,
      images: ["/logo.png"],
    },
  };
}

function CollectionPageSchema({ topicName, keyword, postCount }: { topicName: string; keyword: string; postCount: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://uni-uk.ai/topic/${keyword}`,
    name: `${topicName} News & Updates`,
    description: `Explore the latest ${topicName.toLowerCase()} stories, news, and analysis on uni-uk.ai.`,
    url: `https://uni-uk.ai/topic/${keyword}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://uni-uk.ai/#website",
    },
    about: {
      "@type": "Thing",
      name: topicName,
    },
    numberOfItems: postCount,
    publisher: {
      "@type": "Organization",
      name: "uni-uk.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://uni-uk.ai/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function TopicPage({ params }: PageProps) {
  const { keyword } = await params;
  const topicName = slugToTopic(keyword);

  const posts = await getPostsByTopic(keyword);
  const relatedTopics = await getRelatedTopics(keyword);

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Blog", url: "https://uni-uk.ai/blog" },
    { name: topicName, url: `https://uni-uk.ai/topic/${keyword}` },
  ];

  return (
    <main className="min-h-screen bg-background">
      <CollectionPageSchema topicName={topicName} keyword={keyword} postCount={posts.length} />
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-violet-50/30 dark:from-primary/5 dark:via-background dark:to-violet-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/blog"
              className="text-[11px] font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground mb-4 inline-block transition-colors"
            >
              &larr; All Stories
            </Link>
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 leading-[1.08]">
              {topicName}
            </h1>
            {posts.length > 0 ? (
              <p className="font-body-serif text-lg text-muted-foreground max-w-2xl mx-auto">
                {posts.length} trending {topicName.toLowerCase()}{" "}
                {posts.length !== 1 ? "stories" : "story"} right now
              </p>
            ) : (
              <p className="font-body-serif text-lg text-muted-foreground max-w-2xl mx-auto">
                Exploring {topicName.toLowerCase()} stories and updates
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related Topics Navigation */}
      {relatedTopics.length > 0 && (
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium">
                {topicName}
              </span>
              {relatedTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/topic/${topicToSlug(topic)}`}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      {posts.length > 0 ? (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <BlogCardList posts={posts} showFeatured={posts.length >= 3} />
          </div>
        </section>
      ) : (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="font-display text-2xl font-bold mb-3">
                No stories yet
              </h2>
              <p className="font-body-serif text-muted-foreground mb-6">
                We don&apos;t have any stories about{" "}
                <span className="font-semibold text-foreground">{topicName.toLowerCase()}</span>{" "}
                yet. Check back soon or explore other trending topics.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
              >
                Browse All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Want to know more about {topicName.toLowerCase()}?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Explore all the stories everyone is searching for right now.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
          >
            See All Trending Stories
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
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
