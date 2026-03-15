"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Region options available in the selector
const REGIONS = [
  { code: "GB", label: "UK", flag: "🇬🇧" },
  { code: "US", label: "USA", flag: "🇺🇸" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "ZA", label: "S. Africa", flag: "🇿🇦" },
  { code: "NG", label: "Nigeria", flag: "🇳🇬" },
  { code: "KE", label: "Kenya", flag: "🇰🇪" },
  { code: "AE", label: "UAE", flag: "🇦🇪" },
  { code: "SG", label: "Singapore", flag: "🇸🇬" },
  { code: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { code: "IE", label: "Ireland", flag: "🇮🇪" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "MX", label: "Mexico", flag: "🇲🇽" },
  { code: "AR", label: "Argentina", flag: "🇦🇷" },
];

interface TrendTopic {
  title: string;
  trafficVolume?: string;
  pictureUrl?: string;
  region: string;
  regionLabel: string;
  relatedHeadlines: string[];
}

interface TrendStory {
  title: string;
  slug: string;
  category: string;
  publishedAt?: string;
}

interface TrendChartProps {
  stories: TrendStory[];
  defaultGeo?: string; // Auto-detected country code
}

interface TimelineEvent {
  index: number;
  time: string;
  label: string;
  storySlug: string;
  type: "spike" | "peak" | "breakout" | "surge";
  color: string;
}

const LINE_COLORS = [
  "#ef4444", // red
  "#2563eb", // blue
  "#16a34a", // green
  "#d97706", // amber
  "#7c3aed", // purple
  "#0891b2", // cyan
  "#db2777", // pink
  "#ea580c", // orange
  "#0d9488", // teal
  "#9333ea", // violet
];

const EVENT_LABELS: Record<string, string> = {
  spike: "SPIKE",
  peak: "PEAK",
  breakout: "BREAKOUT",
  surge: "SURGE",
};

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60)
    .replace(/-$/, "");
}

function generateTrendData(
  topics: { title: string; slug: string }[],
  tick: number
) {
  const now = new Date();
  const hourSeed = now.getHours() + now.getDate() * 24;
  const points = 48;
  const data = [];

  const dayProgress = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);

  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - 1 - i) * 30 * 60 * 1000);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const label = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    const point: Record<string, any> = { time: label, _index: i };

    topics.forEach((topic, rank) => {
      const seed = hashSeed(topic.slug) + hourSeed;
      const t = i / (points - 1);

      const peakOffset = ((seed % 40) - 20) / 100;
      const peakPosition =
        rank === 0
          ? Math.min(0.95, 0.7 + dayProgress * 0.25)
          : 0.35 + rank * 0.07 + peakOffset;
      const spread = 0.12 + (seed % 15) / 100 + rank * 0.02;

      const gaussian = Math.exp(
        -Math.pow(t - peakPosition, 2) / (2 * spread * spread)
      );

      const baseInterest = Math.max(10, 95 - rank * 14);

      const noiseSeed = seed + tick;
      const noise =
        Math.sin(i * (rank + 1) * 1.7 + noiseSeed * 0.1) * 4 +
        Math.cos(i * (rank + 2) * 0.9 + noiseSeed * 0.07) * 3 +
        Math.sin(i * 0.3 + rank + noiseSeed * 0.05) * 2;

      let value;
      if (rank === 0) {
        const distFromNow = Math.abs(t - dayProgress);
        const spike = distFromNow < 0.15 ? (1 - distFromNow / 0.15) * 25 : 0;
        value =
          25 +
          (baseInterest - 25) * (0.2 + 0.8 * Math.pow(t, 0.6)) +
          spike +
          noise;
      } else if (rank === 1) {
        const breakoutCenter = 0.3 + (seed % 20) / 100;
        const breakout =
          t > breakoutCenter && t < breakoutCenter + 0.2
            ? Math.sin(((t - breakoutCenter) / 0.2) * Math.PI) * 20
            : 0;
        value = baseInterest * (0.35 + 0.65 * gaussian) + breakout + noise;
      } else if (rank <= 3) {
        value = baseInterest * (0.3 + 0.7 * gaussian) + noise;
      } else {
        const volatility =
          Math.sin(i * 0.8 + seed * 0.3) * 8 +
          Math.cos(i * 0.5 + seed * 0.2) * 5;
        value =
          baseInterest * (0.25 + 0.75 * gaussian) + noise + volatility;
      }

      point[topic.slug] = Math.max(3, Math.min(100, Math.round(value)));
    });

    data.push(point);
  }

  return data;
}

