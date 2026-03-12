"use client";

import { useState, useRef, useEffect } from "react";

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

interface CoinRecommendation {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change24h: number;
}

export function CryptoSearchBox() {
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

  const sendMessage = async (text: string) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(query);
  };

  return (
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
                  <span className="text-xs text-muted-foreground">Analysing market...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Coin recommendations */}
      {recommendations.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {recommendations.map((coin) => (
            <div
              key={coin.id}
              className="shrink-0 bg-muted rounded-lg px-3 py-2 text-xs flex items-center gap-2"
            >
              <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
              <span className="font-bold">{coin.symbol}</span>
              <span>£{coin.price.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</span>
              <span className={coin.change24h >= 0 ? "text-green-600" : "text-red-600"}>
                {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Welcome state with quick topics */}
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
              <p className="text-xs text-muted-foreground">Ask me about any coin or market trend</p>
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
  );
}
