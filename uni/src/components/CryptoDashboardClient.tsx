"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CryptoChart, MiniSparkline } from "./CryptoChart";
import { AdPlaceholder } from "./AdPlaceholder";
import Link from "next/link";

// ── Types ──────────────────────────────────────────

interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d_price: number[];
}

interface TrendingCoinInfo {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
  market_cap_rank: number;
}

interface CryptoPostInfo {
  slug: string;
  title: string;
  excerpt: string;
  coins: string[];
  readingTime: number;
}

interface CoinRecommendation {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change24h: number;
}

interface CryptoDashboardClientProps {
  coins: CoinInfo[];
  trendingCoins: TrendingCoinInfo[];
  recentPosts: CryptoPostInfo[];
}

// ── Helpers ──────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1) return `£${price.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `£${price.toFixed(4)}`;
  return `£${price.toFixed(8)}`;
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `£${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `£${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `£${(num / 1e6).toFixed(2)}M`;
  return `£${num.toFixed(2)}`;
}

// ── Chat Constants ──────────────────────────────────

const PLACEHOLDERS = [
  "What's happening with Bitcoin?",
  "Why is Ethereum pumping?",
  "Should I look into Solana?",
  "What's the market sentiment?",
  "Which coins are trending?",
  "Tell me about DeFi",
];

const QUICK_TOPICS = [
  { label: "🪙 Bitcoin", query: "What's happening with Bitcoin right now?" },
  { label: "💎 Ethereum", query: "Give me the latest on Ethereum" },
  { label: "📊 Market", query: "How's the crypto market looking today?" },
  { label: "🔥 Hot Coins", query: "Which coins are trending right now?" },
  { label: "🚀 Movers", query: "What are the biggest movers today?" },
  { label: "💡 DeFi", query: "What's happening in DeFi?" },
];

// ── Main Component ──────────────────────────────────

