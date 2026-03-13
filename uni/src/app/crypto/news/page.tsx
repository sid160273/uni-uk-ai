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
      <section className="py-10 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/crypto"
            className="text-[11px] font-semibold uppercase tracking-editorial text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Crypto News
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
              <h2 className="font-display text-xl font-bold mb-2">Crypto stories coming soon</h2>
              <p className="text-muted-foreground mb-4">
                Our AI is analysing the market. First stories will appear within the hour.
              </p>
              <Link
                href="/crypto"
                className="inline-flex items-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
              >
                View Live Prices
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-0 divide-y divide-border">
              {posts.map((post, i) => (
                <article key={post.slug} id={post.slug} className="scroll-mt-20 py-8 first:pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    {post.coins.slice(0, 4).map((coin) => (
                      <span
                        key={coin}
                        className="text-[10px] font-bold uppercase tracking-editorial text-destructive"
                      >
                        {coin}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground uppercase tracking-editorial ml-auto">
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="font-display text-xl md:text-2xl font-bold mb-3 leading-tight">{post.title}</h2>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>

                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display">
                    {post.content.split("\n").map((paragraph, idx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith("## ")) {
                        return <h3 key={idx} className="font-display text-lg font-semibold mt-4 mb-2">{trimmed.slice(3)}</h3>;
                      }
                      if (trimmed.startsWith("### ")) {
                        return <h4 key={idx} className="font-display text-base font-semibold mt-3 mb-1">{trimmed.slice(4)}</h4>;
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

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 border border-border text-muted-foreground text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-editorial">{post.readingTime} min read</span>
                  </div>

                  {/* Ad every 3 posts */}
                  {(i + 1) % 3 === 0 && <AdPlaceholder id={`5${i}`} format="horizontal" className="mt-8" />}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Want deeper crypto analysis?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our crypto AI assistant about any coin, market trend, or investment thesis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/crypto#chat"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-semibold text-sm uppercase tracking-editorial hover:opacity-80 transition-opacity"
            >
              Ask Crypto AI
            </Link>
            <Link
              href="/crypto"
              className="inline-flex items-center justify-center px-6 py-3 border border-border font-semibold text-sm uppercase tracking-editorial hover:bg-muted transition-colors"
            >
              Live Dashboard
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
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Stories</Link>
            <Link href="/crypto" className="hover:text-foreground transition-colors">Crypto</Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">Universities</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai. Crypto data updated hourly. Not financial advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
