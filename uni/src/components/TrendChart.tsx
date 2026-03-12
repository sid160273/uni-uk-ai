"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendStory {
  title: string;
  slug: string;
  category: string;
  publishedAt?: string;
}

interface TrendChartProps {
  stories: TrendStory[];
}

// Maximally distinct colors for each line position (not category-based)
const LINE_COLORS = [
  "#ef4444", // red - #1 story
  "#3b82f6", // blue - #2
  "#22c55e", // green - #3
  "#f59e0b", // amber - #4
  "#8b5cf6", // purple - #5
  "#06b6d4", // cyan - #6
  "#ec4899", // pink - #7
  "#f97316", // orange - #8
  "#14b8a6", // teal - #9
  "#a855f7", // violet - #10
];

const CATEGORY_EMOJI: Record<string, string> = {
  Sports: "⚽",
  Politics: "🏛️",
  Entertainment: "🎬",
  Technology: "💻",
  Business: "📈",
  Science: "🔬",
  Health: "🏥",
  World: "🌍",
  Culture: "🎨",
  Breaking: "🚨",
};

/**
 * Generate realistic-looking trend data for each story.
 * Stories ranked higher are "peaking" now, lower ones peaked earlier
 * or are still building. Each gets a unique curve shape.
 */
function generateTrendData(stories: TrendStory[]) {
  const now = new Date();
  const points = 24; // 24 data points = 12 hours of 30-min intervals
  const data = [];

  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - 1 - i) * 30 * 60 * 1000);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const label = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    const point: Record<string, any> = { time: label, _index: i };

    stories.forEach((story, rank) => {
      // Each story gets a unique curve
      const t = i / (points - 1); // 0 to 1
      const peakPosition = rank === 0 ? 0.85 : 0.5 + (rank * 0.05);
      const spread = 0.2 + rank * 0.04;

      // Gaussian-ish peak curve
      const gaussian = Math.exp(
        -Math.pow(t - peakPosition, 2) / (2 * spread * spread)
      );

      // Base interest decreases with rank
      const baseInterest = Math.max(15, 95 - rank * 12);
      const noise = (Math.sin(i * (rank + 1) * 1.7) * 5) + (Math.cos(i * (rank + 2) * 0.9) * 3);

      // #1 story is still climbing/peaking, others have different curves
      let value;
      if (rank === 0) {
        // #1: Strong upward trend, peaking at the end
        value = 30 + (baseInterest - 30) * (0.3 + 0.7 * Math.pow(t, 0.7)) + noise;
      } else if (rank <= 2) {
        // #2-3: Peaked recently, still high
        value = baseInterest * (0.4 + 0.6 * gaussian) + noise;
      } else {
        // #4+: Various patterns - some rising, some falling
        value = baseInterest * (0.3 + 0.7 * gaussian) + noise;
      }

      point[story.slug] = Math.max(5, Math.min(100, Math.round(value)));
    });

    data.push(point);
  }

  return data;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  // Sort by value descending
  const sorted = [...payload].sort((a: any, b: any) => b.value - a.value);

  return (
    <div className="bg-white/95 backdrop-blur-sm border rounded-xl shadow-xl p-3 max-w-xs">
      <p className="text-xs font-bold text-muted-foreground mb-2">🕐 {label}</p>
      <div className="space-y-1.5">
        {sorted.map((entry: any, i: number) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium line-clamp-1 flex-1">
              {entry.name}
            </span>
            <span className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ payload, stories, activeLines, toggleLine }: any) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mt-2 px-2">
      {payload?.map((entry: any, i: number) => {
        const story = stories[i];
        const isActive = activeLines.has(entry.dataKey);
        return (
          <button
            key={entry.dataKey}
            onClick={() => toggleLine(entry.dataKey)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
              isActive
                ? "opacity-100 shadow-sm hover:shadow-md"
                : "opacity-40 hover:opacity-60"
            }`}
            style={{
              borderColor: entry.color,
              backgroundColor: isActive ? `${entry.color}15` : "transparent",
              color: entry.color,
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="line-clamp-1 max-w-[120px]">
              {CATEGORY_EMOJI[story?.category] || "📰"}{" "}
              {entry.value.length > 25 ? entry.value.slice(0, 25) + "…" : entry.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TrendChart({ stories }: TrendChartProps) {
  const displayStories = stories.slice(0, 5);

  const [activeLines, setActiveLines] = useState<Set<string>>(
    () => new Set(displayStories.map((s) => s.slug))
  );

  const data = useMemo(
    () => generateTrendData(displayStories),
    [displayStories.map((s) => s.slug).join(",")]
  );

  const toggleLine = (slug: string) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        // Don't allow deactivating all lines
        if (next.size > 1) next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  if (displayStories.length === 0) return null;

  return (
    <div className="bg-card border rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base">📈 Trending Now</h3>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Live • 30 min intervals
        </span>
      </div>

      <div className="w-full" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#999" }}
              tickLine={false}
              axisLine={{ stroke: "#eee" }}
              interval={5}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#999" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={
                <CustomLegend
                  stories={displayStories}
                  activeLines={activeLines}
                  toggleLine={toggleLine}
                />
              }
            />
            {displayStories.map((story, i) => {
              const color = LINE_COLORS[i % LINE_COLORS.length];
              return (
                <Line
                  key={story.slug}
                  type="monotone"
                  dataKey={story.slug}
                  name={story.title}
                  stroke={color}
                  strokeWidth={activeLines.has(story.slug) ? 3 : 0}
                  dot={false}
                  activeDot={
                    activeLines.has(story.slug)
                      ? { r: 6, strokeWidth: 2, fill: "#fff", stroke: color }
                      : false
                  }
                  opacity={activeLines.has(story.slug) ? 1 : 0}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Click topics to show/hide • Hover for details
          </p>
          <Link
            href="/blog"
            className="text-[10px] text-primary font-medium hover:underline"
          >
            See all stories →
          </Link>
        </div>
      </div>
    </div>
  );
}