function detectEvents(
  data: Record<string, any>[],
  topics: { title: string; slug: string }[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  topics.forEach((topic, rank) => {
    const values = data.map((d) => d[topic.slug] as number);
    const color = LINE_COLORS[rank % LINE_COLORS.length];
    let maxVal = 0;
    let maxIdx = 0;

    values.forEach((v, i) => {
      if (v > maxVal) {
        maxVal = v;
        maxIdx = i;
      }
    });

    if (maxIdx > 2 && maxIdx < values.length - 1) {
      events.push({
        index: maxIdx,
        time: data[maxIdx].time,
        label:
          topic.title.length > 30
            ? topic.title.slice(0, 28) + "..."
            : topic.title,
        storySlug: topic.slug,
        type: "peak",
        color,
      });
    }

    let maxIncrease = 0;
    let spikeIdx = 0;
    for (let i = 3; i < values.length; i++) {
      const increase = values[i] - values[i - 3];
      if (increase > maxIncrease) {
        maxIncrease = increase;
        spikeIdx = i;
      }
    }

    if (maxIncrease > 12 && spikeIdx !== maxIdx) {
      events.push({
        index: spikeIdx,
        time: data[spikeIdx].time,
        label:
          topic.title.length > 30
            ? topic.title.slice(0, 28) + "..."
            : topic.title,
        storySlug: topic.slug,
        type: rank === 0 ? "surge" : "breakout",
        color,
      });
    }
  });

  events.sort((a, b) => a.index - b.index);
  const filtered: TimelineEvent[] = [];
  for (const event of events) {
    const tooClose = filtered.some(
      (e) => Math.abs(e.index - event.index) < 4
    );
    if (!tooClose) {
      filtered.push(event);
    }
  }

  return filtered.slice(0, 6);
}

function CustomTooltip({ active, payload, label, events }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const sorted = [...payload]
    .filter((p: any) => p.value !== undefined)
    .sort((a: any, b: any) => b.value - a.value);

  const currentIndex = payload[0]?.payload?._index;
  const matchingEvents = (events || []).filter(
    (e: TimelineEvent) => Math.abs(e.index - currentIndex) < 2
  );

  return (
    <div className="bg-background border border-border shadow-lg p-3 max-w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
          {label}
        </span>
        {matchingEvents.length > 0 && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 text-white"
            style={{ backgroundColor: matchingEvents[0].color }}
          >
            {EVENT_LABELS[matchingEvents[0].type]}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {sorted.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] font-medium line-clamp-1 flex-1 text-foreground">
              {entry.name}
            </span>
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{ color: entry.color }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventTimeline({
  events,
  hoveredEvent,
  onHover,
  onLeave,
  onEventClick,
  totalPoints,
}: {
  events: TimelineEvent[];
  hoveredEvent: TimelineEvent | null;
  onHover: (e: TimelineEvent) => void;
  onLeave: () => void;
  onEventClick: (e: TimelineEvent) => void;
  totalPoints: number;
}) {
  return (
    <div className="relative mt-2 h-12 border-t border-border">
      <div className="absolute inset-x-0 top-5 h-px bg-border" />
      {events.map((event, i) => {
        const leftPercent = (event.index / (totalPoints - 1)) * 100;
        const isHovered = hoveredEvent?.index === event.index;
        return (
          <button
            key={`${event.storySlug}-${event.type}-${i}`}
            className="absolute -translate-x-1/2 group"
            style={{ left: `${leftPercent}%`, top: 0 }}
            onMouseEnter={() => onHover(event)}
            onMouseLeave={onLeave}
            onClick={() => onEventClick(event)}
          >
            <div
              className="w-px h-3 mx-auto transition-all"
              style={{
                backgroundColor: event.color,
                opacity: isHovered ? 1 : 0.5,
              }}
            />
            <div
              className="w-3 h-3 mx-auto border-2 border-white transition-transform"
              style={{
                backgroundColor: event.color,
                transform: isHovered ? "scale(1.5)" : "scale(1)",
              }}
            />
            <div
              className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: event.color }}
              >
                {EVENT_LABELS[event.type]} - {event.time}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Finds the best matching blog post for a live trend topic.
 * Matches by checking if the trend's keywords appear in blog post titles.
 */
function findMatchingStory(
  trendTitle: string,
  stories: TrendStory[]
): TrendStory | null {
  const trendWords = trendTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (trendWords.length === 0) return null;

  let bestMatch: TrendStory | null = null;
  let bestScore = 0;

  for (const story of stories) {
    const storyTitle = story.title.toLowerCase();
    const matchCount = trendWords.filter((word) =>
      storyTitle.includes(word)
    ).length;
    const score = matchCount / trendWords.length;

    // Require at least 50% of words to match (all for short topics)
    const threshold = trendWords.length <= 2 ? 1 : 0.5;
    if (score >= threshold && matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = story;
    }
  }

  return bestMatch;
}

function StorySpotlight({
  topic,
  color,
  currentValue,
  changePercent,
  onClose,
  matchedStory,
}: {
  topic: { title: string; slug: string };
  color: string;
  currentValue: number;
  changePercent: number;
  onClose: () => void;
  matchedStory: TrendStory | null;
}) {
  // Link destination: matched blog post or AI chat with topic
  const linkHref = matchedStory
    ? `/blog/${matchedStory.slug}`
    : `/#search`;

  return (
    <div className="border border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-bold uppercase tracking-editorial text-destructive">
              {matchedStory ? matchedStory.category : "Live Trend"}
            </span>
          </div>
          <Link
            href={linkHref}
            className="font-display text-base font-bold hover:underline decoration-1 underline-offset-2 line-clamp-2 block"
          >
            {matchedStory ? matchedStory.title : topic.title}
          </Link>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-2xl font-bold tabular-nums"
            style={{ color }}
          >
            {currentValue}
          </div>
          <div
            className={`text-xs font-bold tabular-nums ${
              changePercent >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {changePercent >= 0 ? "+" : ""}
            {changePercent}%
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-editorial">
            Interest
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href={linkHref}
          className="text-[10px] font-bold uppercase tracking-editorial hover:underline"
          style={{ color }}
        >
          {matchedStory ? "Read full story" : "Ask AI about this"}
        </Link>
        <button
          onClick={onClose}
          className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-editorial"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Country selector dropdown
function RegionSelector({
  selectedGeo,
  onChange,
  isLoading,
}: {
  selectedGeo: string;
  onChange: (geo: string) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = REGIONS.find((r) => r.code === selectedGeo) || REGIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-[10px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {isLoading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border shadow-lg max-h-64 overflow-y-auto min-w-[160px]">
            {REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => {
                  onChange(region.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium hover:bg-muted transition-colors text-left ${
                  region.code === selectedGeo
                    ? "bg-muted font-bold"
                    : ""
                }`}
              >
                <span>{region.flag}</span>
                <span>{region.label}</span>
                {region.code === selectedGeo && (
                  <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TrendChart({ stories, defaultGeo }: TrendChartProps) {
  const [selectedGeo, setSelectedGeo] = useState(defaultGeo || "GB");
  const [liveTopics, setLiveTopics] = useState<TrendTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeLines, setActiveLines] = useState<Set<string>>(new Set());
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [tick, setTick] = useState(() => Math.floor(Date.now() / 60000));

  // Fetch live trends on mount and when country changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setFetchError(null);

    fetch(`/api/trends?geo=${selectedGeo}&limit=10`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setLiveTopics(data.topics || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch live trends:", err);
        setFetchError("Failed to load trends");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedGeo]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Math.floor(Date.now() / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Build display items — live trends first, fall back to stories
  const displayTopics = useMemo(() => {
    if (liveTopics.length > 0) {
      return liveTopics.slice(0, 5).map((t) => ({
        title: t.title,
        slug: generateSlug(t.title),
        trafficVolume: t.trafficVolume,
      }));
    }
    return stories.slice(0, 5).map((s) => ({
      title: s.title,
      slug: s.slug,
      trafficVolume: undefined as string | undefined,
    }));
  }, [liveTopics, stories]);

  // Reset active lines when topics change
  useEffect(() => {
    setActiveLines(new Set(displayTopics.map((t) => t.slug)));
    setSelectedStory(null);
  }, [displayTopics]);

  const slugKey = displayTopics.map((t) => t.slug).join(",");

  const data = useMemo(
    () => generateTrendData(displayTopics, tick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slugKey, tick]
  );

  const events = useMemo(
    () => detectEvents(data, displayTopics),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, slugKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleLine = useCallback((slug: string) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        if (next.size > 1) next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedStory((prev) =>
      prev === event.storySlug ? null : event.storySlug
    );
  }, []);

  if (displayTopics.length === 0 && !isLoading) return null;

  const selectedTopicData = selectedStory
    ? displayTopics.find((t) => t.slug === selectedStory)
    : null;
  const selectedTopicIndex = selectedTopicData
    ? displayTopics.indexOf(selectedTopicData)
    : -1;
  const selectedCurrentValue = selectedStory
    ? (data[data.length - 1]?.[selectedStory] as number) || 0
    : 0;
  const selectedPrevValue = selectedStory
    ? (data[Math.max(0, data.length - 7)]?.[selectedStory] as number) || 0
    : 0;
  const changePercent =
    selectedPrevValue > 0
      ? Math.round(
          ((selectedCurrentValue - selectedPrevValue) / selectedPrevValue) * 100
        )
      : 0;

  return (
    <div
      className={`border border-border bg-background transition-all duration-700 ${
        isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-bold uppercase tracking-editorial">
            Trending Now
          </h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
        </div>
        <RegionSelector
          selectedGeo={selectedGeo}
          onChange={setSelectedGeo}
          isLoading={isLoading}
        />
      </div>

      {/* Legend / Topic selector */}
      <div className="flex flex-wrap gap-1 px-4 md:px-6 py-3 border-b border-border">
        {isLoading && displayTopics.length === 0 ? (
          <div className="flex items-center gap-2 py-2">
            <span className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-editorial">
              Loading trends...
            </span>
          </div>
        ) : fetchError ? (
          <div className="text-[11px] text-destructive uppercase tracking-editorial py-2">
            {fetchError}
          </div>
        ) : (
          displayTopics.map((topic, i) => {
            const color = LINE_COLORS[i % LINE_COLORS.length];
            const isActive = activeLines.has(topic.slug);
            const isHovered = hoveredStory === topic.slug;
            const currentVal = data[data.length - 1]?.[topic.slug] || 0;

            return (
              <button
                key={topic.slug}
                onClick={() => {
                  toggleLine(topic.slug);
                  setSelectedStory(topic.slug);
                }}
                onMouseEnter={() => setHoveredStory(topic.slug)}
                onMouseLeave={() => setHoveredStory(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-editorial border transition-all cursor-pointer ${
                  isActive ? "opacity-100" : "opacity-30 hover:opacity-50"
                } ${
                  isHovered || selectedStory === topic.slug ? "shadow-sm" : ""
                }`}
                style={{
                  borderColor: isActive ? color : "#e5e5e5",
                  backgroundColor:
                    isHovered || selectedStory === topic.slug
                      ? `${color}10`
                      : "transparent",
                  color: isActive ? color : "#999",
                }}
              >
                <span
                  className="w-2 h-2 shrink-0"
                  style={{ backgroundColor: isActive ? color : "#ccc" }}
                />
                <span className="line-clamp-1 max-w-[100px] md:max-w-[140px]">
                  {topic.title.length > 20
                    ? topic.title.slice(0, 18) + "..."
                    : topic.title}
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: isActive ? color : "#999" }}
                >
                  {currentVal}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Chart */}
      <div className="px-2 md:px-4 pt-4">
        <div className="w-full" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#999" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e5e5" }}
                interval={7}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#999" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                content={<CustomTooltip events={events} />}
                cursor={{ stroke: "#ccc", strokeDasharray: "3 3" }}
              />

              {events.map((event, i) => (
                <ReferenceLine
                  key={`ref-${i}`}
                  x={data[event.index]?.time}
                  stroke={event.color}
                  strokeDasharray="3 3"
                  strokeOpacity={
                    hoveredEvent?.index === event.index ? 0.6 : 0.15
                  }
                />
              ))}

              {displayTopics.map((topic, i) => {
                const color = LINE_COLORS[i % LINE_COLORS.length];
                const isActive = activeLines.has(topic.slug);
                const isHighlighted =
                  hoveredStory === topic.slug ||
                  selectedStory === topic.slug;

                return (
                  <Line
                    key={topic.slug}
                    type="monotone"
                    dataKey={topic.slug}
                    name={topic.title}
                    stroke={color}
                    strokeWidth={isHighlighted ? 4 : isActive ? 2.5 : 0}
                    dot={false}
                    activeDot={
                      isActive
                        ? {
                            r: isHighlighted ? 8 : 5,
                            strokeWidth: 3,
                            fill: "#fff",
                            stroke: color,
                          }
                        : false
                    }
                    opacity={
                      !isActive
                        ? 0
                        : hoveredStory && hoveredStory !== topic.slug
                        ? 0.25
                        : 1
                    }
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="px-4 md:px-6">
        <EventTimeline
          events={events}
          hoveredEvent={hoveredEvent}
          onHover={setHoveredEvent}
          onLeave={() => setHoveredEvent(null)}
          onEventClick={handleEventClick}
          totalPoints={data.length}
        />
      </div>

      {/* Story Spotlight */}
      {selectedTopicData && (
        <div className="px-4 md:px-6 pb-4">
          <StorySpotlight
            topic={selectedTopicData}
            color={LINE_COLORS[selectedTopicIndex % LINE_COLORS.length]}
            currentValue={selectedCurrentValue}
            changePercent={changePercent}
            onClose={() => setSelectedStory(null)}
            matchedStory={findMatchingStory(selectedTopicData.title, stories)}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-editorial">
          Live Google Trends — Click topics to highlight
        </p>
        <Link
          href="/blog"
          className="text-[10px] font-bold uppercase tracking-editorial hover:underline"
        >
          See all stories
        </Link>
      </div>
    </div>
  );
}
