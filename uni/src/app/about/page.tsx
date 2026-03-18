import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About uni-uk.ai | Universal News Intelligence",
  description: "uni-uk.ai is an AI-powered news intelligence platform covering sport, tech, crypto, entertainment, business and UK universities. Learn how we work.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About uni-uk.ai | Universal News Intelligence",
    description: "AI-powered news intelligence across every section, updated every 10 minutes.",
    type: "website",
    url: "https://uni-uk.ai/about",
    siteName: "uni-uk.ai",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://uni-uk.ai" },
        { name: "About", url: "https://uni-uk.ai/about" },
      ]} />
      <MainNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">

          <header className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4">
              About uni-uk.ai
            </h1>
            <p className="font-body-serif text-lg text-muted-foreground leading-relaxed">
              Universal News Intelligence — AI-powered news across sport, tech, crypto, entertainment, business and more. Updated every 10 minutes.
            </p>
          </header>

          <div className="prose-editorial space-y-10">

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Our Mission</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  uni-uk.ai exists to make news accessible, free, and intelligent. We believe everyone deserves to understand what is happening in the world right now — without paywalls, without information overload, and without having to check a dozen different sources.
                </p>
                <p>
                  We combine artificial intelligence with verified news sources to deliver clear, insightful stories on what people are actually searching for. From Premier League transfers to crypto market moves, from tech breakthroughs to Westminster drama — we cover it all, updated every 10 minutes.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">How We Work</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Our newsroom combines AI technology with editorial processes to deliver trending stories at speed. Here is how a story goes from trending topic to published article:
                </p>
                <ol className="list-decimal list-inside space-y-3 pl-2">
                  <li><strong>Trend detection</strong> — We monitor multiple data sources including Google Trends, Reddit, and verified news feeds across the UK, US, Australia, Canada and India in real-time to identify what people are searching for right now.</li>
                  <li><strong>Cross-source validation</strong> — A topic must appear across multiple sources before we cover it. We score trends by velocity (how fast they are rising), traffic volume, and cross-platform presence to filter signal from noise.</li>
                  <li><strong>AI-assisted writing</strong> — Our AI generates draft articles that explain why a topic is trending, incorporating context from verified news sources. Every article attributes its sources.</li>
                  <li><strong>Quality checks</strong> — Generated articles pass through validation including content length, category accuracy, deduplication against existing coverage, and image relevance before publication.</li>
                  <li><strong>Continuous updates</strong> — The cycle repeats every 10 minutes, ensuring our coverage stays current as stories develop.</li>
                </ol>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Our Sections</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-3">
                <p>We cover the topics people care about most:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><Link href="/sport" className="font-semibold underline underline-offset-2">Sport</Link> — Football, F1, tennis, boxing, cricket and more</li>
                  <li><Link href="/tech" className="font-semibold underline underline-offset-2">Tech &amp; AI</Link> — Technology, science, startups and AI breakthroughs</li>
                  <li><Link href="/entertainment" className="font-semibold underline underline-offset-2">Entertainment</Link> — Celebrity, TV, film, music and pop culture</li>
                  <li><Link href="/business" className="font-semibold underline underline-offset-2">Business &amp; Markets</Link> — Economy, markets, politics and corporate news</li>
                  <li><Link href="/crypto" className="font-semibold underline underline-offset-2">Crypto</Link> — Live prices, market analysis and trending coins</li>
                  <li><Link href="/universities" className="font-semibold underline underline-offset-2">Universities</Link> — Rankings, guides and profiles for 140+ UK universities</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">AI Transparency</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  We are transparent about our use of AI. Articles on uni-uk.ai are generated with the assistance of large language models, using verified trending data and news source context as inputs. We believe AI is a powerful tool for making news more accessible — but it is a tool, not a replacement for editorial judgement.
                </p>
                <p>
                  For full details on our editorial standards, sourcing practices, and corrections policy, see our <Link href="/editorial-policy" className="font-semibold underline underline-offset-2">Editorial Policy</Link>.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Contact</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed">
                <p>
                  Questions, feedback, or corrections? Reach us at <a href="mailto:team@uni-uk.ai" className="font-semibold underline underline-offset-2">team@uni-uk.ai</a> or visit our <Link href="/contact" className="font-semibold underline underline-offset-2">Contact page</Link>.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="font-display text-xl font-bold">
            uni-uk<span className="text-destructive">.ai</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="text-foreground font-semibold">About</Link>
            <Link href="/editorial-policy" className="hover:text-foreground transition-colors">Editorial Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai &middot; Universal News Intelligence
          </p>
        </div>
      </footer>
    </main>
  );
}