export function CryptoDashboardClient({ coins, trendingCoins, recentPosts }: CryptoDashboardClientProps) {
  // Shared state: which coin is selected
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo | null>(coins[0] || null);

  // Chat state
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CoinRecommendation[]>([]);
  const [chatState, setChatState] = useState<any>({});
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // Cycle placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send chat message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/crypto/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, chatState }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Try again!" }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.newState) setChatState(data.newState);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue. Please try again." }]);
    }
    setIsLoading(false);
  }, [isLoading, chatState]);

  // ── The magic: click a coin → update chart + auto-chat ──
  const handleCoinSelect = useCallback((coin: CoinInfo) => {
    setSelectedCoin(coin);

    // Auto-ask the AI about this coin
    const change = coin.price_change_percentage_24h;
    const direction = change >= 0 ? "up" : "down";
    const prompt = `Tell me about ${coin.name} (${coin.symbol.toUpperCase()}). It's currently at ${formatPrice(coin.current_price)}, ${direction} ${Math.abs(change).toFixed(2)}% today. What's driving this and what should I know?`;
    sendMessage(prompt);

    // Scroll to chat on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(query);
  };

  return (
    <>
      {/* ═══ CHART (switches when you click a coin) ═══ */}
      <section className="container mx-auto px-4 pb-6">
        {selectedCoin && (
          <CryptoChart
            key={selectedCoin.id} // force remount on coin change
            coinId={selectedCoin.id}
            coinName={selectedCoin.name}
            coinSymbol={selectedCoin.symbol}
            currentPrice={selectedCoin.current_price}
            change24h={selectedCoin.price_change_percentage_24h}
          />
        )}
        {/* Hint */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            👆 Click any coin below to view its chart &amp; get AI analysis
          </span>
        </div>
      </section>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* ── LEFT: Market Table ── */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📊 Market Overview</h2>
                <span className="text-xs text-muted-foreground">Click a coin to explore • Prices in GBP</span>
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
                        const isSelected = selectedCoin?.id === coin.id;
                        return (
                          <tr
                            key={coin.id}
                            onClick={() => handleCoinSelect(coin)}
                            className={`border-b last:border-0 cursor-pointer transition-all ${
                              isSelected
                                ? "bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-500"
                                : "hover:bg-muted/30 border-l-4 border-l-transparent"
                            }`}
                          >
                            <td className="p-3 text-muted-foreground font-medium">
                              {isSelected && <span className="mr-1">▶</span>}
                              {i + 1}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                <div>
                                  <span className={`font-bold ${isSelected ? "text-yellow-700 dark:text-yellow-400" : ""}`}>
                                    {coin.name}
                                  </span>
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
                                  data={coin.sparkline_in_7d_price?.slice(-24) || []}
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

            {/* Trending Coins — also clickable */}
            {trendingCoins.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">🔥 Trending Coins</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trendingCoins.slice(0, 6).map((tc, i) => {
                    // Find matching coin in our top coins list
                    const matchedCoin = coins.find(c => c.id === tc.id);
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          if (matchedCoin) {
                            handleCoinSelect(matchedCoin);
                          } else {
                            // If not in top 20, just ask the AI
                            sendMessage(`Tell me about ${tc.name} (${tc.symbol.toUpperCase()}). It's trending right now — what's going on?`);
                          }
                        }}
                        className={`bg-card border rounded-xl p-4 hover:shadow-md transition-all text-left cursor-pointer ${
                          selectedCoin?.id === tc.id ? "ring-2 ring-yellow-500 bg-yellow-50/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img src={tc.large || tc.thumb} alt={tc.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="font-bold text-sm">{tc.name}</p>
                            <p className="text-xs text-muted-foreground">{tc.symbol.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Rank #{tc.market_cap_rank || "?"}</span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            🔥 #{i + 1}
                          </span>
                        </div>
                      </button>
                    );
                  })}
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
                            <span key={coin} className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                              {coin}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                        <span className="text-xs text-primary font-medium mt-1 inline-block">📖 {post.readingTime} min read</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: AI Chat (connected) ── */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-20 space-y-6">

              <div id="chat" ref={chatSectionRef}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold">🤖 Crypto AI</h2>
                  <span className="text-xs text-muted-foreground">• Live market data</span>
                  {selectedCoin && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Viewing: {selectedCoin.symbol.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="bg-card border rounded-xl overflow-hidden">
                  {/* Chat messages */}
                  {messages.length > 0 && (
                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                              : "bg-muted"
                          }`}>
                            {msg.role === "assistant" ? (
                              <div
                                className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-yellow-600 [&_a]:underline"
                                dangerouslySetInnerHTML={{
                                  __html: msg.content
                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                                    .replace(/\n/g, "<br>"),
                                }}
                              />
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-2xl px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                              <span className="text-xs text-muted-foreground">Analysing {selectedCoin?.name || "market"}...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  {/* Coin recommendations from AI */}
                  {recommendations.length > 0 && (
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                      {recommendations.map((coin) => (
                        <button
                          key={coin.id}
                          onClick={() => {
                            const matched = coins.find(c => c.id === coin.id);
                            if (matched) handleCoinSelect(matched);
                          }}
                          className="shrink-0 bg-muted rounded-lg px-3 py-2 text-xs flex items-center gap-2 hover:bg-muted/80 cursor-pointer transition-colors"
                        >
                          <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
                          <span className="font-bold">{coin.symbol}</span>
                          <span>£{coin.price.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</span>
                          <span className={coin.change24h >= 0 ? "text-green-600" : "text-red-600"}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Welcome state */}
                  {messages.length === 0 && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="text-2xl">🪙</span>
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Crypto AI Assistant</p>
                          <p className="text-xs text-muted-foreground">Click a coin or ask me anything</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_TOPICS.map((topic) => (
                          <button
                            key={topic.label}
                            onClick={() => sendMessage(topic.query)}
                            className="px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800 hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                          >
                            {topic.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={PLACEHOLDERS[placeholderIndex]}
                      className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder:text-muted-foreground"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isLoading ? "..." : "Ask"}
                    </button>
                  </form>
                </div>
              </div>

              <AdPlaceholder id="403" format="rectangle" />

              {/* Quick Stats — also clickable */}
              {coins.length >= 3 && (
                <div className="bg-card border rounded-xl p-5">
                  <h3 className="font-bold mb-3">⚡ Quick Stats</h3>
                  <div className="space-y-2">
                    {coins.slice(0, 5).map((coin) => {
                      const isSelected = selectedCoin?.id === coin.id;
                      return (
                        <button
                          key={coin.id}
                          onClick={() => handleCoinSelect(coin)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                            isSelected ? "bg-yellow-50 dark:bg-yellow-950/30" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                            <span className={`text-sm font-medium ${isSelected ? "text-yellow-700 dark:text-yellow-400" : ""}`}>
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono">{formatPrice(coin.current_price)}</span>
                            <span className={`text-xs ml-2 ${
                              (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                              {(coin.price_change_percentage_24h || 0).toFixed(1)}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Back to main */}
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
    </>
  );
}
