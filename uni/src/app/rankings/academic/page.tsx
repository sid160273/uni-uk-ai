import type { Metadata } from "next";

import { getTopAcademicUniversities } from "@/lib/data";
import { RankingPage } from "@/components/RankingPage";
import { academicRankingFAQs } from "@/data/faq-data";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Top 30 UK Universities ${YEAR} | Guardian Academic Rankings`,
  description: `The top 30 UK universities by Guardian University Guide ranking. Compare academic standing, entry requirements and student satisfaction for Clearing ${YEAR}.`,
  keywords: [
    "top UK universities",
    "best universities UK",
    `Guardian rankings ${YEAR}`,
    "academic excellence",
    "Russell Group",
    "university league table",
  ],
  alternates: { canonical: "/rankings/academic" },
  openGraph: {
    title: `Top 30 UK Universities | Guardian Academic Rankings`,
    description: `Top 30 UK universities ranked by the Guardian University Guide.`,
    type: "website",
    url: "https://uni-uk.ai/rankings/academic",
    siteName: "uni-uk.ai",
  },
};

export default function TopAcademicPage() {
  const universities = getTopAcademicUniversities(30);

  return (
    <RankingPage
      href="/rankings/academic"
      breadcrumbName="Top academic"
      title="Top academic universities in the UK"
      standfirst="The highest-ranked UK universities in the Guardian University Guide. Several of these appear in Clearing most years — a strong league-table position does not mean the door is closed."
      methodologyTitle="What the Guardian ranking measures"
      methodologyBody="The Guardian University Guide weights teaching quality, student feedback, spend per student, graduate employment outcomes and the gap between entry grades and final degree results. Unlike some tables it excludes research output, which makes it a closer proxy for the undergraduate experience than for institutional prestige."
      universities={universities}
      badge={(uni, i) => `#${uni.rankings?.guardian ?? i + 1}`}
      position={(uni, i) => uni.rankings?.guardian ?? i + 1}
      faqs={academicRankingFAQs}
      faqTitle="Understanding academic rankings"
      schemaName="Top Academic Universities in the UK"
      schemaDescription="UK universities ranked by Guardian University Guide academic performance"
    />
  );
}
