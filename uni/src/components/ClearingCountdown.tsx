"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function partsUntil(targetIso: string, now: number): Parts {
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

interface ClearingCountdownProps {
  targetIso: string;
  /** What we are counting down to, e.g. "A-level results day". */
  label: string;
  /** Rendered on the server so first paint matches hydration. */
  initialNow: number;
  href?: string;
}

/**
 * Results-day countdown. Server passes the instant it rendered at so the first
 * client paint is identical, then the clock takes over on mount.
 */
export function ClearingCountdown({
  targetIso,
  label,
  initialNow,
  href = "/clearing",
}: ClearingCountdownProps) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } = partsUntil(targetIso, now);
  const units: Array<[number, string]> = [
    [days, "days"],
    [hours, "hrs"],
    [minutes, "min"],
    [seconds, "sec"],
  ];

  return (
    <Link
      href={href}
      className="block bg-foreground text-background hover:opacity-90 transition-opacity"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-center">
        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-editorial">
          {label}
        </span>
        <span
          className="flex items-baseline gap-2 font-mono tabular-nums"
          suppressHydrationWarning
        >
          {units.map(([value, unit]) => (
            <span key={unit} className="flex items-baseline gap-1">
              <span className="text-sm md:text-base font-bold">
                {pad(value)}
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-editorial opacity-70">
                {unit}
              </span>
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
