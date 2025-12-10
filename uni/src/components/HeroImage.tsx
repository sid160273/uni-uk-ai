"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

interface HeroImageProps {
    imageUrl: string;
    alt: string;
}

export function HeroImage({ imageUrl, alt }: HeroImageProps) {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-violet-600/30 to-blue-600/30 flex items-center justify-center">
                <GraduationCap className="w-32 h-32 text-white/20" />
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover brightness-50"
            priority
            onError={() => setImageError(true)}
        />
    );
}
