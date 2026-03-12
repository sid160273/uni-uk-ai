import { SearchBox } from "@/components/SearchBox";
import { MainNavigation } from "@/components/MainNavigation";
import { TrendingTicker } from "@/components/TrendingTicker";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { TrendChart } from "@/components/TrendChart";
import { getAllBlogPostsCombined } from "@/lib/blog-data";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const CATEGORY_EMOJI: Record<string, string> = {
  'Sports': '⚽',
  'Politics': '🏛️',
  'Entertainment': '🎬',
  'Technology': '💻',
  'Business': '📈',
  'Science': '🔬',
  'Health': '🏥',
  'World': '🌍',
  'Culture': '🎨',
  'Breaking': '🚨',
};

const CATEGORY_COLORS: Record<string, { bg: string, border: string, text: string }> = {
  'Sports': { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700' },
  'Politics': { bg: 'bg-purple-50', border: 'border-l-purple-500', text: 'text-purple-700' },
  'Entertainment': { bg: 'bg-pink-50', border: 'border-l-pink-500', text: 'text-pink-700' },
  'Technology': { bg: 'bg-cyan-50', border: 'border-l-cyan-500', text: 'text-cyan-700' },
  'Business': { bg: 'bg-green-50', border: 'border-l-green-500', text: 'text-green-700' },
  'Science': { bg: 'bg-indigo-50', border: 'border-l-indigo-500', text: 'text-indigo-700' },
  'Health': { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-700' },
  'World': { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-700' },
  'Culture': { bg: 'bg-rose-50', border: 'border-l-rose-500', text: 'text-rose-700' },
  'Breaking': { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700' },
};

export default async function Home() {
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
      <MainNavigation />

      {/* Breaking News Ticker */}
      {trendingStories.length > 0 && (
        <TrendingTicker stories={trendingStories.map(s => ({
          title: s.title,
          category: s.category,
          slug: s.slug,
        }))} />
      )}

      {/* Compact Hero */}
      <section className="relative py-6 md:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-100 via-background to-background dark:from-red-900/20 dark:via-background dark:to-background pointer-events-none" />
        <div className="container relative mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm font-medium text-red-700 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              Updated every 30 minutes
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              Learn What&apos;s Happening{' '}
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Right Now
              </span>
              {' '}🔥
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered stories on what everyone is searching for — ask our assistant anything or browse the latest trends
            </p>
          </div>
        </div>
      </section>

      {/* === MAIN CONTENT: Two-column on desktop === */}
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* LEFT COLUMN: Stories Feed */}
          <div className="lg:col-span-7 space-y-6">

            {/* Top Stories */}
            {topStories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold">🔥 Top Stories</h2>
                  <Link href="/blog" className="ml-auto text-sm text-primary hover:underline font-medium">
                    View all →
                  </Link>
                </div>

                {/* #1 Featured Story - Big Card */}
                <Link
                  href={`/blog/${topStories[0].slug}`}
                  className="block mb-4 group"
                >
                  <div className={`relative bg-card border-l-4 ${CATEGORY_COLORS[topStories[0].category]?.border || 'border-l-red-500'} rounded-xl overflow-hidden hover:shadow-xl transition-all`}>
                    <div className="relative aspect-video md:aspect-[2/1]">
                      <img
                        src={topStories[0].imageUrl}
                        alt={topStories[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            🔥 #1 TRENDING
                          </span>
                          <span className={`${CATEGORY_COLORS[topStories[0].category]?.bg || 'bg-red-50'} ${CATEGORY_COLORS[topStories[0].category]?.text || 'text-red-700'} text-xs font-bold px-2.5 py-1 rounded-full`}>
                            {CATEGORY_EMOJI[topStories[0].category] || '📰'} {topStories[0].category}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-red-200 transition-colors">
                          {topStories[0].title}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2">{topStories[0].excerpt}</p>
                        <div className="mt-3 flex items-center gap-3 text-white/60 text-xs">
                          <span>📖 {topStories[0].readingTime} min read</span>
                          <span>•</span>
                          <span className="text-red-300 font-medium group-hover:underline">Read full story →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* #2 and #3 Stories - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topStories.slice(1).map((story, index) => {
                    const colors = CATEGORY_COLORS[story.category] || CATEGORY_COLORS['Breaking'];
                    return (
                      <Link
                        key={story.slug}
                        href={`/blog/${story.slug}`}
                        className={`group bg-card border-l-4 ${colors.border} rounded-xl overflow-hidden hover:shadow-lg transition-all`}
                      >
                        <div className="aspect-video relative">
                          <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              #{index + 2} 🔥
                            </span>
                            <span className={`${colors.bg} ${colors.text} text-xs font-bold px-2.5 py-1 rounded-full`}>
                              {CATEGORY_EMOJI[story.category]} {story.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{story.excerpt}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>📖 {story.readingTime} min</span>
                            <span className="text-primary font-medium group-hover:underline">Read more →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ad Slot 1 - Between top stories and more stories */}
            <AdPlaceholder id="101" format="horizontal" />

            {/* More Stories */}
            {moreStories.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">📰 More Stories</h2>
                <div className="space-y-3">
                  {moreStories.map((story, index) => {
                    const colors = CATEGORY_COLORS[story.category] || CATEGORY_COLORS['Breaking'];
                    return (
                      <Link
                        key={story.slug}
                        href={`/blog/${story.slug}`}
                        className={`group flex gap-4 bg-card border-l-4 ${colors.border} rounded-xl p-4 hover:shadow-md transition-all`}
                      >
                        <div className="w-24 h-24 md:w-32 md:h-24 rounded-lg overflow-hidden shrink-0">
                          <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`${colors.bg} ${colors.text} text-xs font-bold px-2 py-0.5 rounded-full`}>
                              {CATEGORY_EMOJI[story.category]} {story.category}
                            </span>
                            <span className="text-xs text-muted-foreground">#{index + 4}</span>
                          </div>
                          <h3 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{story.excerpt}</p>
                          <span className="text-xs text-primary font-medium mt-1 inline-block">📖 {story.readingTime} min read</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ad Slot 2 */}
            <AdPlaceholder id="102" format="horizontal" />

            {/* Remaining Stories - Compact list */}
            {restStories.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">⚡ Also Trending</h2>
                <div className="bg-card border rounded-xl divide-y">
                  {restStories.map((story, index) => {
                    const colors = CATEGORY_COLORS[story.category] || CATEGORY_COLORS['Breaking'];
                    return (
                      <Link
                        key={story.slug}
                        href={`/blog/${story.slug}`}
                        className="group flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-lg font-bold text-muted-foreground/50 w-8 text-center">
                          {index + 7}
                        </span>
                        <span className="text-lg">{CATEGORY_EMOJI[story.category] || '📰'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {story.title}
                          </h3>
                          <span className={`text-xs ${colors.text}`}>{story.category}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{story.readingTime} min</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Chat + Extras (Desktop) */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-20 space-y-6">

              {/* Chat Section */}
              <div id="search">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold">🤖 Ask AI</h2>
                  <span className="text-xs text-muted-foreground">• Knows all trending topics</span>
                </div>
                <SearchBox />
              </div>

              {/* Ad Slot - Sidebar */}
              <AdPlaceholder id="201" format="rectangle" />

              {/* Interactive Trend Chart */}
              {trendingStories.length > 0 && (
                <TrendChart stories={trendingStories.map(s => ({
                  title: s.title,
                  slug: s.slug,
                  category: s.category,
                  publishedAt: s.publishedAt,
                }))} />
              )}

              {/* Category Quick Links */}
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-bold mb-3">🏷️ Browse Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_EMOJI).map(([cat, emoji]) => {
                    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Breaking'];
                    return (
                      <Link
                        key={cat}
                        href={`/blog/category/${cat.toLowerCase()}`}
                        className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-xs font-bold hover:shadow-md transition-all hover:scale-105`}
                      >
                        {emoji} {cat}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Slot - Full width */}
      <AdPlaceholder id="301" format="horizontal" className="container mx-auto px-4" />

      {/* About Section - Compact */}
      <section id="about" className="py-16 bg-gradient-to-br from-red-50/50 via-background to-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Why uni-uk.ai? 🚀
              </h2>
              <p className="text-lg text-muted-foreground">
                Your real-time window into what the world is talking about
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-card border rounded-xl p-5 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold mb-2">Real-Time</h3>
                <p className="text-sm text-muted-foreground">
                  Updated every 30 minutes with what&apos;s trending right now
                </p>
              </div>

              <div className="bg-card border rounded-xl p-5 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-bold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Explains WHY things are trending, not just what
                </p>
              </div>

              <div className="bg-card border rounded-xl p-5 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="font-bold mb-2">Ask Anything</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with our AI about any trending topic
                </p>
              </div>

              <div className="bg-card border rounded-xl p-5 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">🆓</div>
                <h3 className="font-bold mb-2">Always Free</h3>
                <p className="text-sm text-muted-foreground">
                  Everyone deserves to know what&apos;s happening
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-muted/50">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              All Stories
            </Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">
              Universities
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} uni-uk.ai • Powered by AI 🤖 • Updated every 30 minutes
          </p>
        </div>
      </footer>
    </main>
  );
}
