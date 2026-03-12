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

const categoryEmojis: Record<string, string> = {
  Sports: "\u26BD",
  Politics: "\uD83C\uDFDB\uFE0F",
  Entertainment: "\uD83C\uDFAC",
  Technology: "\uD83D\uDCBB",
  Business: "\uD83D\uDCC8",
  Science: "\uD83D\uDD2C",
  Health: "\uD83C\uDFE5",
  World: "\uD83C\uDF0D",
  Culture: "\uD83C\uDFA8",
  Breaking: "\uD83D\uDEA8",
};

function getCategoryEmoji(category: string): string {
  return categoryEmojis[category] ?? "\uD83D\uDCF0";
}

export function TrendingTicker({ stories }: TrendingTickerProps) {
  if (!stories || stories.length === 0) return null;

  // Duplicate items to create seamless infinite scroll
  const duplicatedStories = [...stories, ...stories];

  return (
    <div className="relative w-full overflow-hidden bg-red-700 text-white">
      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll ${stories.length * 5}s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-stretch">
        {/* Fixed "TRENDING NOW" label */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-red-900 px-4 py-2 shadow-[4px_0_8px_rgba(0,0,0,0.3)]">
          <span className="pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-wider">
            Trending Now
          </span>
        </div>

        {/* Scrolling ticker area */}
        <div className="flex-1 overflow-hidden py-2">
          <div className="ticker-track">
            {duplicatedStories.map((story, index) => (
              <Link
                key={`${story.slug}-${index}`}
                href={`/blog/${story.slug}`}
                className="group flex shrink-0 items-center gap-1.5 px-5 text-sm transition-opacity hover:opacity-80"
              >
                <span className="text-base" role="img" aria-label={story.category}>
                  {getCategoryEmoji(story.category)}
                </span>
                <span className="whitespace-nowrap font-semibold group-hover:underline">
                  {story.title}
                </span>
                {story.trafficVolume && (
                  <span className="ml-1 flex items-center gap-0.5 whitespace-nowrap rounded-full bg-red-900/60 px-2 py-0.5 text-[10px] font-bold uppercase">
                    <span role="img" aria-label="hot">
                      🔥
                    </span>
                    {story.trafficVolume}
                  </span>
                )}
                <span className="mx-3 text-red-300/60">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
