import { MainNavigation } from "@/components/MainNavigation";
import { TrendingTicker } from "@/components/TrendingTicker";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getSectionPosts } from "@/lib/section-data";
import { getSection } from "@/lib/sections";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

const section = getSection('entertainment')!;

export const metadata: Metadata = {
  title: `${section.name} News Today | Trending Celebrity & Culture Stories | uni-uk.ai`,
  description: `${section.tagline}. AI-powered entertainment news updated every 10 minutes — celebrities, TV, film, music, and viral moments.`,
  keywords: ["entertainment news", "celebrity news", "trending entertainment", "TV news", "film news", "music news", "pop culture", "viral moments"],
  alternates: { canonical: "/entertainment" },
  openGraph: {
    title: `${section.name} News Today | uni-uk.ai`,
    description: `${section.tagline}. AI-powered entertainment and culture stories updated every 10 minutes.`,
    type: "website",
    url: "https://uni-uk.ai/entertainment",
    siteName: "uni-uk.ai",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai - Entertainment News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${section.name} News Today | uni-uk.ai`,
    description: `${section.tagline}. AI-powered entertainment and culture stories updated every 10 minutes.`,
    images: ["/logo.png"],
    creator: "@uniukai",
  },
};

export default async function EntertainmentPage() {
  const headersList = await headers();
  const detectedCountry = headersList.get('x-vercel-ip-country') || 'GB';

  let stories: any[] = [];
  try {
    stories = await getSectionPosts('entertainment', 10);
  } catch (error) {
    console.error('Error fetching entertainment stories:', error);
  }

  const topStories = stories.slice(0, 3);
  const moreStories = stories.slice(3, 6);
  const restStories = stories.slice(6);

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://uni-uk.ai" },
        { name: section.name, url: "https://uni-uk.ai/entertainment" },
      ]} />
      <MainNavigation />

      {/* Breaking News Ticker */}
      {stories.length > 0 && (
        <TrendingTicker stories={stories.map(s => ({
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: section.accentHex }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: section.accentHex }} />
            </span>
            Live — Updated every 10 minutes
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            {section.name}
          </h1>
          <p className="font-body-serif text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {section.tagline}
          </p>
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
                    <span className="text-[11px] font-bold uppercase tracking-editorial" style={{ color: section.accentHex }}>
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
                      <span className="text-[11px] font-bold uppercase tracking-editorial" style={{ color: section.accentHex }}>
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

            <AdPlaceholder id="ent-101" format="horizontal" />

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

            <AdPlaceholder id="ent-102" format="horizontal" />

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

              <AdPlaceholder id="ent-201" format="rectangle" />

              {/* Top Stories sidebar */}
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Top {section.name} Stories</h2>
                </div>
                <div className="divide-y divide-border">
                  {stories.slice(0, 5).map((story) => (
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

      <AdPlaceholder id="ent-301" format="horizontal" className="container mx-auto px-4" />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="font-display text-xl font-bold mb-4">
            uni-uk<span className="text-destructive">.ai</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-editorial">
            {section.tagline}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Trending</Link>
            <Link href="/sport" className="hover:text-foreground transition-colors">Sport</Link>
            <Link href="/tech" className="hover:text-foreground transition-colors">Tech</Link>
            <Link href="/entertainment" className="hover:text-foreground transition-colors font-semibold text-foreground">Entertainment</Link>
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
