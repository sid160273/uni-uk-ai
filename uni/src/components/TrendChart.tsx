"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  ReferenceDot,
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

function generateTrendData(stories: TrendStory[]) {
  const now = new Date();
  const points = 48; // 48 points = 24 hours at 30-min intervals
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
      const t = i / (points - 1);
      const peakPosition = rank === 0 ? 0.9 : 0.4 + rank * 0.08;
      const spread = 0.15 + rank * 0.03;

      const gaussian = Math.exp(
        -Math.pow(t - peakPosition, 2) / (2 * spread * spread)
      );

      const baseInterest = Math.max(10, 95 - rank * 14);
      const noise =
        Math.sin(i * (rank + 1) * 1.7) * 4 +
        Math.cos(i * (rank + 2) * 0.9) * 3 +
        Math.sin(i * 0.3 + rank) * 2;

      let value;
      if (rank === 0) {
        // #1: Strong climb with dramatic spike near the end
        const spike = t > 0.75 ? Math.pow((t - 0.75) / 0.25, 2) * 25 : 0;
        value = 25 + (baseInterest - 25) * (0.2 + 0.8 * Math.pow(t, 0.6)) + spike + noise;
      } else if (rank === 1) {
        // #2: Had a breakout moment, sustaining high
        const breakout = t > 0.3 && t < 0.5 ? Math.sin((t - 0.3) / 0.2 * Math.PI) * 20 : 0;
        value = baseInterest * (0.35 + 0.65 * gaussian) + breakout + noise;
      } else if (rank <= 3) {
        value = baseInterest * (0.3 + 0.7 * gaussian) + noise;
      } else {
        // Lower ranked: more volatile
        const volatility = Math.sin(i * 0.8 + rank * 2) * 8;
        value = baseInterest * (0.25 + 0.75 * gaussian) + noise + volatility;
      }

      point[story.slug] = Math.max(3, Math.min(100, Math.round(value)));
    });

    data.push(point);
  }

  return data;
}

function detectEvents(
  data: Record<string, any>[],
  stories: TrendStory[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  stories.forEach((story, rank) => {
    const values = data.map((d) => d[story.slug] as number);
    const color = LINE_COLORS[rank % LINE_COLORS.length];
    let maxVal = 0;
    let maxIdx = 0;

    // Find peak
    values.forEach((v, i) => {
      if (v > maxVal) {
        maxVal = v;
        maxIdx = i;
      }
    });

    // Add peak event
    if (maxIdx > 2 && maxIdx < values.length - 1) {
      events.push({
        index: maxIdx,
        time: data[maxIdx].time,
        label: story.title.length > 30 ? story.title.slice(0, 28) + "..." : story.title,
        storySlug: story.slug,
        type: "peak",
        color,
      });
    }

    // Detect biggest spike (largest increase over 3 intervals)
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
        label: story.title.length > 30 ? story.title.slice(0, 28) + "..." : story.title,
        storySlug: story.slug,
        type: rank === 0 ? "surge" : "breakout",
        color,
      });
    }
  });

  // Deduplicate events that are too close together (within 3 intervals)
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

  return filtered.slice(0, 6); // Max 6 events on timeline
}

