import { SearchBox } from "@/components/SearchBox";
import { UniversityCard } from "@/components/UniversityCard";
import { MainNavigation } from "@/components/MainNavigation";
import { getAllUniversities } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const universities = getAllUniversities();

  return (
    <main className="min-h-screen bg-background">
      <MainNavigation />

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

      {/* Explore Universities Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-violet-50/30 dark:from-primary/5 dark:via-background dark:to-violet-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Explore Universities</h2>
              <p className="text-lg text-muted-foreground">
                Browse by location, rankings, and more
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Browse All */}
              <Link
                href="/universities"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold">Browse All Universities</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Explore our complete directory of {universities.length} UK universities
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View all →
                </span>
              </Link>

              {/* Top Academic */}
              <Link
                href="/rankings/academic"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold">Top Ranked - Academic</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Discover the highest-ranked universities by academic excellence
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View rankings →
                </span>
              </Link>

              {/* Top Sports */}
              <Link
                href="/rankings/sports"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <h3 className="text-xl font-semibold">Top Ranked - Sports</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Find universities with the best sports facilities and programs
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View rankings →
                </span>
              </Link>

              {/* Top Satisfaction */}
              <Link
                href="/rankings/satisfaction"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="text-xl font-semibold">Student Satisfaction</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Universities rated highest by students for overall experience
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View rankings →
                </span>
              </Link>

              {/* Scotland */}
              <Link
                href="/regions/scotland"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                  </div>
                  <h3 className="text-xl font-semibold">Scottish Universities</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Explore universities in Scotland with rich heritage and excellence
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View region →
                </span>
              </Link>

              {/* London */}
              <Link
                href="/regions/london"
                className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-semibold">London Universities</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Study in the UK's vibrant capital city with world-class institutions
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  View region →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">About uni-uk.ai</h2>
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
                  uni-uk.ai is completely free to use. We're committed to helping students
                  make informed decisions about their future education.
                </p>
              </div>
            </div>
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
