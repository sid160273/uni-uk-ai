import { SearchBox } from "@/components/SearchBox";
import { MainNavigation } from "@/components/MainNavigation";
import { TrendingTicker } from "@/components/TrendingTicker";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getAllBlogPostsCombined } from "@/lib/blog-data";
import { getSectionTopStories } from "@/lib/section-data";
import { SECTIONS } from "@/lib/sections";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Universal News Intelligence | uni-uk.ai",
  description: "AI-powered news intelligence across sport, tech, crypto, entertainment, business and more. Updated every 10 minutes. Ask our AI anything trending.",
  keywords: ["trending news", "news intelligence", "AI news", "sport news", "tech news", "crypto news", "entertainment news", "business news", "trending topics today", "breaking news"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Universal News Intelligence | uni-uk.ai",
    description: "AI-powered news across sport, tech, crypto, entertainment, business and more. Updated every 10 minutes.",
    type: "website",
    url: "https://uni-uk.ai",
    siteName: "uni-uk.ai",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai - Universal News Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Universal News Intelligence | uni-uk.ai",
    description: "AI-powered news across sport, tech, crypto, entertainment, business and more. Updated every 10 minutes.",
    images: ["/logo.png"],
    creator: "@uniukai",
  },
};

// Section slugs to display in the hub grid (exclude universities)
const HUB_SECTION_SLUGS = ['trending', 'sport', 'tech', 'entertainment', 'business', 'crypto'];

