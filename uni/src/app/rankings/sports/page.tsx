import type { Metadata } from "next";

import { getTopSportsUniversities } from "@/lib/data";
import { RankingPage } from "@/components/RankingPage";
import { sportsRankingFAQs } from "@/data/faq-data";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Best UK Universities for Sport ${YEAR} | Facilities and Teams`,
  description: `UK universities ranked for sport — facilities, BUCS performance and scholarships. Compare before you choose in Clearing ${YEAR}.`,
  keywords: [
    "best universities for sport UK",
    "BUCS rankings",
    "university sports scholarships",
    "university sports facilities",
    "sport science degree UK",
  ],
  alternates: { canonical: "/rankings/sports" },
  openGraph: {
    title: `Best UK Universities for Sport | Facilities and Teams`,
    description: `UK universities ranked for sports facilities, competitive performance and scholarships.`,
    type: "website",
    url: "https://uni-uk.ai/rankings/sports",
    siteName: "uni-uk.ai",
  },
};

export default function TopSportsPage() {
  const universities = getTopSportsUniversities(30);

  return (
    <RankingPage
      href="/rankings/sports"
      breadcrumbName="Top for sport"
      title="The best UK universities for sport"
      standfirst="Ranked on facilities, competitive performance and the support available to student athletes — whether you compete seriously or just want a gym and a team worth joining."
      methodologyTitle="What this ranking reflects"
      methodologyBody="Position here reflects performance in British Universities and Colleges Sport competition alongside the quality and breadth of on-campus facilities. Universities near the top typically run scholarship programmes, employ full-time coaching staff, and field teams across a wide range of sports rather than excelling in one or two."
      universities={universities}
      badge={(uni, i) => `#${uni.campusStats?.sportsRanking ?? i + 1}`}
      position={(uni, i) => uni.campusStats?.sportsRanking ?? i + 1}
      faqs={sportsRankingFAQs}
      faqTitle="Sport at university, answered"
      schemaName="Best UK Universities for Sport"
      schemaDescription="UK universities ranked by sports facilities and competitive performance"
    />
  );
}
