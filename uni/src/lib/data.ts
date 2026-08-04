import universitiesData from "@/data/universities.json";

export interface University {
    id: string;
    slug: string;
    name: string;
    location: string;
    description: string;
    features: string[];
    imageUrl: string;
    rankings: {
        guardian?: number;
        the?: number;
        nss?: number; // Student satisfaction percentage
    };
    locationStats: {
        costOfLiving: "Low" | "Medium" | "High";
        nightlife: number; // 1-5
        vibe: string;
    };
    campusStats: {
        sportsRanking?: number;
        internationalStudents?: number; // percentage
    };
    entryRequirements: string;
    accommodation: string;
    international: string;
    studentLife: string;
    admissions: string;
    travelInfo?: {
        train?: string;
        bus?: string;
        airports?: string[];
        localTransport?: string;
    };
    faculties?: string[];
    stats?: {
        studentSatisfaction?: string;
        employmentRate?: string;
        internationalStudents?: string;
    };
}

// Cast the JSON data to the interface
export const universities: University[] = universitiesData as unknown as University[];

export function getUniversityBySlug(slug: string): University | undefined {
    return universities.find((uni) => uni.slug === slug);
}

export function getAllUniversities(): University[] {
    return universities;
}

// Get universities by region
// Region membership is derived from the university's location string. Kept at
// module scope so the directory can label every university with its region in
// one pass, rather than running nine separate filters.
const REGION_MATCHERS: Record<string, (location: string) => boolean> = {
    'scotland': (loc) => loc.includes('Scotland'),
    'wales': (loc) => loc.includes('Wales'),
    'northern-ireland': (loc) => loc.includes('Northern Ireland'),
    'london': (loc) => loc.includes('London'),
    'north-england': (loc) => loc.match(/Manchester|Liverpool|Leeds|Sheffield|Bradford|York|Newcastle|Durham|Sunderland|Preston|Lancaster|Carlisle|Hull|Middlesbrough/i) !== null && loc.includes('England'),
    'midlands': (loc) => loc.match(/Birmingham|Coventry|Leicester|Nottingham|Derby|Wolverhampton|Stoke|Lincoln/i) !== null && loc.includes('England'),
    'south-west-england': (loc) => loc.match(/Bristol|Bath|Exeter|Plymouth|Gloucester|Cheltenham|Southampton|Portsmouth|Bournemouth/i) !== null && loc.includes('England'),
    'south-east-england': (loc) => loc.match(/Brighton|Canterbury|Rochester|Guildford|Winchester|Reading|Buckingham|Milton Keynes/i) !== null && loc.includes('England'),
    'east-england': (loc) => loc.match(/Cambridge|Oxford|Norwich|Colchester|Luton|Bedford|Hatfield/i) !== null && loc.includes('England'),
};

export const REGION_SLUGS = Object.keys(REGION_MATCHERS);

/** First region a location matches, or null if none of the matchers claim it. */
export function getRegionSlugForLocation(location: string): string | null {
    return REGION_SLUGS.find((slug) => REGION_MATCHERS[slug](location)) ?? null;
}

export function getUniversitiesByRegion(regionSlug: string): University[] {
    const filterFn = REGION_MATCHERS[regionSlug];
    if (!filterFn) return [];

    return universities.filter(uni => filterFn(uni.location)).sort((a, b) => a.name.localeCompare(b.name));
}

// Get region metadata
export function getRegionMetadata(regionSlug: string): { name: string; description: string } | null {
    const metadata: Record<string, { name: string; description: string }> = {
        'scotland': {
            name: 'Scottish Universities',
            description: 'Discover top universities in Scotland, known for their academic excellence, rich history, and vibrant student life. From ancient institutions like St Andrews to modern campuses, Scotland offers world-class education.'
        },
        'wales': {
            name: 'Welsh Universities',
            description: 'Explore universities in Wales offering quality education in stunning locations. Welsh universities combine academic rigor with unique cultural experiences and beautiful landscapes.'
        },
        'northern-ireland': {
            name: 'Northern Ireland Universities',
            description: 'Find universities in Northern Ireland providing excellent education with strong industry links and a welcoming community atmosphere.'
        },
        'london': {
            name: 'London Universities',
            description: 'Browse London\'s diverse range of universities, from world-renowned institutions like UCL and Imperial to specialist colleges. Study in one of the world\'s greatest cities with unmatched cultural and career opportunities.'
        },
        'north-england': {
            name: 'North England Universities',
            description: 'Discover universities across Northern England including Manchester, Leeds, Liverpool, Newcastle, and Durham. Experience quality education with lower living costs and vibrant student cities.'
        },
        'midlands': {
            name: 'Midlands Universities',
            description: 'Explore universities in the Midlands including Birmingham, Nottingham, Leicester, and Coventry. The region offers excellent education at the heart of England with great transport links.'
        },
        'south-west-england': {
            name: 'South West England Universities',
            description: 'Find universities in the South West including Bristol, Bath, Exeter, and Plymouth. Enjoy quality education in beautiful locations with access to coastlines and countryside.'
        },
        'south-east-england': {
            name: 'South East England Universities',
            description: 'Browse universities across the South East including Brighton, Canterbury, Guildford, and Reading. Close to London with excellent transport links and diverse study options.'
        },
        'east-england': {
            name: 'East England Universities',
            description: 'Discover universities in East England including Cambridge, Oxford, and Norwich. Home to some of the world\'s most prestigious institutions and beautiful historic cities.'
        },
    };

    return metadata[regionSlug] || null;
}

// Get top academic universities (by Guardian ranking)
export function getTopAcademicUniversities(limit: number = 20): University[] {
    return universities
        .filter(u => u.rankings && u.rankings.guardian)
        .sort((a, b) => (a.rankings.guardian || 999) - (b.rankings.guardian || 999))
        .slice(0, limit);
}

// Get top sports universities
export function getTopSportsUniversities(limit: number = 20): University[] {
    return universities
        .filter(u => u.campusStats && u.campusStats.sportsRanking)
        .sort((a, b) => (a.campusStats.sportsRanking || 999) - (b.campusStats.sportsRanking || 999))
        .slice(0, limit);
}

// Get top student satisfaction universities (NSS scores)
export function getTopSatisfactionUniversities(limit: number = 20): University[] {
    return universities
        .filter(u => u.rankings && u.rankings.nss)
        .sort((a, b) => (b.rankings.nss || 0) - (a.rankings.nss || 0))
        .slice(0, limit);
}
