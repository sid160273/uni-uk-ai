import { MainNavigation } from "@/components/MainNavigation";
import { CryptoTicker } from "@/components/CryptoTicker";
import { CryptoDashboardClient } from "@/components/CryptoDashboardClient";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { fetchTopCoins, fetchTrendingCoins, formatPrice } from "@/lib/crypto-sources";
import { getCryptoPosts } from "@/lib/crypto-data";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crypto Dashboard | Live Prices, Trends & AI Analysis | uni-uk.ai",
  description:
    "Live cryptocurrency prices, trending coins, market analysis and AI-powered insights. Track Bitcoin, Ethereum, Solana and 20+ coins with real-time data.",
  keywords: [
    "crypto prices",
    "bitcoin price",
    "ethereum price",
    "cryptocurrency",
    "crypto market",
    "trending crypto",
    "crypto news",
    "live prices",
  ],
  alternates: { canonical: "/crypto" },
  openGraph: {
    title: "Crypto Dashboard | Live Prices & AI Analysis | uni-uk.ai",
    description: "Live crypto prices, trending coins and AI-powered market analysis. Updated every hour.",
    type: "website",
    url: "https://uni-uk.ai/crypto",
    siteName: "uni-uk.ai",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "uni-uk.ai Crypto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Dashboard | uni-uk.ai",
    description: "Live crypto prices and AI-powered market analysis.",
    images: ["/logo.png"],
  },
};

export default async function CryptoDashboard() {
  const [coins, trendingCoins, cryptoPosts] = await Promise.all([
    fetchTopCoins(20),
    fetchTrendingCoins(),
    getCryptoPosts(),
  ]);

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Crypto", url: "https://uni-uk.ai/crypto" },
  ];

  // Serialize coin data for client component (strip non-serializable fields)
  const serializedCoins = coins.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    current_price: c.current_price,
    price_change_percentage_24h: c.price_change_percentage_24h || 0,
    price_change_percentage_7d_in_currency: c.price_change_percentage_7d_in_currency || 0,
    market_cap: c.market_cap,
    total_volume: c.total_volume,
    sparkline_in_7d_price: c.sparkline_in_7d?.price?.slice(-24) || [],
  }));

  const serializedTrending = trendingCoins.slice(0, 6).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    thumb: c.thumb,
    large: c.large,
    market_cap_rank: c.market_cap_rank || 0,
  }));

  const serializedPosts = cryptoPosts.slice(0, 5).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coins: p.coins,
    readingTime: p.readingTime,
  }));

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Crypto Price Ticker */}
      {coins.length > 0 && (
        <CryptoTicker
          coins={coins.slice(0, 12).map((c) => ({
            symbol: c.symbol.toUpperCase(),
            name: c.name,
            price: formatPrice(c.current_price),
            change24h: c.price_change_percentage_24h || 0,
          }))}
        />
      )}

      {/* Hero */}
      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100 via-background to-background dark:from-yellow-900/20 pointer-events-none" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-yellow-700 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
            </span>
            Updated every hour
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Crypto Intelligence{" "}
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Dashboard
            </span>
            {" "}🪙
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick a coin, watch the chart, get AI insights — all in one place
          </p>
        </div>
      </section>

      {/* ═══ Interactive Dashboard (chart + table + chat all linked) ═══ */}
      <CryptoDashboardClient
        coins={serializedCoins}
        trendingCoins={serializedTrending}
        recentPosts={serializedPosts}
      />

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-4">
        <div className="bg-muted/50 border rounded-lg p-4 text-xs text-muted-foreground text-center">
          <strong>Disclaimer:</strong> uni-uk.ai provides information and analysis only, not financial advice.
          Cryptocurrency investments are volatile and carry risk. Always do your own research before making investment decisions.
          Data provided by CoinGecko.
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-muted/50">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Trending News</Link>
            <Link href="/crypto" className="hover:text-foreground transition-colors font-medium text-foreground">Crypto</Link>
            <Link href="/crypto/news" className="hover:text-foreground transition-colors">Crypto News</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} uni-uk.ai &bull; Powered by AI 🤖 &bull; Crypto data updated hourly
          </p>
        </div>
      </footer>
    </main>
  );
}
