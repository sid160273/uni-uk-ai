import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { getCryptoPosts } from "@/lib/crypto-data";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crypto News & Market Analysis | uni-uk.ai",
  description: "AI-powered cryptocurrency news and market analysis. Bitcoin, Ethereum, Solana and more — updated every hour with expert insights.",
  keywords: ["crypto news", "bitcoin news", "cryptocurrency analysis", "market analysis", "crypto updates"],
  alternates: { canonical: "/crypto/news" },
  openGraph: {
    title: "Crypto News & Market Analysis | uni-uk.ai",
    description: "AI-powered crypto market analysis updated every hour.",
    type: "website",
    url: "https://uni-uk.ai/crypto/news",
    siteName: "uni-uk.ai",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai Crypto News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto News & Market Analysis | uni-uk.ai",
    description: "AI-powered cryptocurrency news and market analysis. Bitcoin, Ethereum, Solana and more — updated every hour.",
    images: ["/logo.png"],
  },
};

export default async function CryptoNewsPage() {
  const posts = await getCryptoPosts();

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Crypto", url: "https://uni-uk.ai/crypto" },
    { name: "News", url: "https://uni-uk.ai/crypto/news" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-yellow-50 via-background to-orange-50/30 dark:from-yellow-950/20 dark:via-background dark:to-orange-950/20">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/crypto"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Crypto News 📰
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered market analysis and crypto stories — updated every hour
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🪙</div>
              <h2 className="text-xl font-bold mb-2">Crypto stories coming soon!</h2>
              <p className="text-muted-foreground mb-4">
                Our AI is analysing the market. First stories will appear within the hour.
              </p>
              <Link
                href="/crypto"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                View Live Prices
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {posts.map((post, i) => (
                <article key={post.slug} id={post.slug} className="scroll-mt-20">
                  <div className="bg-card border-l-4 border-l-yellow-500 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      {post.coins.slice(0, 4).map((coin) => (
                        <span
                          key={coin}
                          className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full"
                        >
                          {coin}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-3">{post.title}</h2>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {post.content.split("\n").map((paragraph, idx) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        if (trimmed.startsWith("## ")) {
                          return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{trimmed.slice(3)}</h3>;
                        }
                        if (trimmed.startsWith("### ")) {
                          return <h4 key={idx} className="text-base font-semibold mt-3 mb-1">{trimmed.slice(4)}</h4>;
                        }
                        if (trimmed.startsWith("- ")) {
                          return <li key={idx} className="ml-4 text-muted-foreground text-sm">{trimmed.slice(2)}</li>;
                        }
                        return (
                          <p key={idx} className="text-muted-foreground text-sm leading-relaxed my-2">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">📖 {post.readingTime} min read</span>
                    </div>
                  </div>

                  {/* Ad every 3 posts */}
                  {(i + 1) % 3 === 0 && <AdPlaceholder id={`5${i}`} format="horizontal" />}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want deeper crypto analysis?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our crypto AI assistant about any coin, market trend, or investment thesis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/crypto#chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              🤖 Ask Crypto AI
            </Link>
            <Link
              href="/crypto"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              📊 Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-muted/50">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Trending News</Link>
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} uni-uk.ai &bull; Crypto data updated hourly &bull; Not financial advice
          </p>
        </div>
      </footer>
    </main>
  );
}
