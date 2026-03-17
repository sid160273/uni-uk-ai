"use client";

import { useState } from "react";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
  section?: string;
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  variant = "card",
  className = "",
  section,
  title,
  description,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const displayTitle = title || "Daily Digest";
  const displayDescription =
    description || "The top trending stories, delivered to your inbox every morning.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(section ? { section } : {}) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (variant === "inline") {
    return (
      <div className={className}>
        {status === "success" ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 px-3 py-2.5 border border-border border-r-0 text-sm bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2.5 bg-foreground text-background text-[11px] font-bold uppercase tracking-editorial whitespace-nowrap hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-[11px] text-destructive mt-1">{message}</p>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <div className={`border border-border p-6 ${className}`}>
      <h3 className="font-display text-xl font-black mb-1">{displayTitle}</h3>
      <p className="font-body-serif text-sm text-muted-foreground mb-4 leading-relaxed">
        {displayDescription}
      </p>

      {status === "success" ? (
        <div className="py-3 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground font-bold">
            You&apos;re in
          </p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2.5 border border-border text-sm bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2.5 bg-foreground text-background text-[11px] font-bold uppercase tracking-editorial hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : `Get the ${displayTitle}`}
          </button>
          <p className="text-[10px] text-muted-foreground/60 text-center">
            Free. No spam. Unsubscribe anytime.
          </p>
        </form>
      )}

      {status === "error" && (
        <p className="text-[11px] text-destructive mt-2">{message}</p>
      )}
    </div>
  );
}
