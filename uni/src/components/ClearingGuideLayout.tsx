import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { getClearingStatus, CLEARING_CYCLE } from "@/lib/clearing";

const ALL_GUIDES = [
  { name: "How Clearing works", href: "/clearing/how-it-works" },
  { name: "If you missed your grades", href: "/clearing/missed-grades" },
  {
    name: "If you did better than expected",
    href: "/clearing/better-than-expected",
  },
  { name: "Key dates", href: "/clearing/key-dates" },
];

interface ClearingGuideLayoutProps {
  title: string;
  standfirst: string;
  /** Slug of this guide so it is excluded from the "read next" list. */
  href: string;
  children: React.ReactNode;
}

export function ClearingGuideLayout({
  title,
  standfirst,
  href,
  children,
}: ClearingGuideLayoutProps) {
  const status = getClearingStatus();
  const others = ALL_GUIDES.filter((g) => g.href !== href);

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uni-uk.ai" },
          { name: `Clearing ${CLEARING_CYCLE.year}`, url: "https://uni-uk.ai/clearing" },
          { name: title, url: `https://uni-uk.ai${href}` },
        ]}
      />
      <MainNavigation />

      <article className="container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <Link
            href="/clearing"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Clearing {CLEARING_CYCLE.year}
          </Link>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.98] mb-4">
            {title}
          </h1>
          <p className="font-body-serif text-lg md:text-xl text-muted-foreground mb-8 pb-8 border-b border-border">
            {standfirst}
          </p>

          <div className="font-body-serif text-base md:text-lg leading-relaxed space-y-6">
            {children}
          </div>

          {/* Always give them the next action */}
          <div className="mt-12 border border-border p-6">
            <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-2">
              {status.eyebrow}
            </p>
            <h2 className="font-display text-2xl font-bold mb-3">
              Find the universities worth calling
            </h2>
            <p className="font-body-serif text-muted-foreground mb-5">
              Search all 140 UK universities by subject, region and entry
              requirements — or ask our adviser what your grades could get you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/universities"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
              >
                Search universities
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/clearing#adviser"
                className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
              >
                Ask the adviser
              </Link>
            </div>
          </div>

          <AdPlaceholder id={`clearing-guide-${href.split("/").pop()}`} />

          <div className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-4">
              Read next
            </h2>
            <ul>
              {others.map((guide) => (
                <li key={guide.href} className="border-b border-border">
                  <Link
                    href={guide.href}
                    className="flex items-center justify-between gap-4 py-3.5 font-display text-lg font-bold hover:text-destructive transition-colors"
                  >
                    {guide.name}
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
