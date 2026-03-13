"use client";

import Link from "next/link";

interface TrendingStory {
  title: string;
  category: string;
  slug: string;
  trafficVolume?: string;
}

interface TrendingTickerProps {
  stories: TrendingStory[];
}

export function TrendingTicker({ stories }: TrendingTickerProps) {
  if (!stories || stories.length === 0) return null;

  const duplicatedStories = [...stories, ...stories];

  return (
    <div className="relative w-full overflow-hidden bg-foreground text-background">
      <style jsx>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll ${stories.length * 5}s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-stretch">
        {/* Fixed label */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-destructive px-4 py-2">
          <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-editorial text-white">
            Trending Now
          </span>
        </div>

        {/* Scrolling area */}
        <div className="flex-1 overflow-hidden py-2">
          <div className="ticker-track">
            {duplicatedStories.map((story, index) => (
              <Link
                key={`${story.slug}-${index}`}
                href={`/blog/${story.slug}`}
                className="group flex shrink-0 items-center gap-2 px-5 text-sm transition-opacity hover:opacity-70"
              >
                <span className="text-[10px] font-bold uppercase tracking-editorial text-background/50">
                  {story.category}
                </span>
                <span className="whitespace-nowrap font-semibold group-hover:underline">
                  {story.title}
                </span>
                <span className="mx-2 text-background/30">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
