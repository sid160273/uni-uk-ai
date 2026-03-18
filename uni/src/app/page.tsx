import { SearchBox } from "@/components/SearchBox";
import { MainNavigation } from "@/components/MainNavigation";
import { TrendingTicker } from "@/components/TrendingTicker";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { TrendChart } from "@/components/TrendChart";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getAllBlogPostsCombined } from "@/lib/blog-data";
import { SECTIONS } from "@/lib/sections";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Universal News Intelligence | AI-Powered News | uni-uk.ai",
  description: "Universal News Intelligence — AI-powered news across sport, tech, crypto, entertainment, business and trending topics. Updated every 10 minutes.",
  keywords: ["trending news", "universal news", "AI news", "sport news", "tech news", "crypto news", "entertainment news", "business news", "trending topics", "breaking news"],
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

// Section hub links for the quick-nav bar
const SECTION_LINKS = SECTIONS
  .filter(s => s.slug !== 'universities' && s.slug !== 'trending')
  .map(s => ({
    name: s.shortName,
    href: s.hasDedicatedDataSource ? `/${s.slug}` : `/${s.slug}`,
    icon: s.icon,
    accentHex: s.accentHex,
  }));

export default async function Home() {
  const headersList = await headers();
  const detectedCountry = headersList.get('x-vercel-ip-country') || 'GB';

  // Single API call — everything derives from this
  let trendingStories: any[] = [];
  try {
    const allPosts = await getAllBlogPostsCombined();
    trendingStories = allPosts.slice(0, 10);
  } catch (error) {
    console.error('Error fetching trending stories:', error);
  }

  const topStories = trendingStories.slice(0, 3);
  const moreStories = trendingStories.slice(3, 6);
  const restStories = trendingStories.slice(6);

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[{ name: "Home", url: "https://uni-uk.ai" }]} />
      <MainNavigation />

      {/* Breaking News Ticker */}
      {trendingStories.length > 0 && (
        <TrendingTicker stories={trendingStories.map(s => ({
          title: s.title,
          category: s.category,
          slug: s.slug,
        }))} />
      )}

      {/* Hero */}
      <section className="py-8 md:py-14 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border text-xs font-semibold uppercase tracking-editorial text-muted-foreground mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            Live — Updated every 10 minutes
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3">
            uni-uk<span className="text-destructive">.ai</span>
          </h1>
          <p className="font-display text-lg md:text-xl font-bold tracking-tight text-foreground/70 mb-4">
            Universal News Intelligence
          </p>
          <p className="font-body-serif text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered stories on what everyone is searching for. Ask our assistant anything or browse the latest trends.
          </p>
        </div>
      </section>

      {/* Section Hub Quick Nav */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 py-3 overflow-x-auto">
            {SECTION_LINKS.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded transition-colors whitespace-nowrap"
              >
                <span>{s.icon}</span>
                {s.name}
              </Link>
            ))}
            <Link
              href="/universities"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded transition-colors whitespace-nowrap"
            >
              <span>🎓</span>
              Unis
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Trend Chart */}
      {trendingStories.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <TrendChart
            stories={trendingStories.map(s => ({
              title: s.title,
              slug: s.slug,
              category: s.category,
              publishedAt: s.publishedAt,
            }))}
            defaultGeo={detectedCountry}
          />
        </section>
      )}

      {/* MOBILE: AI Chat */}
      <section className="container mx-auto px-4 pb-8 lg:hidden">
        <div className="space-y-6">
          <div id="search-mobile">
            <h2 className="font-display text-2xl font-bold mb-3">Ask AI</h2>
            <p className="text-sm text-muted-foreground mb-3">Knows all trending topics</p>
            <SearchBox />
          </div>
        </div>
      </section>

      {/* === MAIN CONTENT === */}
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* LEFT COLUMN: Stories Feed */}
          <div className="lg:col-span-7 space-y-8">

            {/* Top Stories */}
            {topStories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b-2 border-foreground pb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Top Stories</h2>
                  <Link href="/blog" className="text-[11px] font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors">
                    View all
                  </Link>
                </div>

                {/* #1 Featured Story */}
                <Link href={`/blog/${topStories[0].slug}`} className="block mb-8 group">
                  <div className="relative aspect-video md:aspect-[2/1] overflow-hidden mb-4">
                    <img
                      src={topStories[0].imageUrl}
                      alt={topStories[0].title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-editorial text-destructive">
                      {topStories[0].category}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-editorial">
                      {topStories[0].readingTime} min read
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-4xl font-black leading-[1.1] mb-3 group-hover:underline decoration-2 underline-offset-4">
                    {topStories[0].title}
                  </h3>
                  <p className="font-body-serif text-muted-foreground leading-relaxed line-clamp-2">{topStories[0].excerpt}</p>
                </Link>

                {/* #2 and #3 Stories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                  {topStories.slice(1).map((story) => (
                    <Link key={story.slug} href={`/blog/${story.slug}`} className="group">
                      <div className="aspect-video overflow-hidden mb-3">
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-editorial text-destructive">
                        {story.category}
                      </span>
                      <h3 className="font-display text-lg md:text-xl font-extrabold mt-1 mb-2 leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="font-body-serif text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <AdPlaceholder id="101" format="horizontal" />

            {/* More Stories */}
            {moreStories.length > 0 && (
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">More Stories</h2>
                </div>
                <div className="space-y-6 divide-y divide-border">
                  {moreStories.map((story) => (
                    <Link key={story.slug} href={`/blog/${story.slug}`} className="group flex gap-5 pt-6 first:pt-0">
                      <div className="w-28 h-20 md:w-36 md:h-24 overflow-hidden shrink-0">
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
                          {story.category}
                        </span>
                        <h3 className="font-display text-base md:text-lg font-extrabold mt-0.5 leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
                          {story.title}
                        </h3>
                        <p className="font-body-serif text-xs text-muted-foreground mt-1 line-clamp-1 hidden md:block">{story.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <AdPlaceholder id="102" format="horizontal" />

            {/* Also Trending */}
            {restStories.length > 0 && (
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Also Trending</h2>
                </div>
                <div className="divide-y divide-border">
                  {restStories.map((story, index) => (
                    <Link key={story.slug} href={`/blog/${story.slug}`} className="group flex items-center gap-4 py-3">
                      <span className="font-display text-3xl font-bold text-muted-foreground/30 w-10 text-center shrink-0">
                        {index + 7}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
                          {story.category}
                        </span>
                        <h3 className="font-semibold text-sm leading-snug group-hover:underline line-clamp-1">
                          {story.title}
                        </h3>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{story.readingTime} min</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Chat + Sidebar (Desktop only) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-8">

              {/* Chat Section */}
              <div id="search">
                <div className="border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Ask AI</h2>
                </div>
                <SearchBox />
              </div>

              <AdPlaceholder id="201" format="rectangle" />

              {/* Section Hubs */}
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Explore Sections</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SECTION_LINKS.map((s) => (
                    <Link
                      key={s.name}
                      href={s.href}
                      className="flex items-center gap-2 p-3 border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-editorial group-hover:text-foreground text-muted-foreground">
                        {s.name}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/universities"
                    className="flex items-center gap-2 p-3 border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-lg">🎓</span>
                    <span className="text-xs font-bold uppercase tracking-editorial group-hover:text-foreground text-muted-foreground">
                      Unis
                    </span>
                  </Link>
                </div>
              </div>

              {/* Trending Stories sidebar */}
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Trending Stories</h2>
                </div>
                <div className="divide-y divide-border">
                  {trendingStories.slice(0, 5).map((story) => (
                    <Link key={story.slug} href={`/blog/${story.slug}`} className="group block py-3">
                      <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">{story.category}</span>
                      <h4 className="font-display font-bold text-sm leading-snug mt-0.5 group-hover:underline line-clamp-2">
                        {story.title}
                      </h4>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1 block">
                        uni-uk.ai Newsroom
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </div>

      <AdPlaceholder id="301" format="horizontal" className="container mx-auto px-4" />

      {/* About Section */}
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

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="font-display text-xl font-bold mb-4">
            uni-uk<span className="text-destructive">.ai</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-editorial">
            Universal News Intelligence
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/editorial-policy" className="hover:text-foreground transition-colors">Editorial Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Stories</Link>
            <Link href="/sport" className="hover:text-foreground transition-colors">Sport</Link>
            <Link href="/tech" className="hover:text-foreground transition-colors">Tech</Link>
            <Link href="/entertainment" className="hover:text-foreground transition-colors">Entertainment</Link>
            <Link href="/business" className="hover:text-foreground transition-colors">Business</Link>
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">Universities</Link>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai &middot; Powered by AI &middot; Updated every 10 minutes
          </p>
        </div>
      </footer>
    </main>
  );
}
