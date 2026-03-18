import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy | uni-uk.ai",
  description: "Our editorial standards, sourcing practices, AI transparency and corrections policy. Learn how uni-uk.ai produces accurate, trustworthy news content.",
  alternates: { canonical: "/editorial-policy" },
  openGraph: {
    title: "Editorial Policy | uni-uk.ai",
    description: "Our editorial standards, sourcing practices and AI transparency.",
    type: "website",
    url: "https://uni-uk.ai/editorial-policy",
    siteName: "uni-uk.ai",
  },
};

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://uni-uk.ai" },
        { name: "Editorial Policy", url: "https://uni-uk.ai/editorial-policy" },
      ]} />
      <MainNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">

          <header className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4">
              Editorial Policy
            </h1>
            <p className="font-body-serif text-lg text-muted-foreground leading-relaxed">
              How we source, produce and maintain the accuracy of our content.
            </p>
          </header>

          <div className="space-y-10">

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Our Sources</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  uni-uk.ai draws trending topic data from multiple verified sources to ensure we cover stories that are genuinely relevant and timely:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Google Trends</strong> — Real-time trending search data across the UK, US, Australia, Canada and India</li>
                  <li><strong>Reddit</strong> — Rapidly rising posts from news, technology, sports, cryptocurrency and UK-focused communities</li>
                  <li><strong>Verified news feeds</strong> — Related news articles from established outlets cited within Google Trends data</li>
                  <li><strong>Market data</strong> — Live cryptocurrency prices and market metrics from CoinGecko for our crypto coverage</li>
                </ul>
                <p>
                  A topic typically needs to appear across multiple sources before we generate coverage. Our trend aggregation system scores topics by cross-source presence, velocity (how fast they are rising) and traffic volume to prioritise the most significant stories.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">AI &amp; Human Collaboration</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Articles on uni-uk.ai are produced with the assistance of AI language models. We are fully transparent about this. Here is how AI fits into our editorial process:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>AI-assisted drafting</strong> — AI generates article drafts based on verified trending data and cited news sources. The AI is instructed to explain context, provide analysis and attribute information to its sources.</li>
                  <li><strong>Automated quality checks</strong> — Every generated article passes through validation for content length, category accuracy, deduplication against existing coverage, and relevance before publication.</li>
                  <li><strong>Editorial oversight</strong> — The editorial team reviews content quality, monitors for accuracy issues and makes corrections as needed.</li>
                  <li><strong>Continuous improvement</strong> — We regularly refine our AI prompts, validation rules and quality thresholds based on reader feedback and editorial review.</li>
                </ul>
                <p>
                  We do not present AI-generated content as human-written. Our byline reads "uni-uk.ai Newsroom" to reflect the collaborative nature of our content production.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Accuracy &amp; Corrections</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  We take accuracy seriously. While our AI-assisted process is designed to produce factual, well-sourced content, we acknowledge that errors can occur. Our commitment:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Prompt corrections</strong> — When we identify or are notified of an error, we correct it as quickly as possible. Significant corrections are noted within the article.</li>
                  <li><strong>Source attribution</strong> — Articles reference the news sources and data that informed them. Where possible, we link to original reporting.</li>
                  <li><strong>No fabrication</strong> — Our AI is instructed to work only with verified trending data and cited sources. It does not invent quotes, statistics or events.</li>
                </ul>
                <p>
                  If you spot an error in any article, please contact us at <a href="mailto:team@uni-uk.ai" className="font-semibold underline underline-offset-2">team@uni-uk.ai</a> and we will investigate and correct it promptly.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Independence</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  uni-uk.ai operates independently. Our trending topic selection is driven entirely by data — what people are actually searching for — not by commercial relationships, advertisers, or editorial bias. We do not accept payment for coverage or allow advertising to influence our editorial decisions.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Content Categories</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Our content is organised into clearly defined sections. Articles are categorised automatically based on topic analysis. Categories include Sports, Technology, Science, Entertainment, Culture, Business, Politics, Health, World and Breaking News.
                </p>
                <p>
                  We distinguish between news coverage (reporting on what is happening) and analysis (explaining why it matters). Our AI is instructed to be opinionated in analysis while remaining factual in reporting.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Contact Us</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed">
                <p>
                  For editorial enquiries, corrections or feedback: <a href="mailto:team@uni-uk.ai" className="font-semibold underline underline-offset-2">team@uni-uk.ai</a>
                </p>
                <p className="mt-2">
                  This policy was last updated on 18 March 2026.
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
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/editorial-policy" className="text-foreground font-semibold">Editorial Policy</Link>
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
