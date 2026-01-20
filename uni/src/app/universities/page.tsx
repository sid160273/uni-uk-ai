import { getAllUniversities } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
    title: "All UK Universities A-Z - Complete University Directory | uni-uk.ai",
    description: "Complete directory of 140+ UK universities A-Z. Compare rankings, entry requirements, student satisfaction, accommodation and more. Find your perfect university match.",
    keywords: ["UK universities list", "all universities UK", "university directory", "find universities", "UK higher education"],
    alternates: {
        canonical: "/universities",
    },
};

export default function UniversitiesIndexPage() {
    const universities = getAllUniversities();

    return (
        <div className="min-h-screen bg-background">
            <MainNavigation />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
                <div className="container relative mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                        All Universities
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explore our complete directory of {universities.length} UK universities.
                    </p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="container mx-auto px-4 pb-20">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {universities.map((uni) => (
                        <UniversityCard key={uni.id} university={uni} />
                    ))}
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
        </div>
    );
}
