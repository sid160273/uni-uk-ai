"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Send, User, Bot, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatState {
    topicsDiscussed?: string[];
}

interface Message {
    role: "user" | "ai";
    content: string;
}

const QUICK_TOPICS = [
    { label: "What's trending?", emoji: "\uD83D\uDD25", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
    { label: "Sports news", emoji: "\u26BD", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { label: "Entertainment", emoji: "\uD83C\uDFAC", color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100" },
    { label: "Politics", emoji: "\uD83C\uDFDB\uFE0F", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
    { label: "Tech", emoji: "\uD83D\uDCBB", color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100" },
    { label: "World news", emoji: "\uD83C\uDF0D", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
];

const PLACEHOLDERS = [
    "Ask about any trending topic...",
    "What's the latest in sports?",
    "Why is everyone talking about...",
];

const CATEGORY_COLORS: Record<string, string> = {
    Sports: "border-l-blue-500",
    Entertainment: "border-l-pink-500",
    Politics: "border-l-purple-500",
    Technology: "border-l-cyan-500",
    Tech: "border-l-cyan-500",
    World: "border-l-amber-500",
    Business: "border-l-green-500",
    Science: "border-l-teal-500",
    Health: "border-l-emerald-500",
};

const CATEGORY_EMOJIS: Record<string, string> = {
    Sports: "\u26BD",
    Entertainment: "\uD83C\uDFAC",
    Politics: "\uD83C\uDFDB\uFE0F",
    Technology: "\uD83D\uDCBB",
    Tech: "\uD83D\uDCBB",
    World: "\uD83C\uDF0D",
    Business: "\uD83D\uDCBC",
    Science: "\uD83D\uDD2C",
    Health: "\uD83C\uDFE5",
    Trending: "\uD83D\uDD25",
};

export function SearchBox() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Hey! I'm your AI news assistant, here to help you understand what's trending right now.\n\nAsk me about any topic in the news, or just say **\"what's trending?\"** and I'll catch you up on the biggest stories everyone is searching for.\n\nWhat would you like to know about?"
        }
    ]);
    const [chatState, setChatState] = useState<ChatState>({});
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cycle through placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Load progress from sessionStorage on mount
    useEffect(() => {
        const savedCount = sessionStorage.getItem('chatProgressCount');
        if (savedCount) {
            setUserMessageCount(parseInt(savedCount, 10));
        }
    }, []);

    // Track Google Click ID (gclid) for ads correlation
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const gclid = urlParams.get('gclid');

            if (gclid) {
                // Store gclid in sessionStorage for correlation with chat completion
                sessionStorage.setItem('adsClickId', gclid);

                // Track ads-driven visit in Google Analytics
                // @ts-ignore
                if (typeof window.gtag !== 'undefined') {
                    // @ts-ignore
                    window.gtag('event', 'ads_driven_visit', {
                        gclid: gclid,
                        landing_page: window.location.pathname,
                    });
                }
            }
        }
    }, []);

    const scrollToLatestMessage = () => {
        if (messages.length > 1 && messagesEndRef.current) {
            const chatContainer = messagesEndRef.current.parentElement;
            if (chatContainer) {
                requestAnimationFrame(() => {
                    // Scroll to bottom to show the latest message
                    chatContainer.scrollTop = chatContainer.scrollHeight;

                    // Small delay to let the DOM update, then scroll the latest AI message into view at the top
                    setTimeout(() => {
                        const allMessages = chatContainer.querySelectorAll('[data-message]');
                        const latestAiMessage = Array.from(allMessages).reverse().find(
                            (el) => el.getAttribute('data-role') === 'ai'
                        );

                        if (latestAiMessage) {
                            latestAiMessage.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 100);
                });
            }
        }
    };

    useEffect(() => {
        // Only scroll chat messages when there are user messages (not just the initial greeting)
        if (messages.length > 1) {
            scrollToLatestMessage();
        }
    }, [messages]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!query.trim()) return;

        const userMessage = query;
        setQuery("");
        setIsLoading(true);

        // Add user message immediately
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        // Update progress (max 5 messages)
        const newCount = Math.min(userMessageCount + 1, 5);
        setUserMessageCount(newCount);
        sessionStorage.setItem('chatProgressCount', newCount.toString());

        // Track chat message in Google Analytics for record keeping
        if (typeof window !== 'undefined') {
            // @ts-ignore - gtag is defined globally by Google Analytics script in layout.tsx
            if (typeof window.gtag !== 'undefined') {
                // @ts-ignore
                window.gtag('event', 'chat_message', {
                    message_number: newCount,
                    user_message: userMessage,
                    chat_state: JSON.stringify(chatState),
                });
            }
        }

        // Log FULL user message directly to Google Sheets (bypasses GA4's 500 char limit)
        fetch('/api/log-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messageType: 'USER',
                messageNumber: newCount,
                userMessage: userMessage,
                chatState: chatState,
            }),
        }).catch(err => console.error('Failed to log user message:', err));

        // Fire Google Ads conversion on first chat message (once per session)
        if (typeof window !== 'undefined' && !sessionStorage.getItem('chatConversionFired')) {
            // @ts-ignore - gtag is defined globally by Google Analytics script in layout.tsx
            if (typeof window.gtag !== 'undefined') {
                // @ts-ignore
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-17796654538/RxBECK6d2s8bEMrLjaZC',
                    'value': 1.0,
                    'currency': 'GBP'
                });
                sessionStorage.setItem('chatConversionFired', 'true');
            }
        }

        // Fire HIGH-VALUE conversion when user completes all 5 questions (once per session)
        if (newCount === 5 && typeof window !== 'undefined' && !sessionStorage.getItem('chatCompletedConversion')) {
            const adsClickId = sessionStorage.getItem('adsClickId');

            // @ts-ignore
            if (typeof window.gtag !== 'undefined') {
                // @ts-ignore
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-17796654538/RxBECK6d2s8bEMrLjaZC', // TODO: Replace with completion conversion ID
                    'value': 5.0, // Higher value for completed chat
                    'currency': 'GBP'
                });

                // Track ads-driven chat completion if gclid is present
                if (adsClickId) {
                    // @ts-ignore
                    window.gtag('event', 'ads_chat_completion', {
                        gclid: adsClickId,
                        value: 5.0,
                        currency: 'GBP'
                    });
                }
                sessionStorage.setItem('chatCompletedConversion', 'true');
            }
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    chatState: chatState,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();

            setChatState(data.newState);
            setMessages(prev => [...prev, {
                role: "ai",
                content: data.message
            }]);

            // Log AI response to Google Analytics
            if (typeof window !== 'undefined') {
                // @ts-ignore - gtag is defined globally by Google Analytics script in layout.tsx
                if (typeof window.gtag !== 'undefined') {
                    // @ts-ignore
                    window.gtag('event', 'ai_response', {
                        message_number: newCount,
                        ai_message: data.message,
                        new_state: JSON.stringify(data.newState),
                        recommendations_count: data.recommendations?.length || 0,
                    });
                }
            }

            // Log FULL AI response directly to Google Sheets (bypasses GA4's 500 char limit)
            fetch('/api/log-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageType: 'AI',
                    messageNumber: newCount,
                    aiMessage: data.message,
                    chatState: data.newState,
                    recommendationsCount: data.recommendations?.length || 0,
                }),
            }).catch(err => console.error('Failed to log AI response:', err));

            // Update recommendations without causing scroll
            if (data.recommendations && data.recommendations.length > 0) {
                // Use requestAnimationFrame for smoother updates
                requestAnimationFrame(() => {
                    setRecommendations(data.recommendations);
                });
            }
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTopic = (topic: string) => {
        setQuery(topic);
        // Auto-submit after a tick so the state updates
        setTimeout(() => {
            const form = inputRef.current?.closest('form');
            if (form) {
                form.requestSubmit();
            }
        }, 50);
    };

    return (
        <div ref={chatContainerRef} className="w-full max-w-6xl mx-auto flex flex-col gap-1 md:gap-3">
            {/* How It Works - Only show when no user messages (just the initial AI greeting) */}
            {messages.length === 1 && (
                <div className="grid gap-2 md:gap-4 grid-cols-3 md:grid-cols-3 max-w-4xl mx-auto px-2">
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-red-200">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-red-600">1</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Ask Anything</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Ask about any trending topic</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-red-200">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-red-600">2</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Get Insights</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">AI-powered context and analysis</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-red-200">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-red-600">3</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Go Deeper</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Read full stories on every topic</p>
                    </div>
                </div>
            )}

            {/* Chat Interface */}
            <div className="bg-background/80 backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[600px]">
                {/* Header */}
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <motion.span
                        className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Live</span>
                    <span className="mx-1 text-muted-foreground/30">|</span>
                    <span className="text-xs font-semibold text-foreground">AI News Assistant</span>
                    <span className="text-sm">&#10024;</span>
                    <span className="ml-auto text-[10px] text-muted-foreground hidden md:inline">Powered by AI &bull; Updated every 30 min</span>
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            data-message
                            data-role={msg.role}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={idx === 0 ? { duration: 0.6, ease: "easeOut" } : undefined}
                            className={cn(
                                "flex gap-4",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            {msg.role === "user" ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-primary text-primary-foreground">
                                    <User className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                    {isLoading && idx === messages.length - 1 ? null : (
                                        <>
                                            <span className="text-2xl" role="img" aria-label="robot">&#129302;</span>
                                        </>
                                    )}
                                    {idx === messages.length - 1 && idx > 0 && !isLoading && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-primary/30"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0 }}
                                            transition={{ duration: 1 }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Message bubble */}
                            <motion.div
                                className={cn(
                                    "p-4 rounded-2xl text-sm md:text-base max-w-[80%] shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "rounded-tl-none border bg-gradient-to-br from-white to-slate-50"
                                )}
                                {...(idx === 0 ? {
                                    initial: { opacity: 0, y: 8 },
                                    animate: { opacity: 1, y: 0 },
                                    transition: { duration: 0.5, delay: 0.2 }
                                } : {})}
                            >
                                <div className={cn(
                                    "whitespace-pre-wrap leading-relaxed markdown-content",
                                    msg.role === "user" && "markdown-content-dark"
                                )}>
                                    <ReactMarkdown>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                <span className="text-2xl" role="img" aria-label="robot">&#129302;</span>
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                            <div className="bg-gradient-to-br from-white to-slate-50 border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <motion.span
                                    className="text-sm font-medium bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent"
                                    animate={{ backgroundPosition: ["0% center", "200% center"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    &#129504; Thinking...
                                </motion.span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSearch} onFocus={(e) => e.stopPropagation()} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative flex items-center bg-background rounded-lg border shadow-sm">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                placeholder={PLACEHOLDERS[placeholderIndex]}
                                className="flex-1 bg-transparent border-none px-4 py-3 text-base focus:ring-0 placeholder:text-muted-foreground/50"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            {query.trim() && (
                                <span className="text-[10px] text-muted-foreground/60 mr-1 hidden md:inline">
                                    Enter &#8629;
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="mr-2 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Topic Chips - show when input is empty and no conversation yet */}
                    {!query.trim() && messages.length <= 2 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-1.5 mt-2.5 justify-center"
                        >
                            {QUICK_TOPICS.map((topic) => (
                                <button
                                    key={topic.label}
                                    type="button"
                                    onClick={() => handleQuickTopic(`${topic.emoji} ${topic.label}`)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
                                        "hover:shadow-md hover:scale-105 active:scale-95",
                                        topic.color
                                    )}
                                >
                                    {topic.emoji} {topic.label}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Progress Bar - Now below input for better mobile visibility */}
                    {userMessageCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 bg-primary/5 border-t border-primary/10"
                        >
                            {/* Rotating Sparkle Icon */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            </motion.div>

                            {/* Progress Label */}
                            <span className="text-xs md:text-sm font-semibold text-primary">Progress</span>

                            {/* Progress Bars */}
                            <div className="flex-1 flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((step) => (
                                    <motion.div
                                        key={step}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: step * 0.1 }}
                                        className={cn(
                                            "h-2.5 md:h-3 flex-1 rounded-full relative overflow-hidden shadow-sm",
                                            userMessageCount >= step
                                                ? "bg-gradient-to-r from-primary via-violet-600 to-primary shadow-lg"
                                                : "bg-muted/30"
                                        )}
                                    >
                                        {/* Shimmer effect for completed bars */}
                                        {userMessageCount >= step && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Counter with bounce animation */}
                            <motion.span
                                key={userMessageCount}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                className="text-xs md:text-sm font-bold text-primary min-w-[2rem] text-center"
                            >
                                {userMessageCount}/5
                            </motion.span>

                            {/* Celebration emoji when complete */}
                            {userMessageCount === 5 && (
                                <motion.span
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="text-base md:text-lg"
                                >
                                    &#127881;
                                </motion.span>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Results Deck */}
            <AnimatePresence mode="wait">
                {recommendations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-1 md:space-y-2"
                    >
                        <div className="flex items-center gap-2 text-base md:text-lg font-semibold px-2">
                            <Flame className="w-4 h-4 text-red-500" />
                            <h2>Related Stories</h2>
                            <span className="text-xs font-normal text-muted-foreground ml-2 hidden md:inline">
                                Dive deeper into these topics
                            </span>
                        </div>

                        <div className="grid gap-2 md:gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((story: any, storyIdx: number) => (
                                <a
                                    key={story.slug}
                                    href={`/blog/${story.slug}`}
                                    className={cn(
                                        "group bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all relative border-l-4",
                                        CATEGORY_COLORS[story.category] || "border-l-red-500"
                                    )}
                                >
                                    {storyIdx === 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                            &#128293; Hot
                                        </span>
                                    )}
                                    <span className="text-xs font-medium text-red-600">
                                        {CATEGORY_EMOJIS[story.category] || "&#128196;"} {story.category}
                                    </span>
                                    <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2 text-sm">
                                        {story.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
