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
  { label: "Bitcoin", query: "What's happening with Bitcoin right now?" },
  { label: "Ethereum", query: "Give me the latest on Ethereum" },
  { label: "Market", query: "How's the crypto market looking today?" },
  { label: "Trending", query: "Which coins are trending right now?" },
  { label: "Movers", query: "What are the biggest movers today?" },
  { label: "DeFi", query: "What's happening in DeFi?" },
];

// ── Main Component ──────────────────────────────────

export function CryptoDashboardClient({ coins, trendingCoins, recentPosts }: CryptoDashboardClientProps) {
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo | null>(coins[0] || null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CoinRecommendation[]>([]);
  const [chatState, setChatState] = useState<any>({});
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleCoinSelect = useCallback((coin: CoinInfo) => {
    setSelectedCoin(coin);
    const change = coin.price_change_percentage_24h;
    const direction = change >= 0 ? "up" : "down";
    sendMessage(`Tell me about ${coin.name} (${coin.symbol.toUpperCase()}). It's currently at ${formatPrice(coin.current_price)}, ${direction} ${Math.abs(change).toFixed(2)}% today. What's driving this and what should I know?`);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("chart")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(query);
  };

  // ── Chat Panel ──
  const chatPanel = (
    <div id="chat">
      <div className="border-b-2 border-foreground pb-2 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial">Crypto AI</h2>
          {selectedCoin && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-editorial flex items-center gap-1.5">
              <img src={selectedCoin.image} alt="" className="w-3.5 h-3.5 rounded-full" />
              Analysing {selectedCoin.name}
            </span>
          )}
        </div>
      </div>

      <div className="border border-border overflow-hidden">
        {messages.length > 0 && (
          <div className="max-h-[350px] lg:max-h-[400px] overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted"
                }`}>
                  {msg.role === "assistant" ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none [&_a]:underline"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                          .replace(/\n/g, "<br>"),
                      }}
                    />
                  ) : (
                    <span className="line-clamp-2 lg:line-clamp-none">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Analysing {selectedCoin?.name || "market"}...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {recommendations.map((coin) => (
              <button
                key={coin.id}
                onClick={() => {
                  const matched = coins.find(c => c.id === coin.id);
                  if (matched) handleCoinSelect(matched);
                }}
                className="shrink-0 border border-border px-3 py-2 text-xs flex items-center gap-2 hover:bg-muted cursor-pointer transition-colors"
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

        {messages.length === 0 && (
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">Crypto AI Assistant</p>
              <p className="text-xs text-muted-foreground">Click a coin in the table — instant analysis</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => sendMessage(topic.query)}
                  className="px-3 py-1.5 border border-border text-[10px] font-semibold uppercase tracking-editorial hover:bg-muted transition-all cursor-pointer"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            className="flex-1 bg-muted px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-foreground text-background px-4 py-2.5 text-xs font-bold uppercase tracking-editorial hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "..." : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══ HOW IT WORKS ═══ */}
      <section className="container mx-auto px-4 py-4">
        <div className="border border-border p-4">
          <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-foreground font-bold text-sm mb-1">1</div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-editorial">Pick a Coin</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Tap any coin below</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-foreground font-bold text-sm mb-1">2</div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-editorial">See the Chart</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Price graph updates</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-foreground font-bold text-sm mb-1">3</div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-editorial">AI Explains</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Instant analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CHART ═══ */}
      <section className="container mx-auto px-4 pb-4" id="chart">
        {selectedCoin && (
          <CryptoChart
            key={selectedCoin.id}
            coinId={selectedCoin.id}
            coinName={selectedCoin.name}
            coinSymbol={selectedCoin.symbol}
            currentPrice={selectedCoin.current_price}
            change24h={selectedCoin.price_change_percentage_24h}
          />
        )}
      </section>

      {/* ═══ MOBILE: Chat right after chart ═══ */}
      <section className="container mx-auto px-4 pb-4 lg:hidden">
        {chatPanel}
      </section>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* LEFT: Market Table */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Market Overview</h2>
                <div className="flex items-center gap-2">
                  {selectedCoin && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-editorial hidden md:inline-flex items-center gap-1">
                      <img src={selectedCoin.image} alt="" className="w-3.5 h-3.5 rounded-full" />
                      {selectedCoin.symbol.toUpperCase()}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground uppercase tracking-editorial">Tap a coin - GBP</span>
                </div>
              </div>

              <div className="border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-[10px] text-muted-foreground uppercase tracking-editorial">
                        <th className="text-left p-3 font-semibold">#</th>
                        <th className="text-left p-3 font-semibold">Coin</th>
                        <th className="text-right p-3 font-semibold">Price</th>
                        <th className="text-right p-3 font-semibold">24h</th>
                        <th className="text-right p-3 font-semibold hidden md:table-cell">7d</th>
                        <th className="text-right p-3 font-semibold hidden lg:table-cell">Mkt Cap</th>
                        <th className="text-right p-3 font-semibold hidden md:table-cell">7d</th>
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
                                ? "bg-muted border-l-2 border-l-foreground"
                                : "hover:bg-muted/30 border-l-2 border-l-transparent"
                            }`}
                          >
                            <td className="p-3 text-muted-foreground text-xs font-medium">
                              {i + 1}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                                <div>
                                  <span className={`font-bold text-sm ${isSelected ? "text-foreground" : ""}`}>
                                    {coin.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground ml-1.5 uppercase">{coin.symbol}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-sm">{formatPrice(coin.current_price)}</td>
                            <td className={`p-3 text-right text-xs font-semibold ${change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                            </td>
                            <td className={`p-3 text-right text-xs font-semibold hidden md:table-cell ${change7d >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {change7d >= 0 ? "+" : ""}{change7d.toFixed(2)}%
                            </td>
                            <td className="p-3 text-right hidden lg:table-cell text-xs text-muted-foreground">
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

            {trendingCoins.length > 0 && (
              <div>
                <div className="border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Trending Coins</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trendingCoins.slice(0, 6).map((tc, i) => {
                    const matchedCoin = coins.find(c => c.id === tc.id);
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          if (matchedCoin) handleCoinSelect(matchedCoin);
                          else sendMessage(`Tell me about ${tc.name} (${tc.symbol.toUpperCase()}). It's trending right now — what's going on?`);
                        }}
                        className={`border border-border p-3 hover:bg-muted transition-all text-left cursor-pointer ${
                          selectedCoin?.id === tc.id ? "bg-muted border-foreground" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img src={tc.large || tc.thumb} alt={tc.name} className="w-7 h-7 rounded-full" />
                          <div>
                            <p className="font-bold text-xs">{tc.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{tc.symbol}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Rank #{tc.market_cap_rank || "?"}</span>
                          <span className="text-[10px] font-bold uppercase tracking-editorial text-destructive">#{i + 1}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <AdPlaceholder id="402" format="horizontal" />

            {recentPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between border-b-2 border-foreground pb-2 mb-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-editorial">Crypto News</h2>
                  <Link href="/crypto/news" className="text-[10px] font-bold uppercase tracking-editorial hover:underline">See all</Link>
                </div>
                <div className="divide-y divide-border">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/crypto/news#${post.slug}`}
                      className="group flex gap-4 py-3 first:pt-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.coins.slice(0, 3).map((coin) => (
                            <span key={coin} className="text-[10px] font-bold uppercase tracking-editorial text-destructive">{coin}</span>
                          ))}
                        </div>
                        <h3 className="font-semibold text-sm group-hover:underline decoration-1 underline-offset-2 line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.excerpt}</p>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-editorial mt-1 inline-block">{post.readingTime} min read</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Desktop chat + extras */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="lg:sticky lg:top-20 space-y-6">
              {chatPanel}

              <AdPlaceholder id="403" format="rectangle" />

              {coins.length >= 3 && (
                <div className="border border-border p-4">
                  <div className="border-b border-border pb-2 mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-editorial">Quick Stats</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {coins.slice(0, 5).map((coin) => {
                      const isSelected = selectedCoin?.id === coin.id;
                      return (
                        <button
                          key={coin.id}
                          onClick={() => handleCoinSelect(coin)}
                          className={`w-full flex items-center justify-between py-2.5 transition-all cursor-pointer ${
                            isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
                            <span className="text-xs font-bold uppercase">
                              {coin.symbol}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono">{formatPrice(coin.current_price)}</span>
                            <span className={`text-[10px] ml-2 font-semibold ${
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

              <div className="border border-border p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground mb-2">Also on uni-uk.ai</p>
                <Link href="/" className="inline-flex items-center px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-editorial hover:opacity-80 transition-opacity">
                  Trending News
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
