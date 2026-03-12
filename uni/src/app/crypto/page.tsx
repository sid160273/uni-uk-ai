import { MainNavigation } from "@/components/MainNavigation";
import { CryptoTicker } from "@/components/CryptoTicker";
import { CryptoChart } from "@/components/CryptoChart";
import { MiniSparkline } from "@/components/CryptoChart";
import { CryptoSearchBox } from "@/components/CryptoSearchBox";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { fetchTopCoins, fetchTrendingCoins, formatPrice, formatLargeNumber } from "@/lib/crypto-sources";
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

  const topCoin = coins[0];
  const recentPosts = cryptoPosts.slice(0, 5);

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Crypto", url: "https://uni-uk.ai/crypto" },
  ];

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
            Live prices, trending coins and AI-powered analysis — your one-stop crypto command centre
          </p>
        </div>
      </section>

      {/* Bitcoin Chart - Full Width */}
      {topCoin && (
        <section className="container mx-auto px-4 pb-6">
          <CryptoChart
            coinId={topCoin.id}
            coinName={topCoin.name}
            coinSymbol={topCoin.symbol}
            currentPrice={topCoin.current_price}
            change24h={topCoin.price_change_percentage_24h}
          />
        </section>
      )}

      {/* Main Content: Two columns */}
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* LEFT: Market Data */}
          <div className="lg:col-span-7 space-y-6">

            {/* Top Coins Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📊 Market Overview</h2>
                <span className="text-xs text-muted-foreground">Prices in GBP</span>
              </div>

              <div className="bg-card border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Coin</th>
                        <th className="text-right p-3 font-medium">Price</th>
                        <th className="text-right p-3 font-medium">24h</th>
                        <th className="text-right p-3 font-medium hidden md:table-cell">7d</th>
                        <th className="text-right p-3 font-medium hidden lg:table-cell">Market Cap</th>
                        <th className="text-right p-3 font-medium hidden md:table-cell">7d Chart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coins.map((coin, i) => {
                        const change24h = coin.price_change_percentage_24h || 0;
                        const change7d = coin.price_change_percentage_7d_in_currency || 0;
                        return (
                          <tr key={coin.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 text-muted-foreground font-medium">{i + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                <div>
                                  <span className="font-bold">{coin.name}</span>
                                  <span className="text-xs text-muted-foreground ml-1.5">{coin.symbol.toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-medium">{formatPrice(coin.current_price)}</td>
                            <td className={`p-3 text-right font-medium ${change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change24h >= 0 ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}%
                            </td>
                            <td className={`p-3 text-right font-medium hidden md:table-cell ${change7d >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change7d >= 0 ? "▲" : "▼"} {Math.abs(change7d).toFixed(2)}%
                            </td>
                            <td className="p-3 text-right hidden lg:table-cell text-muted-foreground">
                              {formatLargeNumber(coin.market_cap)}
                            </td>
                            <td className="p-3 text-right hidden md:table-cell">
                              <div className="flex justify-end">
                                <MiniSparkline
                                  data={coin.sparkline_in_7d?.price?.slice(-24) || []}
                                  positive={change7d >= 0}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <AdPlaceholder id="401" format="horizontal" />

            {/* Trending Coins */}
            {trendingCoins.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">🔥 Trending Coins</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trendingCoins.slice(0, 6).map((coin, i) => (
                    <div
                      key={coin.id}
                      className="bg-card border rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img src={coin.large || coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-bold text-sm">{coin.name}</p>
                          <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Rank #{coin.market_cap_rank || "?"}</span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          🔥 #{i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AdPlaceholder id="402" format="horizontal" />

            {/* Crypto News */}
            {recentPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">📰 Crypto News</h2>
                  <Link href="/crypto/news" className="text-sm text-primary hover:underline font-medium">
                    See all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/crypto/news#${post.slug}`}
                      className="group flex gap-4 bg-card border-l-4 border-l-yellow-500 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.coins.slice(0, 3).map((coin) => (
                            <span
                              key={coin}
                              className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full"
                            >
                              {coin}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                        <span className="text-xs text-primary font-medium mt-1 inline-block">
                          📖 {post.readingTime} min read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Chat + Extras */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-20 space-y-6">

              {/* Chat */}
              <div id="chat">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold">🤖 Crypto AI</h2>
                  <span className="text-xs text-muted-foreground">• Live market data</span>
                </div>
                <CryptoSearchBox />
              </div>

              <AdPlaceholder id="403" format="rectangle" />

              {/* Quick Stats */}
              {coins.length >= 3 && (
                <div className="bg-card border rounded-xl p-5">
                  <h3 className="font-bold mb-3">⚡ Quick Stats</h3>
                  <div className="space-y-3">
                    {coins.slice(0, 5).map((coin) => (
                      <div key={coin.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                          <span className="text-sm font-medium">{coin.symbol.toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono">{formatPrice(coin.current_price)}</span>
                          <span
                            className={`text-xs ml-2 ${
                              (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                            {(coin.price_change_percentage_24h || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to main site */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border rounded-xl p-5 text-center">
                <p className="text-sm font-medium mb-2">Also on uni-uk.ai</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  🔥 Trending News
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

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