function CustomTooltip({ active, payload, label, events }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const sorted = [...payload]
    .filter((p: any) => p.value !== undefined)
    .sort((a: any, b: any) => b.value - a.value);

  // Find events at this time point
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
            <div className="flex items-center gap-1">
              <span
                className="text-[11px] font-bold tabular-nums"
                style={{ color: entry.color }}
              >
                {entry.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventMarker({ cx, cy, event, isHovered, onHover, onLeave }: any) {
  if (!cx || !cy) return null;

  return (
    <g
      onMouseEnter={() => onHover(event)}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Pulse ring */}
      <circle cx={cx} cy={cy} r={isHovered ? 16 : 12} fill={event.color} opacity={0.1}>
        <animate
          attributeName="r"
          from={isHovered ? 16 : 12}
          to={isHovered ? 24 : 18}
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.15"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Inner dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 6 : 4}
        fill={event.color}
        stroke="#fff"
        strokeWidth={2}
      />
      {/* Label flag */}
      {isHovered && (
        <g>
          <rect
            x={cx - 50}
            y={cy - 36}
            width={100}
            height={22}
            fill={event.color}
            rx={0}
          />
          <text
            x={cx}
            y={cy - 22}
            textAnchor="middle"
            fill="white"
            fontSize={9}
            fontWeight="bold"
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {EVENT_LABELS[event.type]}
          </text>
        </g>
      )}
    </g>
  );
}

// Timeline bar below the chart
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
      {/* Timeline track */}
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
            {/* Vertical tick */}
            <div
              className="w-px h-3 mx-auto transition-all"
              style={{ backgroundColor: event.color, opacity: isHovered ? 1 : 0.5 }}
            />
            {/* Dot */}
            <div
              className="w-3 h-3 mx-auto border-2 border-white transition-transform"
              style={{
                backgroundColor: event.color,
                transform: isHovered ? "scale(1.5)" : "scale(1)",
              }}
            />
            {/* Label */}
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

// Story detail card that appears on hover/click
function StorySpotlight({
  story,
  color,
  currentValue,
  changePercent,
  onClose,
}: {
  story: TrendStory;
  color: string;
  currentValue: number;
  changePercent: number;
  onClose: () => void;
}) {
  return (
    <div className="border border-border p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
              {story.category}
            </span>
          </div>
          <Link
            href={`/blog/${story.slug}`}
            className="font-display text-base font-bold hover:underline decoration-1 underline-offset-2 line-clamp-2 block"
          >
            {story.title}
          </Link>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tabular-nums" style={{ color }}>
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
          href={`/blog/${story.slug}`}
          className="text-[10px] font-bold uppercase tracking-editorial hover:underline"
          style={{ color }}
        >
          Read full story
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

export function TrendChart({ stories }: TrendChartProps) {
  const displayStories = stories.slice(0, 5);
  const [activeLines, setActiveLines] = useState<Set<string>>(
    () => new Set(displayStories.map((s) => s.slug))
  );
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const data = useMemo(
    () => generateTrendData(displayStories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayStories.map((s) => s.slug).join(",")]
  );

  const events = useMemo(
    () => detectEvents(data, displayStories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, displayStories.map((s) => s.slug).join(",")]
  );

  // Trigger entrance animation
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

  if (displayStories.length === 0) return null;

  const selectedStoryData = selectedStory
    ? displayStories.find((s) => s.slug === selectedStory)
    : null;
  const selectedStoryIndex = selectedStoryData
    ? displayStories.indexOf(selectedStoryData)
    : -1;
  const selectedCurrentValue = selectedStory
    ? (data[data.length - 1]?.[selectedStory] as number) || 0
    : 0;
  const selectedPrevValue = selectedStory
    ? (data[Math.max(0, data.length - 7)]?.[selectedStory] as number) || 0
    : 0;
  const changePercent =
    selectedPrevValue > 0
      ? Math.round(((selectedCurrentValue - selectedPrevValue) / selectedPrevValue) * 100)
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
          <h3 className="text-[11px] font-bold uppercase tracking-editorial">Trending Now</h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-editorial">
          Live - 10 min intervals
        </span>
      </div>

      {/* Legend / Story selector */}
      <div className="flex flex-wrap gap-1 px-4 md:px-6 py-3 border-b border-border">
        {displayStories.map((story, i) => {
          const color = LINE_COLORS[i % LINE_COLORS.length];
          const isActive = activeLines.has(story.slug);
          const isHovered = hoveredStory === story.slug;
          const currentVal = data[data.length - 1]?.[story.slug] || 0;

          return (
            <button
              key={story.slug}
              onClick={() => {
                toggleLine(story.slug);
                setSelectedStory(story.slug);
              }}
              onMouseEnter={() => setHoveredStory(story.slug)}
              onMouseLeave={() => setHoveredStory(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-editorial border transition-all cursor-pointer ${
                isActive
                  ? "opacity-100"
                  : "opacity-30 hover:opacity-50"
              } ${isHovered || selectedStory === story.slug ? "shadow-sm" : ""}`}
              style={{
                borderColor: isActive ? color : "#e5e5e5",
                backgroundColor:
                  isHovered || selectedStory === story.slug
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
                {story.title.length > 20
                  ? story.title.slice(0, 18) + "..."
                  : story.title}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{ color: isActive ? color : "#999" }}
              >
                {currentVal}
              </span>
            </button>
          );
        })}
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

              {/* Event reference lines */}
              {events.map((event, i) => (
                <ReferenceLine
                  key={`ref-${i}`}
                  x={data[event.index]?.time}
                  stroke={event.color}
                  strokeDasharray="3 3"
                  strokeOpacity={hoveredEvent?.index === event.index ? 0.6 : 0.15}
                />
              ))}

              {/* Story lines */}
              {displayStories.map((story, i) => {
                const color = LINE_COLORS[i % LINE_COLORS.length];
                const isActive = activeLines.has(story.slug);
                const isHighlighted =
                  hoveredStory === story.slug ||
                  selectedStory === story.slug;

                return (
                  <Line
                    key={story.slug}
                    type="monotone"
                    dataKey={story.slug}
                    name={story.title}
                    stroke={color}
                    strokeWidth={
                      isHighlighted ? 4 : isActive ? 2.5 : 0
                    }
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
                        : hoveredStory && hoveredStory !== story.slug
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

      {/* Story Spotlight (when a story or event is selected) */}
      {selectedStoryData && (
        <div className="px-4 md:px-6 pb-4">
          <StorySpotlight
            story={selectedStoryData}
            color={LINE_COLORS[selectedStoryIndex % LINE_COLORS.length]}
            currentValue={selectedCurrentValue}
            changePercent={changePercent}
            onClose={() => setSelectedStory(null)}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-editorial">
          Click stories to highlight - Hover for details - Click timeline events to explore
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