export default async function Home() {
  const headersList = await headers();
  const detectedCountry = headersList.get('x-vercel-ip-country') || 'GB';

  // Fetch all posts for ticker and featured story
  let allStories: any[] = [];
  try {
    allStories = await getAllBlogPostsCombined();
  } catch (error) {
    console.error('Error fetching stories:', error);
  }

  const tickerStories = allStories.slice(0, 10);
  const featuredStory = allStories[0] || null;

  // Fetch top 2 stories per section for the hub cards (in parallel)
  const hubSections = SECTIONS.filter(s => HUB_SECTION_SLUGS.includes(s.slug));
  const sectionStoriesMap: Record<string, any[]> = {};

  await Promise.all(
    hubSections.map(async (section) => {
      if (section.hasDedicatedDataSource) {
        // Crypto has its own data source; we won't fetch blog stories for it
        sectionStoriesMap[section.slug] = [];
        return;
      }
      try {
        const stories = await getSectionTopStories(section.slug, 2);
        sectionStoriesMap[section.slug] = stories;
      } catch {
        sectionStoriesMap[section.slug] = [];
      }
    })
  );

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[{ name: "Home", url: "https://uni-uk.ai" }]} />
      <MainNavigation />

      {/* Breaking News Ticker */}
      {tickerStories.length > 0 && (
        <TrendingTicker stories={tickerStories.map(s => ({
          title: s.title,
          category: s.category,
          slug: s.slug,
        }))} />
      )}

      {/* ================================================================ */}
      {/* HERO */}
      {/* ================================================================ */}
      <section className="py-10 md:py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border text-xs font-semibold uppercase tracking-editorial text-muted-foreground mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            Live &mdash; Updated every 10 minutes
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3">
            uni-uk<span className="text-destructive">.ai</span>
          </h1>
          <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground/80 mb-4">
            Universal News Intelligence
          </p>
          <p className="font-body-serif text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered news across sport, tech, crypto, entertainment, business and more. Updated every 10 minutes.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION HUBS GRID */}
      {/* ================================================================ */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial text-muted-foreground">
            Explore Every Beat
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {hubSections.map((section) => {
            const stories = sectionStoriesMap[section.slug] || [];
            const sectionHref = section.slug === 'trending'
              ? '/blog'
              : section.slug === 'crypto'
                ? '/crypto'
                : `/${section.slug}`;

            return (
              <div
                key={section.slug}
                className="relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Colored top accent bar */}
                <div
                  className="h-1"
                  style={{ backgroundColor: section.accentHex }}
                />

                <div className="p-4 md:p-5">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl md:text-2xl" role="img" aria-label={section.name}>
                      {section.icon}
                    </span>
                    <h3 className="font-display text-base md:text-lg font-extrabold tracking-tight">
                      {section.name}
                    </h3>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-muted-foreground leading-snug mb-3 line-clamp-2">
                    {section.tagline}
                  </p>

                  {/* Top stories (not for crypto since it uses dedicated data source) */}
                  {stories.length > 0 && (
                    <div className="space-y-2 mb-3 border-t border-border pt-3">
                      {stories.map((story: any) => (
                        <Link
                          key={story.slug}
                          href={`/blog/${story.slug}`}
                          className="block text-xs font-semibold leading-snug hover:underline underline-offset-2 line-clamp-2 text-foreground/90"
                        >
                          {story.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Crypto placeholder when no blog stories */}
                  {section.slug === 'crypto' && (
                    <div className="space-y-2 mb-3 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        Live prices, market analysis &amp; trending coins
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={sectionHref}
                    className="inline-block text-[11px] font-bold uppercase tracking-editorial transition-colors"
                    style={{ color: section.accentHex }}
                  >
                    Explore {section.shortName} &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AdPlaceholder id="101" format="horizontal" className="container mx-auto px-4" />

      {/* ================================================================ */}
      {/* FEATURED STORY */}
      {/* ================================================================ */}
      {featuredStory && (
        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="border-b-2 border-foreground pb-2 mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-editorial">Top Story</h2>
          </div>

          <Link href={`/blog/${featuredStory.slug}`} className="block group max-w-4xl mx-auto">
            <div className="relative aspect-video md:aspect-[2/1] overflow-hidden mb-4">
              <img
                src={featuredStory.imageUrl}
                alt={featuredStory.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-editorial text-destructive">
                {featuredStory.category}
              </span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-editorial">
                {featuredStory.readingTime} min read
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-black leading-[1.1] mb-3 group-hover:underline decoration-2 underline-offset-4">
              {featuredStory.title}
            </h3>
            <p className="font-body-serif text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl">
              {featuredStory.excerpt}
            </p>
          </Link>
        </section>
      )}

      {/* ================================================================ */}
      {/* AI CHAT SECTION */}
      {/* ================================================================ */}
      <section id="search" className="py-10 md:py-14 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Ask about anything trending
            </h2>
            <p className="text-sm text-muted-foreground">
              Our AI knows every story across every section &mdash; just ask.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <SearchBox />
          </div>
        </div>
      </section>

      <AdPlaceholder id="201" format="horizontal" className="container mx-auto px-4" />

      {/* ================================================================ */}
      {/* UNIVERSITIES CALLOUT */}
      {/* ================================================================ */}
      <section className="container mx-auto px-4 py-8">
        <Link
          href="/universities"
          className="block border border-border rounded-lg p-6 md:p-8 hover:shadow-lg transition-shadow group bg-card text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">🎓</span>
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight group-hover:underline decoration-2 underline-offset-4">
              Exploring university options?
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse 140+ UK universities &mdash; rankings, guides, and everything you need &rarr;
          </p>
        </Link>
      </section>

      {/* ================================================================ */}
      {/* NEWSLETTER */}
      {/* ================================================================ */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-xl mx-auto">
          <NewsletterSignup />
        </div>
      </section>

      <AdPlaceholder id="301" format="horizontal" className="container mx-auto px-4" />

      {/* ================================================================ */}
      {/* ABOUT SECTION */}
      {/* ================================================================ */}
      <section id="about" className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Why uni-uk.ai?
              </h2>
              <p className="text-lg text-muted-foreground">
                Universal News Intelligence &mdash; every story, every angle, every 10 minutes
              </p>
            </div>

            <div className="grid gap-px md:grid-cols-4 bg-border">
              {[
                { title: "Every Section", desc: "Sport, tech, crypto, entertainment, business — all in one place, all AI-powered" },
                { title: "Real-Time", desc: "Updated every 10 minutes so you never miss what's happening right now" },
                { title: "Ask Anything", desc: "Chat with our AI about any trending topic across any section" },
                { title: "Always Free", desc: "Universal access to intelligent news — no paywalls, no sign-up required" },
              ].map((item) => (
                <div key={item.title} className="bg-background p-6 text-center">
                  <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="font-display text-xl font-bold mb-1">
                uni-uk<span className="text-destructive">.ai</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-editorial">
                Universal News Intelligence
              </p>
            </div>

            {/* Section links */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6">
              {hubSections.map((section) => {
                const href = section.slug === 'trending'
                  ? '/blog'
                  : section.slug === 'crypto'
                    ? '/crypto'
                    : `/${section.slug}`;
                return (
                  <Link
                    key={section.slug}
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {section.shortName}
                  </Link>
                );
              })}
              <Link href="/universities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Universities
              </Link>
            </div>

            {/* Utility links */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/#search" className="hover:text-foreground transition-colors">Ask AI</Link>
            </div>

            <p className="text-muted-foreground text-xs text-center">
              &copy; {new Date().getFullYear()} uni-uk.ai &middot; Powered by AI &middot; Updated every 10 minutes
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
