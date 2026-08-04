"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { University } from "@/lib/data";
import { CLEARING_SCENARIOS } from "@/lib/clearing";
import { cn } from "@/lib/utils";

/** Google Ads conversion action for chat engagement. */
const ADS_CONVERSION = "AW-17796654538/RxBECK6d2s8bEMrLjaZC";
/** Messages after which we consider the student meaningfully engaged. */
const COMPLETION_THRESHOLD = 5;

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatState {
  course?: string;
  isInternational?: boolean;
  country?: string;
  achievedGrades?: string;
  predictedGrades?: string;
  location?: string;
  situation?: string;
  sports?: boolean;
  nightlife?: boolean;
}

type Gtag = (command: string, ...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof fn === "function" ? fn : null;
}

const OPENING_MESSAGE: Message = {
  role: "ai",
  content:
    "Hi — I'm here to help you find a place through Clearing.\n\nTell me where you are right now: did you **miss your grades**, are you **holding no offers**, or did you do **better than expected**? If you'd rather just start with the course, that works too.",
};

/** Conversation openers matched to the three real results-day situations. */
const STARTERS = CLEARING_SCENARIOS.map((s) => s.situation);

export function ClearingAdviser() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [chatState, setChatState] = useState<ChatState>({});
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Correlate Google Ads clicks with chat engagement.
  useEffect(() => {
    const gclid = new URLSearchParams(window.location.search).get("gclid");
    if (!gclid) return;
    sessionStorage.setItem("adsClickId", gclid);
    gtag()?.("event", "ads_driven_visit", {
      gclid,
      landing_page: window.location.pathname,
    });
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const history = messages;
      const count = messageCount + 1;

      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setQuery("");
      setMessageCount(count);
      setIsLoading(true);

      // Engagement conversion, once per session.
      if (count === 1 && !sessionStorage.getItem("chatConversionFired")) {
        gtag()?.("event", "conversion", {
          send_to: ADS_CONVERSION,
          value: 1.0,
          currency: "GBP",
        });
        sessionStorage.setItem("chatConversionFired", "true");
      }

      // Higher-value conversion once the conversation is genuinely underway.
      if (
        count === COMPLETION_THRESHOLD &&
        !sessionStorage.getItem("chatCompletedConversion")
      ) {
        const adsClickId = sessionStorage.getItem("adsClickId");
        gtag()?.("event", "conversion", {
          send_to: ADS_CONVERSION,
          value: 5.0,
          currency: "GBP",
        });
        if (adsClickId) {
          gtag()?.("event", "ads_chat_completion", {
            gclid: adsClickId,
            value: 5.0,
            currency: "GBP",
          });
        }
        sessionStorage.setItem("chatCompletedConversion", "true");
      }

      void fetch("/api/log-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "USER",
          messageNumber: count,
          userMessage: trimmed,
          chatState,
        }),
      }).catch(() => {});

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, chatState, history }),
        });

        if (!response.ok) throw new Error(`Adviser responded ${response.status}`);
        const data = await response.json();

        setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
        if (data.newState) setChatState(data.newState);
        if (data.recommendations?.length) setRecommendations(data.recommendations);

        void fetch("/api/log-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageType: "AI",
            messageNumber: count,
            aiMessage: data.message,
            chatState: data.newState,
            recommendationsCount: data.recommendations?.length ?? 0,
          }),
        }).catch(() => {});
      } catch (error) {
        console.error("Clearing adviser failed:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "Sorry — something went wrong at my end. Try again in a moment. If it keeps failing, you can browse universities directly at [/universities](/universities), or call UCAS on 0371 468 0468.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatState, isLoading, messageCount, messages]
  );

  return (
    <div className="border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-editorial">
            Clearing adviser
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-editorial text-muted-foreground">
          140 UK universities
        </span>
      </div>

      {/* Transcript */}
      <div className="max-h-[420px] overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 shrink-0 flex items-center justify-center border border-border",
                message.role === "ai"
                  ? "bg-foreground text-background"
                  : "bg-muted"
              )}
            >
              {message.role === "ai" ? (
                <Bot className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={cn(
                "font-body-serif text-sm leading-relaxed max-w-[85%]",
                message.role === "user" &&
                  "bg-muted px-3 py-2 text-right font-sans"
              )}
            >
              {message.role === "ai" ? (
                <div className="prose-clearing">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <Link
                          href={href ?? "#"}
                          className="underline underline-offset-2 font-semibold hover:text-destructive"
                        >
                          {children}
                        </Link>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
                      ),
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-muted-foreground">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center border border-border bg-foreground text-background">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Checking the database…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starters */}
      {messageCount === 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {STARTERS.map((starter) => (
            <button
              key={starter}
              onClick={() => void send(starter)}
              className="px-3 py-1.5 border border-border text-xs hover:bg-muted transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(query);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. I got BBC and wanted to study law"
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          disabled={isLoading}
          aria-label="Ask the Clearing adviser"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-foreground text-background px-4 py-2 text-[11px] font-bold uppercase tracking-editorial disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Ask
        </button>
      </form>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t border-border p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-3">
            Universities to call
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((uni) => (
              <Link
                key={uni.id}
                href={`/universities/${uni.slug}`}
                className="block border border-border p-3 hover:border-foreground transition-colors"
              >
                <div className="font-display font-bold leading-tight mb-1">
                  {uni.name}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {uni.location}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-editorial text-muted-foreground">
                  {uni.rankings?.guardian ? (
                    <span>Guardian #{uni.rankings.guardian}</span>
                  ) : null}
                  {uni.rankings?.nss ? <span>NSS {uni.rankings.nss}%</span> : null}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Course availability changes hour by hour. Always confirm directly
            with the university before adding a Clearing choice.
          </p>
        </div>
      )}
    </div>
  );
}
