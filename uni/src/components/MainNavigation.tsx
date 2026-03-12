"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Flame, Newspaper, GraduationCap, Zap, MapPin, Trophy, Star, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Dropdown({ title, icon, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:text-foreground transition-colors py-2"
        aria-expanded={isOpen}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {title}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-xl z-50 min-w-[280px] max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

const categories = [
  { name: "Sports", slug: "sports", icon: "&#9917;" },
  { name: "Politics", slug: "politics", icon: "&#127963;" },
  { name: "Entertainment", slug: "entertainment", icon: "&#127916;" },
  { name: "Technology", slug: "technology", icon: "&#128187;" },
  { name: "Business", slug: "business", icon: "&#128200;" },
  { name: "Science", slug: "science", icon: "&#128300;" },
  { name: "Health", slug: "health", icon: "&#129657;" },
  { name: "World", slug: "world", icon: "&#127758;" },
  { name: "Culture", slug: "culture", icon: "&#127912;" },
  { name: "Breaking", slug: "breaking", icon: "&#128680;" },
];

export function MainNavigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="uni-uk.ai Logo"
              width={200}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/#trending" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500" />
              Trending
            </Link>

            <Dropdown title="Categories" icon={<Newspaper className="w-4 h-4" />}>
              <div className="p-2">
                <Link
                  href="/blog"
                  className="block px-4 py-2 hover:bg-muted rounded-md transition-colors font-semibold text-foreground"
                >
                  All Stories
                </Link>
                <div className="my-2 border-t" />
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span dangerouslySetInnerHTML={{ __html: cat.icon }} />
                      <span>{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Dropdown title="Universities" icon={<GraduationCap className="w-4 h-4" />}>
              <div className="p-2">
                <Link
                  href="/universities"
                  className="block px-4 py-2 hover:bg-muted rounded-md transition-colors font-semibold text-foreground"
                >
                  <div className="flex items-center justify-between">
                    <span>All Universities A-Z</span>
                    <span className="text-xs text-muted-foreground ml-2">(140+)</span>
                  </div>
                </Link>
                <div className="my-2 border-t" />
                <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Rankings</div>
                <Link href="/rankings/academic" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Top Academic</span>
                  </div>
                </Link>
                <Link href="/rankings/sports" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span>Top Sports</span>
                  </div>
                </Link>
                <Link href="/rankings/satisfaction" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Student Satisfaction</span>
                  </div>
                </Link>
                <div className="my-2 border-t" />
                <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Regions</div>
                {[
                  { name: "London", slug: "london" },
                  { name: "Scotland", slug: "scotland" },
                  { name: "Wales", slug: "wales" },
                  { name: "North England", slug: "north-england" },
                  { name: "Midlands", slug: "midlands" },
                ].map((region) => (
                  <Link key={region.slug} href={`/regions/${region.slug}`} className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{region.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Link href="/crypto" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Bitcoin className="w-4 h-4 text-yellow-500" />
              Crypto
            </Link>

            <Link href="/#about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <a
              href="/#search"
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              What&apos;s Trending?
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t py-2 flex gap-2 overflow-x-auto scrollbar-hide text-xs">
          <Link
            href="/#trending"
            className="whitespace-nowrap px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
          >
            <Flame className="w-3.5 h-3.5" />
            Trending
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
            >
              <span className="text-sm" dangerouslySetInnerHTML={{ __html: cat.icon }} />
              {cat.name}
            </Link>
          ))}
          <Link
            href="/crypto"
            className="whitespace-nowrap px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors flex items-center gap-1 font-medium"
          >
            <Bitcoin className="w-3.5 h-3.5" />
            Crypto
          </Link>
          <Link
            href="/universities"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Universities
          </Link>
        </div>
      </div>
    </nav>
  );
}
