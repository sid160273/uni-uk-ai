import { SearchBox } from "@/components/SearchBox";
import { UniversityCard } from "@/components/UniversityCard";
import { getAllUniversities } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const universities = getAllUniversities();

  return (
    <main className="min-h-screen bg-background">
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
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#universities" className="hover:text-foreground transition-colors">Universities</Link>
            <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
          </div>
          <a
            href="#search"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section id="search" className="relative py-4 md:py-8 min-h-screen md:min-h-[90vh] flex flex-col md:items-center justify-start md:justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-blue-900/20 dark:via-background dark:to-background pointer-events-none" />

        <div className="container relative mx-auto px-3 md:px-4 w-full">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-3">
              Find Your Perfect <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">UK University</span>
            </h1>
            <p className="text-xs md:text-base text-muted-foreground max-w-xl mx-auto">
              Chat with our AI to discover universities tailored to your needs
            </p>
          </div>

          <SearchBox />
        </div>
      </section>

      {/* Universities Section */}
      <section id="universities" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Suggestions from your chat:</h2>
            </div>
            <Link
              href="/universities"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View All ({universities.length})
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {universities.slice(0, 3).map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">About Uni-UK.AI</h2>
              <p className="text-lg text-muted-foreground">
                Your trusted partner in finding the perfect UK university
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
                <p className="text-muted-foreground">
                  We believe every student deserves to find the perfect university match.
                  Our AI-powered platform makes university discovery simple, personalized, and stress-free.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">Comprehensive Data</h3>
                <p className="text-muted-foreground">
                  Access detailed information about 141 UK universities, including rankings,
                  entry requirements, accommodation, student life, and more.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Our intelligent chat assistant learns about your preferences and goals to
                  provide personalized university recommendations tailored just for you.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3">Always Free</h3>
                <p className="text-muted-foreground">
                  Uni-UK.AI is completely free to use. We're committed to helping students
                  make informed decisions about their future education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Uni-UK.AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
