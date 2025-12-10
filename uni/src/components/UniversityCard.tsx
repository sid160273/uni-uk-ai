"use client";

import Link from "next/link";
import Image from "next/image";
import { University } from "@/lib/data";
import { ArrowRight, MapPin, GraduationCap } from "lucide-react";
import { useState } from "react";

interface UniversityCardProps {
    university: University;
}

export function UniversityCard({ university }: UniversityCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link
            href={`/universities/${university.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20"
        >
            <div className="relative h-48 w-full overflow-hidden">
                {!imageError ? (
                    <Image
                        src={university.imageUrl}
                        alt={university.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/20 to-blue-500/20 flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-primary/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-1 text-sm font-medium opacity-90">
                        <MapPin className="h-3 w-3" />
                        {university.location}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-xl font-bold tracking-tight">{university.name}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {university.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
                    View Profile <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
