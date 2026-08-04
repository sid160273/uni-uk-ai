import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";

import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { ClearingCountdown } from "@/components/ClearingCountdown";
import { ClearingAdviser } from "@/components/ClearingAdviser";
import { UniversityCard } from "@/components/UniversityCard";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { BreadcrumbSchema } from "@/components/StructuredData";
import {
  CLEARING_CYCLE,
  CLEARING_SCENARIOS,
  getClearingStatus,
  getTimeline,
} from "@/lib/clearing";
import { getTopAcademicUniversities, getAllUniversities } from "@/lib/data";

// The whole page keys off "what time is it in the Clearing cycle", so it must
// not be cached across the boundary of a milestone.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `UCAS Clearing ${CLEARING_CYCLE.year} | Find a University Place | uni-uk.ai`,
  description: `Clearing ${CLEARING_CYCLE.year} guidance for UK students. Search 140 UK universities, compare entry requirements and rankings, and get instant answers from our Clearing adviser.`,
  keywords: [
    `clearing ${CLEARING_CYCLE.year}`,
    "ucas clearing",
    "university clearing",
    "clearing courses",
    "a level results day",
    "missed my grades",
    "uk universities",
    "university places",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `UCAS Clearing ${CLEARING_CYCLE.year} | Find a University Place`,
    description: `Search 140 UK universities, compare entry requirements, and get instant Clearing guidance.`,
    type: "website",
    url: "https://uni-uk.ai",
    siteName: "uni-uk.ai",
  },
};

const REGION_LINKS = [
  { name: "London", slug: "london" },
  { name: "Scotland", slug: "scotland" },
  { name: "North England", slug: "north-england" },
  { name: "Midlands", slug: "midlands" },
  { name: "South West", slug: "south-west-england" },
  { name: "Wales", slug: "wales" },
];

const RANKING_LINKS = [
  {
    name: "Top academic",
    href: "/rankings/academic",
    detail: "Ranked by Guardian league table position",
  },
  {
    name: "Student satisfaction",
    href: "/rankings/satisfaction",
    detail: "Ranked by National Student Survey scores",
  },
  {
    name: "Top for sport",
    href: "/rankings/sports",
    detail: "Best facilities, teams and scholarships",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default function Home() {
  const now = new Date();
  const status = getClearingStatus(now);
  const timeline = getTimeline(now);
  const featured = getTopAcademicUniversities(6);
  const total = getAllUniversities().length;

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[{ name: "Home", url: "https://uni-uk.ai" }]} />
      <MainNavigation />

      {status.focus && status.daysToFocus !== null && (
        <ClearingCountdown
          targetIso={status.focus.iso}
          label={`${status.focus.label} — ${formatDate(status.focus.iso)}`}
          initialNow={now.getTime()}
        />
      )}

      {/* Hero */}
      <section className="border-b border-border py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
              {status.eyebrow}
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-4">
              {status.headline}
            </h1>
            <p className="font-body-serif text-lg md:text-xl text-muted-foreground max-w-2xl mb-7">
              {status.standfirst}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/universities"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
              >
                Search {total} universities
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/clearing/how-it-works"
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-[11px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
              >
                How Clearing works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What to do now */}
      <section className="border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-6">
            What to do now
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {CLEARING_SCENARIOS.map((scenario, i) => (
              <Link
                key={scenario.id}
                href={scenario.href}
                className="group border border-border p-6 hover:border-foreground transition-colors flex flex-col"
              >
                <span className="font-mono text-xs text-muted-foreground mb-3">
                  0{i + 1}
                </span>
                <h3 className="font-display text-2xl font-bold leading-tight mb-3">
                  {scenario.situation}
                </h3>
                <p className="font-body-serif text-sm text-muted-foreground leading-relaxed mb-4 grow">
                  {scenario.summary}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-editorial group-hover:text-destructive transition-colors">
                  What to do
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Adviser + key dates */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-6">
                Ask the Clearing adviser
              </h2>
              <p className="font-body-serif text-muted-foreground mb-5">
                Tell it your grades and the subject you want. It searches all{" "}
                {total} universities in our database, compares your grades
                against entry requirements, and tells you who is worth calling.
              </p>
              <ClearingAdviser />
            </div>

            <aside className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-4">
                  Key dates {CLEARING_CYCLE.year}
                </h2>
                <ol className="space-y-0">
                  {timeline.map((date) => (
                    <li
                      key={date.id}
                      className="flex gap-4 py-3 border-b border-border last:border-0"
                    >
                      <span
                        className={`font-mono text-xs whitespace-nowrap pt-0.5 ${
                          date.passed
                            ? "text-muted-foreground line-through"
                            : "text-destructive font-bold"
                        }`}
                      >
                        {formatDate(date.iso)}
                      </span>
                      <span
                        className={`text-sm ${
                          date.passed
                            ? "text-muted-foreground"
                            : "font-semibold"
                        }`}
                      >
                        {date.label}
                      </span>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/clearing/key-dates"
                  className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold uppercase tracking-editorial hover:text-destructive transition-colors"
                >
                  Full calendar
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  <h3 className="text-[11px] font-bold uppercase tracking-editorial">
                    Talk to UCAS
                  </h3>
                </div>
                <p className="font-body-serif text-sm text-muted-foreground mb-3">
                  If you are stuck on the Hub itself — your Clearing number, your
                  status, adding a choice — UCAS can help directly.
                </p>
                <a
                  href="tel:03714680468"
                  className="font-display text-2xl font-bold hover:text-destructive transition-colors"
                >
                  0371 468 0468
                </a>
              </div>

              <AdPlaceholder id="home-sidebar" format="rectangle" />
            </aside>
          </div>
        </div>
      </section>

      {/* Featured universities */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between border-b-2 border-foreground pb-1.5 mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-editorial">
              Top-ranked universities
            </h2>
            <Link
              href="/universities"
              className="text-[11px] font-bold uppercase tracking-editorial hover:text-destructive transition-colors"
            >
              All {total} &rarr;
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-4">
              Browse by ranking
            </h2>
            <ul>
              {RANKING_LINKS.map((ranking) => (
                <li key={ranking.href} className="border-b border-border">
                  <Link
                    href={ranking.href}
                    className="group flex items-start justify-between gap-4 py-4 hover:text-destructive transition-colors"
                  >
                    <span>
                      <span className="font-display text-xl font-bold block">
                        {ranking.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {ranking.detail}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 mt-1.5 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-4">
              Browse by region
            </h2>
            <div className="flex flex-wrap gap-2">
              {REGION_LINKS.map((region) => (
                <Link
                  key={region.slug}
                  href={`/regions/${region.slug}`}
                  className="border border-border px-4 py-2.5 text-sm font-semibold hover:border-foreground transition-colors"
                >
                  {region.name}
                </Link>
              ))}
            </div>
            <p className="font-body-serif text-sm text-muted-foreground mt-6">
              Where you study changes your cost of living as much as your course
              does. Each region page compares rent, transport and the character
              of the cities in it.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
