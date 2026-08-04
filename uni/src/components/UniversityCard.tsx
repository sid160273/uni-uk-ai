"use client";

import Link from "next/link";
import Image from "next/image";
import { University } from "@/lib/data";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useState } from "react";

interface UniversityCardProps {
    university: University;
}

export function UniversityCard({ university }: UniversityCardProps) {
    const [imageError, setImageError] = useState(false);

    // The stats a student in Clearing actually compares on.
    const stats = [
        university.rankings?.guardian
            ? { label: "Guardian", value: `#${university.rankings.guardian}` }
            : null,
        university.rankings?.nss
            ? { label: "NSS", value: `${university.rankings.nss}%` }
            : null,
        university.locationStats?.costOfLiving
            ? { label: "Living cost", value: university.locationStats.costOfLiving }
            : null,
    ].filter((s): s is { label: string; value: string } => s !== null);

    return (
        <Link
            href={`/universities/${university.slug}`}
            className="group flex flex-col border border-border bg-background hover:border-foreground transition-colors"
        >
            <div className="relative h-44 w-full overflow-hidden bg-muted">
                {!imageError ? (
                    <Image
                        src={university.imageUrl}
                        alt={university.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground mb-1.5">
                    {university.location}
                </p>
                <h3 className="font-display text-xl font-bold leading-tight tracking-tight mb-2">
                    {university.name}
                </h3>
                <p className="font-body-serif mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {university.description}
                </p>

                {stats.length > 0 && (
                    <dl className="flex flex-wrap gap-x-4 gap-y-1 mb-4 pb-4 border-b border-border">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex items-baseline gap-1.5">
                                <dt className="text-[10px] uppercase tracking-editorial text-muted-foreground">
                                    {stat.label}
                                </dt>
                                <dd className="font-mono text-xs font-bold">{stat.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-editorial group-hover:text-destructive transition-colors">
                    View profile
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
            </div>
        </Link>
    );
}
