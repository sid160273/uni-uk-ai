import { getUniversitiesByRegion, getRegionMetadata } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { Ad } from "@/components/Ad";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all regions
export async function generateStaticParams() {
  const regions = [
    'scotland',
    'wales',
    'northern-ireland',
    'london',
    'north-england',
    'midlands',
    'south-west-england',
    'south-east-england',
    'east-england',
  ];

  return regions.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = getRegionMetadata(slug);
  const universities = getUniversitiesByRegion(slug);

  if (!metadata) {
    return {
      title: "Region Not Found - uni-uk.ai",
    };
  }

  const description = `Explore ${universities.length} universities in ${metadata.name}. ${metadata.description.slice(0, 100)}`;

  return {
    title: `${metadata.name} - Find Universities in ${metadata.name} | uni-uk.ai`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `/regions/${slug}`,
    },
    keywords: [
      `${metadata.name}`,
      "UK universities",
      "university finder",
      "student guide",
      metadata.name.toLowerCase().includes('scotland') ? "Scottish universities" : "",
      metadata.name.toLowerCase().includes('wales') ? "Welsh universities" : "",
      metadata.name.toLowerCase().includes('london') ? "London universities" : "",
    ].filter(Boolean),
  };
}

export default async function RegionPage({ params }: PageProps) {
  const { slug } = await params;
  const universities = getUniversitiesByRegion(slug);
  const metadata = getRegionMetadata(slug);

  if (!metadata || universities.length === 0) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "https://uni-uk.ai" },
    { name: "Regions", url: "https://uni-uk.ai/universities" },
    { name: metadata.name, url: `https://uni-uk.ai/regions/${slug}` },
  ];

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbs} />
      <MainNavigation />

      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-background to-violet-50 dark:from-blue-950/20 dark:via-background dark:to-violet-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              {metadata.name}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {metadata.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {metadata.description}
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="bg-background border rounded-lg px-4 py-2">
                <span className="font-bold text-primary">{universities.length}</span>
                <span className="text-muted-foreground ml-1">Universities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Unit 1 */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Ad size="leaderboard" />
          </div>
        </div>
      </section>

      {/* Universities Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        </div>
      </section>

      {/* Ad Unit 2 */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Ad size="rectangle" />
          </div>
        </div>
      </section>

      {/* Back to Browse */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/universities"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            ← Browse All Universities
          </Link>
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
