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
