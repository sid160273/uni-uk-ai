"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Send, User, Bot } from "lucide-react";
import { UniversityCard } from "./UniversityCard";
import { cn } from "@/lib/utils";
import { University } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatState {
    location?: string;
    course?: string;
    vibe?: string;
    sports?: boolean;
    nightlife?: boolean;
    predictedGrades?: string;
}

interface Message {
    role: "user" | "ai";
    content: string;
}

export function SearchBox() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Hi there! 👋 I'm your AI university consultant, here to help you find the perfect UK university match.\n\nI'll guide you through a personalized journey based on your course interests, grades, location preferences, and what matters most to you in student life.\n\nLet's get started - what subject are you thinking of studying?"
        }
    ]);
    const [chatState, setChatState] = useState<ChatState>({});
    const [recommendations, setRecommendations] = useState<University[]>([]);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load progress from sessionStorage on mount
    useEffect(() => {
        const savedCount = sessionStorage.getItem('chatProgressCount');
        if (savedCount) {
            setUserMessageCount(parseInt(savedCount, 10));
        }
    }, []);

    const scrollToBottom = () => {
        if (messages.length > 1 && messagesEndRef.current) {
            const chatContainer = messagesEndRef.current.parentElement;
            if (chatContainer) {
                requestAnimationFrame(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                });
            }
        }
    };

    useEffect(() => {
        // Only scroll chat messages when there are user messages (not just the initial greeting)
        if (messages.length > 1) {
            scrollToBottom();
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

    const progressPercentage = (userMessageCount / 5) * 100;

    return (
        <div ref={chatContainerRef} className="w-full max-w-6xl mx-auto flex flex-col gap-4">
            {/* How It Works - Only show when no user messages (just the initial AI greeting) */}
            {messages.length === 1 && (
                <div className="grid gap-2 md:gap-4 grid-cols-3 md:grid-cols-3 max-w-4xl mx-auto px-2">
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-primary/20">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-primary">1</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Share Goals</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Tell us about your course and grades</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-primary/20">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-primary">2</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Get Matched</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Receive tailored recommendations</p>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-card/50 rounded-lg border border-primary/20">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                            <span className="text-sm md:text-lg font-bold text-primary">3</span>
                        </div>
                        <h3 className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Explore & Apply</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">View detailed university profiles</p>
                    </div>
                </div>
            )}

            {/* Chat Interface with Progress Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                {/* Chat Interface */}
                <div className="flex-1 bg-background/80 backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[600px]">
                {/* Header */}
                <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs font-medium text-muted-foreground">AI University Consultant</span>
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white text-primary border"
                            )}>
                                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl text-sm md:text-base max-w-[80%] shadow-sm",
                                msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-white border rounded-tl-none"
                            )}>
                                <div className={cn(
                                    "whitespace-pre-wrap leading-relaxed markdown-content",
                                    msg.role === "user" && "markdown-content-dark"
                                )}>
                                    <ReactMarkdown>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-white text-primary border flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSearch} onFocus={(e) => e.stopPropagation()} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative flex items-center bg-background rounded-lg border shadow-sm">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent border-none px-4 py-3 text-base focus:ring-0 placeholder:text-muted-foreground/50"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="mr-2 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

                {/* Progress Bar */}
                <div className="md:w-64 bg-background/80 backdrop-blur-xl border rounded-3xl shadow-2xl p-6 flex flex-col gap-4 h-fit md:h-[600px]">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-sm">Chat Progress</h3>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-muted/20"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-primary"
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                    animate={{
                                        strokeDashoffset: 2 * Math.PI * 56 * (1 - progressPercentage / 100)
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    key={userMessageCount}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-3xl font-bold text-primary"
                                >
                                    {userMessageCount}
                                </motion.span>
                                <span className="text-xs text-muted-foreground">/ 5</span>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: step * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                        userMessageCount >= step
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                                            : "bg-muted/30 text-muted-foreground"
                                    )}>
                                        {userMessageCount >= step ? "✓" : step}
                                    </div>
                                    <div className={cn(
                                        "h-2 flex-1 rounded-full transition-all duration-300",
                                        userMessageCount >= step
                                            ? "bg-gradient-to-r from-primary to-violet-600"
                                            : "bg-muted/30"
                                    )} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Completion Message */}
                        <AnimatePresence>
                            {userMessageCount >= 5 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center"
                                >
                                    <p className="text-xs font-medium text-primary">
                                        Great job! 🎉<br />
                                        <span className="text-muted-foreground">You're getting the best recommendations</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Results Deck */}
            <AnimatePresence mode="wait">
                {recommendations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 text-base md:text-lg font-semibold px-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h2>Recommendations</h2>
                            <span className="text-xs font-normal text-muted-foreground ml-2 hidden md:inline">
                                Based on your preferences
                            </span>
                        </div>

                        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((uni) => (
                                <div key={uni.id}>
                                    <UniversityCard university={uni} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
