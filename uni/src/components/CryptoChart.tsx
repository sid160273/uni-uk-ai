"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface CryptoChartProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice?: number;
  change24h?: number;
}

interface PricePoint {
  time: string;
  timestamp: number;
  price: number;
}

const TIME_RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-gray-900 text-white rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400">{data.time}</p>
      <p className="font-bold text-lg">
        £{data.price.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: data.price < 1 ? 6 : 2 })}
      </p>
    </div>
  );
}

export function CryptoChart({ coinId, coinName, coinSymbol, currentPrice, change24h }: CryptoChartProps) {
  const [selectedRange, setSelectedRange] = useState(1); // index into TIME_RANGES
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const days = TIME_RANGES[selectedRange].days;
        const res = await fetch(`/api/crypto/prices?coin=${coinId}&days=${days}`);
        const data = await res.json();

        if (data.prices && data.prices.length > 0) {
          // Sample data points to keep chart performant
          const maxPoints = 100;
          const step = Math.max(1, Math.floor(data.prices.length / maxPoints));
          const points: PricePoint[] = [];

          for (let i = 0; i < data.prices.length; i += step) {
            const [timestamp, price] = data.prices[i];
            const date = new Date(timestamp);
            const time = days <= 1
              ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

            points.push({ time, timestamp, price });
          }

          setPriceData(points);
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, [coinId, selectedRange]);

  const isPositive = useMemo(() => {
    if (priceData.length < 2) return true;
    return priceData[priceData.length - 1].price >= priceData[0].price;
  }, [priceData]);

  const chartColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `gradient-${coinId}`;

  const [minPrice, maxPrice] = useMemo(() => {
    if (priceData.length === 0) return [0, 100];
    const prices = priceData.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [priceData]);

  return (
    <div className="bg-card border rounded-xl p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{coinName}</h3>
            <span className="text-muted-foreground text-sm">{coinSymbol.toUpperCase()}</span>
          </div>
          {currentPrice != null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                £{currentPrice.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: currentPrice < 1 ? 6 : 2 })}
              </span>
              {change24h != null && (
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  change24h >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {change24h >= 0 ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time range selector */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {TIME_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(i)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                i === selectedRange
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 260 }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
          </div>
        ) : priceData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#999" }}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#999" }}
                tickLine={false}
                axisLine={false}
                domain={[minPrice, maxPrice]}
                tickFormatter={(v) => `£${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 1 ? 4 : 2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/**
 * Mini sparkline chart for coin cards
 */
export function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
