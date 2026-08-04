import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { UniversityCard } from "@/components/UniversityCard";
import { Ad } from "@/components/Ad";
import { FAQ } from "@/components/FAQ";
import { BreadcrumbSchema, ItemListSchema } from "@/components/StructuredData";
import type { FAQItem } from "@/data/faq-data";
import type { University } from "@/lib/data";
import { getClearingStatus } from "@/lib/clearing";

interface RankingPageProps {
  /** Path of this ranking, e.g. "/rankings/academic". */
  href: string;
  breadcrumbName: string;
  title: string;
  standfirst: string;
  /** Explains what the ranking measures — shown above the grid. */
  methodologyTitle: string;
  methodologyBody: string;
  universities: University[];
  /** Renders the badge shown against each university, e.g. "#4" or "91%". */
  badge: (university: University, index: number) => string;
  /** Numeric position for ItemList schema. */
  position: (university: University, index: number) => number;
  faqs: FAQItem[];
  faqTitle: string;
  schemaName: string;
  schemaDescription: string;
}

/**
 * Shared shell for the three ranking pages. They differ only in which metric
 * they sort on and how that metric is labelled, so everything else lives here.
 */
export function RankingPage({
  href,
  breadcrumbName,
  title,
  standfirst,
  methodologyTitle,
  methodologyBody,
  universities,
  badge,
  position,
  faqs,
  faqTitle,
  schemaName,
  schemaDescription,
}: RankingPageProps) {
  const status = getClearingStatus();

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uni-uk.ai" },
          { name: breadcrumbName, url: `https://uni-uk.ai${href}` },
        ]}
      />
      <ItemListSchema
        name={schemaName}
        description={schemaDescription}
        items={universities.map((uni, i) => ({
          name: uni.name,
          url: `https://uni-uk.ai/universities/${uni.slug}`,
          position: position(uni, i),
        }))}
      />
      <MainNavigation />

      <section className="border-b border-border py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
            {status.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.96] mb-4">
            {title}
          </h1>
          <p className="font-body-serif text-lg text-muted-foreground">
            {standfirst}
          </p>
        </div>
      </section>

      <section className="border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-3">
            {methodologyTitle}
          </h2>
          <p className="font-body-serif text-muted-foreground leading-relaxed">
            {methodologyBody}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Ad size="leaderboard" />
      </div>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((uni, index) => (
              <div key={uni.id} className="relative">
                <span className="absolute top-0 left-0 z-10 bg-foreground text-background px-2.5 py-1.5 font-mono text-xs font-bold">
                  {badge(uni, index)}
                </span>
                <UniversityCard university={uni} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Ad size="rectangle" />
      </div>

      <section className="container mx-auto px-4 max-w-3xl">
        <FAQ faqs={faqs} title={faqTitle} />
      </section>

      <section className="border-t border-border py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl font-bold mb-3">
            Rankings are a starting point, not the answer
          </h2>
          <p className="font-body-serif text-muted-foreground mb-6">
            League tables aggregate across an entire institution. In Clearing,
            what matters is the specific course, whether it has places, and
            whether they will take your grades. Use this list to build a
            shortlist, then call.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
            >
              Browse all universities
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/clearing"
              className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
            >
              Clearing guide
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
