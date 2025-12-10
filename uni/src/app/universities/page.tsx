import { getAllUniversities } from "@/lib/data";
import { UniversityCard } from "@/components/UniversityCard";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "All Universities | Uni-UK.AI",
    description: "Browse our comprehensive list of UK universities.",
};

export default function UniversitiesIndexPage() {
    const universities = getAllUniversities();

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="Uni-UK.AI Logo"
                            width={200}
                            height={40}
                            className="h-8 md:h-10 w-auto"
                            priority
                        />
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
                        <Link href="/universities" className="text-foreground font-semibold">Universities</Link>
                        <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
                    </div>
                    <Link
                        href="/#search"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-block"
                    >
                        Back to Chat
                    </Link>
                </div>
            </nav>

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
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    <p>&copy; {new Date().getFullYear()} Uni-UK.AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
