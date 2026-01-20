import { getTopAcademicUniversities } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { AdSense } from "@/components/AdSense";
import { BreadcrumbSchema, ItemListSchema } from "@/components/StructuredData";
import { FAQ } from "@/components/FAQ";
import { academicRankingFAQs } from "@/data/faq-data";
import { Star, Award } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Academic Universities in the UK - Guardian Rankings | uni-uk.ai",
  description: "Discover the top 30 UK universities ranked by Guardian University Guide 2024. Compare Oxford, Cambridge, Imperial and more by academic excellence, research quality and graduate outcomes.",
  keywords: ["top UK universities", "best universities UK", "Guardian rankings", "academic excellence", "Oxford", "Cambridge", "Russell Group"],
  alternates: {
    canonical: "/rankings/academic",
  },
};

export default function TopAcademicPage() {
  const universities = getTopAcademicUniversities(30);

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Rankings", url: "https://uni-uk.ai/rankings/academic" },
    { name: "Top Academic", url: "https://uni-uk.ai/rankings/academic" },
  ];

  const rankingItems = universities.map((uni, index) => ({
    name: uni.name,
    url: `https://uni-uk.ai/universities/${uni.slug}`,
    position: uni.rankings.guardian || index + 1,
  }));

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema
        name="Top Academic Universities in the UK"
        description="UK universities ranked by Guardian University Guide academic excellence"
        items={rankingItems}
      />
      <MainNavigation />

      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-yellow-50 via-background to-orange-50 dark:from-yellow-950/20 dark:via-background dark:to-orange-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Academic Excellence
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Top Academic Universities in the UK
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The highest-ranked universities in the UK based on the Guardian University Guide.
              These institutions are recognized globally for their academic excellence, world-class research, and outstanding teaching.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="bg-background border rounded-lg px-4 py-2">
                <span className="font-bold text-primary">{universities.length}</span>
                <span className="text-muted-foreground ml-1">Top Universities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Info */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-background border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">About Guardian Rankings</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The Guardian University Guide is one of the UK's most trusted university rankings.
                  It measures teaching quality, student satisfaction, graduate employment prospects,
                  and research quality. Universities ranked here represent the best in UK higher education.
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
                <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background">
                  #{uni.rankings.guardian}
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
              faqs={academicRankingFAQs}
              title="Understanding Academic Rankings"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Looking for more universities?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Explore all 140 UK universities or browse by region to find your perfect match.
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
