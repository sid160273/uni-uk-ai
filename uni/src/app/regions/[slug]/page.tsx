import { getUniversitiesByRegion, getRegionMetadata } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
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
    title: `Universities in ${metadata.name} 2026 | Compare Rankings & Courses`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `/regions/${slug}`,
    },
    keywords: [
      `universities in ${metadata.name}`,
      `${metadata.name} universities`,
      "UK universities",
      "university finder",
      "student guide",
      metadata.name.toLowerCase().includes('scotland') ? "Scottish universities" : "",
      metadata.name.toLowerCase().includes('wales') ? "Welsh universities" : "",
      metadata.name.toLowerCase().includes('london') ? "London universities" : "",
    ].filter(Boolean),
    openGraph: {
      title: `Universities in ${metadata.name} | Compare & Choose | uni-uk.ai`,
      description: description.slice(0, 160),
      type: "website",
      url: `https://uni-uk.ai/regions/${slug}`,
      siteName: "uni-uk.ai",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: `Universities in ${metadata.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Universities in ${metadata.name} 2026 | uni-uk.ai`,
      description: description.slice(0, 160),
      images: ["/logo.png"],
    },
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
      <section className="border-b border-border py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
              <MapPin className="w-3.5 h-3.5" />
              {universities.length} universities
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.96] mb-4">
              {metadata.name}
            </h1>
            <p className="font-body-serif text-lg text-muted-foreground">
              {metadata.description}
            </p>
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

      {/* Next steps */}
      <section className="border-t border-border py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl font-bold mb-3">
            Calling universities in {metadata.name}?
          </h2>
          <p className="font-body-serif text-muted-foreground mb-6">
            Regional demand is uneven in Clearing. Courses that fill instantly in
            one part of the UK stay open for days in another — which is why
            widening your search geographically is usually the fastest way to
            find a place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/clearing"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
            >
              Clearing guide
            </Link>
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
            >
              All universities
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
