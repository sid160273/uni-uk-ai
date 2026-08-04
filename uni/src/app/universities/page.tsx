import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
    getAllUniversities,
    getRegionSlugForLocation,
    getRegionMetadata,
    REGION_SLUGS,
} from "@/lib/data";
import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { UniversityDirectory, type DirectoryEntry } from "@/components/UniversityDirectory";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { CLEARING_CYCLE, getClearingStatus } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
    title: `All UK Universities A–Z | Clearing ${YEAR} Directory`,
    description: `Browse all 140 UK universities for Clearing ${YEAR}. Search by city or region, sort by Guardian ranking or student satisfaction, and compare entry requirements before you call.`,
    keywords: [
        "UK universities list",
        "all universities UK",
        "university directory",
        `clearing ${YEAR} universities`,
        "UK higher education",
        "university rankings",
    ],
    alternates: { canonical: "/universities" },
    openGraph: {
        title: `All UK Universities A–Z | Clearing ${YEAR} Directory`,
        description: `Search 140 UK universities by region and ranking. Compare entry requirements, satisfaction scores and cost of living.`,
        type: "website",
        url: "https://uni-uk.ai/universities",
        siteName: "uni-uk.ai",
    },
};

/** Short region labels — the full metadata names are too long for filter chips. */
const REGION_LABELS: Record<string, string> = {
    london: "London",
    scotland: "Scotland",
    wales: "Wales",
    "northern-ireland": "N. Ireland",
    "north-england": "North",
    midlands: "Midlands",
    "south-west-england": "South West",
    "south-east-england": "South East",
    "east-england": "East",
};

export default function UniversitiesIndexPage() {
    const universities = getAllUniversities();
    const status = getClearingStatus();

    const entries: DirectoryEntry[] = universities.map((university) => ({
        university,
        regionSlug: getRegionSlugForLocation(university.location),
    }));

    const regions = REGION_SLUGS.map((slug) => ({
        slug,
        name: REGION_LABELS[slug] ?? getRegionMetadata(slug)?.name ?? slug,
        count: entries.filter((e) => e.regionSlug === slug).length,
    })).filter((region) => region.count > 0);

    return (
        <main className="min-h-screen bg-background">
            <BreadcrumbSchema
                items={[
                    { name: "Home", url: "https://uni-uk.ai" },
                    { name: "Universities", url: "https://uni-uk.ai/universities" },
                ]}
            />
            <MainNavigation />

            <section className="border-b border-border py-10 md:py-14">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
                            {status.eyebrow}
                        </p>
                        <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.96] mb-4">
                            Every UK university
                        </h1>
                        <p className="font-body-serif text-lg text-muted-foreground mb-6">
                            All {universities.length} of them, with Guardian rankings, National
                            Student Survey scores, entry requirements and cost of living.
                            Filter to a region, sort by what matters to you, and build the
                            shortlist you will actually call.
                        </p>
                        <Link
                            href="/clearing"
                            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-editorial hover:text-destructive transition-colors"
                        >
                            New to Clearing? Start here
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-16">
                <UniversityDirectory entries={entries} regions={regions} />
            </section>

            <SiteFooter />
        </main>
    );
}
