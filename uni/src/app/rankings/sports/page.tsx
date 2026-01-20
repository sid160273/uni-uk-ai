import { getTopSportsUniversities } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { AdSense } from "@/components/AdSense";
import { BreadcrumbSchema, ItemListSchema } from "@/components/StructuredData";
import { FAQ } from "@/components/FAQ";
import { sportsRankingFAQs } from "@/data/faq-data";
import { Trophy, Medal } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Sports Universities in the UK - Best for Sports & Athletics | uni-uk.ai",
  description: "Best UK universities for sports ranked by BUCS performance. Compare Loughborough, Bath, Durham and 27 more. Find universities with top sports facilities, teams and athletic programmes.",
  keywords: ["best sports universities UK", "Loughborough sport", "athletic universities", "sports facilities", "BUCS", "university sport"],
  alternates: {
    canonical: "/rankings/sports",
  },
};

export default function TopSportsPage() {
  const universities = getTopSportsUniversities(30);

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Rankings", url: "https://uni-uk.ai/rankings/academic" },
    { name: "Top Sports", url: "https://uni-uk.ai/rankings/sports" },
  ];

  const rankingItems = universities.map((uni) => ({
    name: uni.name,
    url: `https://uni-uk.ai/universities/${uni.slug}`,
    position: uni.campusStats.sportsRanking || 0,
  }));

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema
        name="Top Sports Universities in the UK"
        description="UK universities ranked by BUCS sports performance and facilities"
        items={rankingItems}
      />
      <MainNavigation />

      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-background to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Sports Excellence
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Top Sports Universities in the UK
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The best UK universities for sports, featuring world-class facilities, competitive teams,
              and outstanding sports programs. Perfect for student-athletes and sports enthusiasts.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="bg-background border rounded-lg px-4 py-2">
                <span className="font-bold text-primary">{universities.length}</span>
                <span className="text-muted-foreground ml-1">Top Sports Unis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Info */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-background border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Medal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">About Sports Rankings</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These rankings are based on BUCS (British Universities and Colleges Sport) performance,
                  quality of sports facilities, investment in athletics programs, and success in producing
                  elite athletes. Universities here offer exceptional opportunities for competitive and
                  recreational sports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Ad Unit 1 */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AdSense
              adSlot="5017740535"
              adFormat="auto"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* Universities Grid with Rankings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((uni, index) => (
              <div key={uni.id} className="relative">
                {/* Ranking Badge */}
                <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background">
                  #{uni.campusStats.sportsRanking}
                </div>
                <UniversityCard university={uni} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AdSense Ad Unit 2 */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AdSense
              adSlot="5811947452"
              adFormat="auto"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FAQ
              faqs={sportsRankingFAQs}
              title="Sports at UK Universities"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Find your perfect sporting university
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Use our AI-powered search to find universities that match your academic and sporting interests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/universities"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse All Universities
            </Link>
            <Link
              href="/#search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Use AI Search
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/universities" className="hover:text-foreground transition-colors">
              Universities
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} uni-uk.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
