"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { University } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { cn } from "@/lib/utils";

export interface DirectoryEntry {
  university: University;
  regionSlug: string | null;
}

interface RegionOption {
  slug: string;
  name: string;
  count: number;
}

type SortKey = "name" | "academic" | "satisfaction";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "name", label: "A–Z" },
  { key: "academic", label: "Guardian rank" },
  { key: "satisfaction", label: "Satisfaction" },
];

/**
 * Sort comparators. Universities missing the ranking a sort needs go last
 * rather than being treated as rank 0.
 */
const COMPARATORS: Record<SortKey, (a: University, b: University) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  academic: (a, b) =>
    (a.rankings?.guardian ?? Number.MAX_SAFE_INTEGER) -
    (b.rankings?.guardian ?? Number.MAX_SAFE_INTEGER),
  satisfaction: (a, b) => (b.rankings?.nss ?? -1) - (a.rankings?.nss ?? -1),
};

interface UniversityDirectoryProps {
  entries: DirectoryEntry[];
  regions: RegionOption[];
}

export function UniversityDirectory({
  entries,
  regions,
}: UniversityDirectoryProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return entries
      .filter((entry) => {
        if (region && entry.regionSlug !== region) return false;
        if (!needle) return true;
        const haystack = `${entry.university.name} ${entry.university.location}`;
        return haystack.toLowerCase().includes(needle);
      })
      .map((entry) => entry.university)
      .sort(COMPARATORS[sort]);
  }, [entries, query, region, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="border-y border-border py-4 mb-8 sticky top-14 bg-background z-40">
        <div className="flex items-center gap-2 border border-border px-3 py-2.5 mb-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by university or city…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search universities"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground mr-1">
              Region
            </span>
            <button
              onClick={() => setRegion(null)}
              className={cn(
                "px-3 py-1.5 text-xs border transition-colors",
                region === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              All
            </button>
            {regions.map((option) => (
              <button
                key={option.slug}
                onClick={() =>
                  setRegion(region === option.slug ? null : option.slug)
                }
                className={cn(
                  "px-3 py-1.5 text-xs border transition-colors",
                  region === option.slug
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:border-foreground"
                )}
              >
                {option.name}{" "}
                <span className="opacity-60">{option.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground mr-1">
              Sort
            </span>
            {SORTS.map((option) => (
              <button
                key={option.key}
                onClick={() => setSort(option.key)}
                className={cn(
                  "px-3 py-1.5 text-xs border transition-colors",
                  sort === option.key
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:border-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-editorial text-muted-foreground mb-6">
        {results.length} {results.length === 1 ? "university" : "universities"}
        {region && ` in ${regions.find((r) => r.slug === region)?.name}`}
        {query && ` matching “${query}”`}
      </p>

      {results.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((uni) => (
            <UniversityCard key={uni.id} university={uni} />
          ))}
        </div>
      ) : (
        <div className="border border-border p-10 text-center">
          <p className="font-display text-2xl font-bold mb-2">
            Nothing matches that
          </p>
          <p className="font-body-serif text-muted-foreground mb-5">
            Try a city name, or clear the filters and browse the full list.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setRegion(null);
            }}
            className="bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
