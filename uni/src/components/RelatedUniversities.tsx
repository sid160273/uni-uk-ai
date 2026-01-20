import Link from "next/link";
import Image from "next/image";
import { MapPin, Trophy, Star } from "lucide-react";
import { University, getAllUniversities } from "@/lib/data";

interface RelatedUniversitiesProps {
  currentUniversity: University;
  maxResults?: number;
}

function getRelatedUniversities(
  currentUniversity: University,
  maxResults: number = 4
): University[] {
  const allUniversities = getAllUniversities();
  const scored: { university: University; score: number }[] = [];

  for (const uni of allUniversities) {
    if (uni.id === currentUniversity.id) continue;

    let score = 0;

    // Same region bonus (check if locations have common keywords)
    const currentCity = currentUniversity.location.split(",")[0].trim().toLowerCase();
    const uniCity = uni.location.split(",")[0].trim().toLowerCase();

    // Check for same country
    if (
      (currentUniversity.location.includes("Scotland") && uni.location.includes("Scotland")) ||
      (currentUniversity.location.includes("Wales") && uni.location.includes("Wales")) ||
      (currentUniversity.location.includes("Northern Ireland") && uni.location.includes("Northern Ireland")) ||
      (currentUniversity.location.includes("London") && uni.location.includes("London"))
    ) {
      score += 3;
    }

    // Similar ranking tier
    if (currentUniversity.rankings.guardian && uni.rankings.guardian) {
      const rankDiff = Math.abs(
        currentUniversity.rankings.guardian - uni.rankings.guardian
      );
      if (rankDiff <= 10) score += 3;
      else if (rankDiff <= 20) score += 2;
      else if (rankDiff <= 30) score += 1;
    }

    // Similar satisfaction scores
    if (currentUniversity.rankings.nss && uni.rankings.nss) {
      const nssDiff = Math.abs(currentUniversity.rankings.nss - uni.rankings.nss);
      if (nssDiff <= 3) score += 2;
      else if (nssDiff <= 5) score += 1;
    }

    // Similar cost of living
    if (
      currentUniversity.locationStats?.costOfLiving &&
      uni.locationStats?.costOfLiving &&
      currentUniversity.locationStats.costOfLiving === uni.locationStats.costOfLiving
    ) {
      score += 2;
    }

    // Similar sports ranking tier
    if (currentUniversity.campusStats?.sportsRanking && uni.campusStats?.sportsRanking) {
      const sportsDiff = Math.abs(
        currentUniversity.campusStats.sportsRanking - uni.campusStats.sportsRanking
      );
      if (sportsDiff <= 10) score += 2;
      else if (sportsDiff <= 20) score += 1;
    }

    // Russell Group or similar features
    const currentFeatures = new Set(currentUniversity.features.map((f) => f.toLowerCase()));
    const matchingFeatures = uni.features.filter((f) =>
      currentFeatures.has(f.toLowerCase())
    );
    score += matchingFeatures.length;

    scored.push({ university: uni, score });
  }

  // Sort by score descending, then by name for consistency
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.university.name.localeCompare(b.university.name);
  });

  return scored.slice(0, maxResults).map((s) => s.university);
}

export function RelatedUniversities({
  currentUniversity,
  maxResults = 4,
}: RelatedUniversitiesProps) {
  const relatedUniversities = getRelatedUniversities(currentUniversity, maxResults);

  if (relatedUniversities.length === 0) return null;

  return (
    <section className="py-12 border-t">
      <h2 className="text-2xl font-bold mb-6">Similar Universities</h2>
      <p className="text-muted-foreground mb-8">
        Based on location, rankings, and characteristics, you might also be interested in:
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {relatedUniversities.map((uni) => (
          <Link
            key={uni.id}
            href={`/universities/${uni.slug}`}
            className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="relative h-32 overflow-hidden">
              <Image
                src={uni.imageUrl}
                alt={uni.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {uni.name}
                </h3>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="line-clamp-1">{uni.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uni.rankings.guardian && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">
                    <Trophy className="w-3 h-3" />
                    #{uni.rankings.guardian}
                  </span>
                )}
                {uni.rankings.nss && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                    <Star className="w-3 h-3" />
                    {uni.rankings.nss}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
