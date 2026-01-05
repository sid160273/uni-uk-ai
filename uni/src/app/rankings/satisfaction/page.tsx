import { getTopSatisfactionUniversities } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { Star, Heart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Student Satisfaction Universities in the UK - NSS Rankings | uni-uk.ai",
  description: "Discover UK universities with the highest student satisfaction scores based on National Student Survey (NSS) results. Find where students are happiest and most satisfied with their experience.",
  keywords: ["student satisfaction UK", "NSS rankings", "best student experience", "happy students", "university satisfaction"],
};

export default function TopSatisfactionPage() {
  const universities = getTopSatisfactionUniversities(30);

  return (
    <main className="min-h-screen bg-background">
      <MainNavigation />

      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-700 dark:text-green-400 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Student Satisfaction
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Top Student Satisfaction Universities
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Universities where students are most satisfied with their overall experience,
              based on National Student Survey (NSS) results. These institutions excel at
              student support, teaching quality, and campus life.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="bg-background border rounded-lg px-4 py-2">
                <span className="font-bold text-primary">{universities.length}</span>
                <span className="text-muted-foreground ml-1">Highly Rated Unis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Satisfaction Info */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-background border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">About Student Satisfaction</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The National Student Survey (NSS) is the UK's most comprehensive survey of student opinions.
                  It measures satisfaction with teaching, learning opportunities, assessment and feedback,
                  academic support, organization and management, learning resources, and student voice.
                  High scores indicate universities where students thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Grid with Satisfaction Scores */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((uni, index) => (
              <div key={uni.id} className="relative">
                {/* Satisfaction Badge */}
                <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white px-3 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-lg border-4 border-background min-w-[3rem]">
                  {uni.rankings.nss}%
                </div>
                <UniversityCard university={uni} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Find where you'll be happiest
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Student satisfaction is crucial for your university experience. Explore all universities
            or use our AI to find the perfect match for you.
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
