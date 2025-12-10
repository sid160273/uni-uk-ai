import { getUniversityBySlug, getAllUniversities } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Trophy, Users, Building, Globe, BookOpen, GraduationCap, Home, PartyPopper } from "lucide-react";
import { RankingBadge } from "@/components/RankingBadge";
import { HeroImage } from "@/components/HeroImage";
import { AdSense } from "@/components/AdSense";
import { cn } from "@/lib/utils";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const university = getUniversityBySlug(slug);

    if (!university) {
        return {
            title: "University Not Found | Uni-UK.AI",
        };
    }

    return {
        title: `${university.name} - Rankings, Fees & Reviews | Uni-UK.AI`,
        description: `Discover everything about ${university.name}. Rankings, entry requirements, accommodation, student life, and more. Find your perfect university match.`,
        openGraph: {
            title: `${university.name} - Uni-UK.AI`,
            description: university.description.slice(0, 150) + "...",
            images: [university.imageUrl],
        },
    };
}

export async function generateStaticParams() {
    const universities = getAllUniversities();
    // Generate static pages for all universities for optimal SEO and performance
    return universities.map((uni) => ({
        slug: uni.slug,
    }));
}

export default async function UniversityPage({ params }: PageProps) {
    const { slug } = await params;
    const university = getUniversityBySlug(slug);

    if (!university) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background pb-20">
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
                        <Link href="/universities" className="hover:text-foreground transition-colors">Universities</Link>
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
            <div className="relative h-[40vh] min-h-[400px]">
                <HeroImage imageUrl={university.imageUrl} alt={university.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {university.name}
                    </h1>

                    <div className="flex items-center text-white/90 text-lg">
                        <MapPin className="mr-2 h-5 w-5" />
                        {university.location}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {university.description}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {university.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* AdSense Ad Unit 1 - First Horizontal */}
                        <div className="w-full">
                            <AdSense
                                adSlot="5017740535"
                                adFormat="auto"
                                style={{ display: "block" }}
                            />
                        </div>

                        {/* Rankings & Reputation */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                                Rankings & Reputation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <RankingBadge
                                    label="Guardian Ranking"
                                    value={university.rankings.guardian ? `#${university.rankings.guardian}` : "N/A"}
                                    subtext="Overall League Table"
                                />
                                <RankingBadge
                                    label="THE World Ranking"
                                    value={university.rankings.the ? `#${university.rankings.the}` : "N/A"}
                                    subtext="Global Standing"
                                />
                                <RankingBadge
                                    label="Student Satisfaction"
                                    value={university.rankings.nss ? `${university.rankings.nss}%` : "N/A"}
                                    subtext="NSS Score"
                                />
                            </div>
                        </section>

                        {/* Rich Content Sections */}
                        {university.travelInfo && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">🚆</span> Travel & Transport
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Getting Here</h3>
                                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                            {university.travelInfo.train && (
                                                <li className="flex items-start gap-2">
                                                    <span className="font-medium min-w-[60px]">Train:</span>
                                                    <span>{university.travelInfo.train}</span>
                                                </li>
                                            )}
                                            {university.travelInfo.bus && (
                                                <li className="flex items-start gap-2">
                                                    <span className="font-medium min-w-[60px]">Bus:</span>
                                                    <span>{university.travelInfo.bus}</span>
                                                </li>
                                            )}
                                            {university.travelInfo.airports && (
                                                <li className="flex items-start gap-2">
                                                    <span className="font-medium min-w-[60px]">Air:</span>
                                                    <span>{university.travelInfo.airports.join(", ")}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                                        <h3 className="font-semibold mb-2">Local Transport</h3>
                                        <p className="text-muted-foreground">{university.travelInfo.localTransport}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {university.faculties && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-purple-600 dark:text-purple-400">🎓</span> Faculties & Schools
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {university.faculties.map((faculty, index) => (
                                        <div key={index} className="bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                            <p className="font-medium">{faculty}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {university.stats && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-green-600 dark:text-green-400">📊</span> Key Statistics
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-xl text-center border border-green-100 dark:border-green-900">
                                        <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">{university.stats.studentSatisfaction}</div>
                                        <div className="text-sm text-green-800 dark:text-green-300 font-medium">Student Satisfaction</div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl text-center border border-blue-100 dark:border-blue-900">
                                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">{university.stats.employmentRate}</div>
                                        <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Employment Rate</div>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-xl text-center border border-purple-100 dark:border-purple-900">
                                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">{university.stats.internationalStudents}</div>
                                        <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">International Students</div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Entry Requirements */}
                        <section className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <BookOpen className="mr-2 h-6 w-6 text-blue-500" />
                                Entry Requirements
                            </h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {university.entryRequirements || "Specific entry requirements vary by course. Generally, A-level grades ranging from A*AA to BBB are required depending on the program. International Baccalaureate and other qualifications are also accepted."}
                            </p>
                        </section>

                        {/* Accommodation */}
                        <section className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <Home className="mr-2 h-6 w-6 text-green-500" />
                                Accommodation
                            </h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {university.accommodation || "A wide range of accommodation options are available, including catered and self-catered halls. Guaranteed accommodation is often provided for first-year undergraduate students who apply by the deadline."}
                            </p>
                        </section>

                        {/* Student Life */}
                        <section className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <PartyPopper className="mr-2 h-6 w-6 text-purple-500" />
                                Student Life
                            </h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {university.studentLife || "With a vibrant students' union, over 100 societies, and numerous sports clubs, there's something for everyone. The campus hosts regular events, and the city offers a fantastic nightlife and cultural scene."}
                            </p>
                        </section>

                        {/* AdSense Ad Unit 2 - Second Horizontal */}
                        <div className="w-full">
                            <AdSense
                                adSlot="5811947452"
                                adFormat="auto"
                                style={{ display: "block" }}
                            />
                        </div>

                        {/* Admissions */}
                        <section className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <GraduationCap className="mr-2 h-6 w-6 text-orange-500" />
                                Admissions
                            </h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {university.admissions || "Applications for full-time undergraduate courses should be made through UCAS. The institution code and course codes can be found on the UCAS website. Personal statements and references are key parts of the selection process."}
                            </p>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Key Stats Card */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-semibold text-lg mb-4">At a Glance</h3>

                            <div className="space-y-4">
                                {university.locationStats && (
                                    <>
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div className="flex items-center text-muted-foreground">
                                                <Building className="mr-2 h-4 w-4" />
                                                <span>Cost of Living</span>
                                            </div>
                                            <span className={cn(
                                                "font-medium px-2 py-0.5 rounded text-sm",
                                                university.locationStats.costOfLiving === "High" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                university.locationStats.costOfLiving === "Medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                                university.locationStats.costOfLiving === "Low" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                            )}>
                                                {university.locationStats.costOfLiving}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div className="flex items-center text-muted-foreground">
                                                <PartyPopper className="mr-2 h-4 w-4" />
                                                <span>Nightlife</span>
                                            </div>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-2 w-2 rounded-full mx-0.5",
                                                            i < university.locationStats.nightlife ? "bg-primary" : "bg-muted"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div className="flex items-center text-muted-foreground">
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>Vibe</span>
                                            </div>
                                            <span className="font-medium">{university.locationStats.vibe}</span>
                                        </div>
                                    </>
                                )}

                                {university.campusStats && (
                                    <>
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <div className="flex items-center text-muted-foreground">
                                                <Trophy className="mr-2 h-4 w-4" />
                                                <span>Sports Ranking</span>
                                            </div>
                                            <span className="font-medium">
                                                {university.campusStats.sportsRanking ? `#${university.campusStats.sportsRanking}` : "N/A"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center text-muted-foreground">
                                                <Globe className="mr-2 h-4 w-4" />
                                                <span>Intl. Students</span>
                                            </div>
                                            <span className="font-medium">
                                                {university.campusStats.internationalStudents ? `${university.campusStats.internationalStudents}%` : "N/A"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <a
                                href={`https://${university.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block text-center"
                            >
                                Visit Website
                            </a>
                        </div>

                        {/* AdSense Ad Unit 3 - Vertical 1 */}
                        <div className="w-full">
                            <AdSense
                                adSlot="4285622107"
                                adFormat="auto"
                                style={{ display: "block" }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
