import type { Metadata } from "next";

import { getTopSatisfactionUniversities } from "@/lib/data";
import { RankingPage } from "@/components/RankingPage";
import { satisfactionRankingFAQs } from "@/data/faq-data";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Best UK Universities for Student Satisfaction ${YEAR} | NSS Scores`,
  description: `UK universities ranked by National Student Survey satisfaction scores. The universities students themselves rate highest — useful when choosing in Clearing ${YEAR}.`,
  keywords: [
    "student satisfaction UK universities",
    `NSS scores ${YEAR}`,
    "National Student Survey",
    "happiest university students",
    "best student experience UK",
  ],
  alternates: { canonical: "/rankings/satisfaction" },
  openGraph: {
    title: `Best UK Universities for Student Satisfaction | NSS Scores`,
    description: `UK universities ranked by National Student Survey satisfaction scores.`,
    type: "website",
    url: "https://uni-uk.ai/rankings/satisfaction",
    siteName: "uni-uk.ai",
  },
};

export default function TopSatisfactionPage() {
  const universities = getTopSatisfactionUniversities(30);

  return (
    <RankingPage
      href="/rankings/satisfaction"
      breadcrumbName="Student satisfaction"
      title="Where students rate their experience highest"
      standfirst="Ranked by National Student Survey scores — the only major table filled in by students rather than assembled from institutional data. Worth weighting heavily if you are choosing quickly."
      methodologyTitle="What the NSS measures"
      methodologyBody="The National Student Survey asks final-year undergraduates across the UK about teaching, assessment and feedback, academic support, organisation, learning resources and student voice. Scores here are the percentage of students expressing overall satisfaction. Because it captures what it is actually like to study somewhere, it often diverges sharply from prestige-weighted league tables."
      universities={universities}
      badge={(uni) => `${uni.rankings?.nss ?? "—"}%`}
      position={(_, i) => i + 1}
      faqs={satisfactionRankingFAQs}
      faqTitle="Understanding satisfaction scores"
      schemaName="UK Universities Ranked by Student Satisfaction"
      schemaDescription="UK universities ranked by National Student Survey satisfaction scores"
    />
  );
}
