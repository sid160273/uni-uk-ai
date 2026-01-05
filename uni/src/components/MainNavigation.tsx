"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, GraduationCap, MapPin, Trophy, Star } from "lucide-react";
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

export function MainNavigation() {
  const regions = [
    { name: "Scotland", slug: "scotland", count: 16 },
    { name: "Wales", slug: "wales", count: 7 },
    { name: "Northern Ireland", slug: "northern-ireland", count: 2 },
    { name: "London", slug: "london", count: 27 },
    { name: "North England", slug: "north-england", count: 20 },
    { name: "Midlands", slug: "midlands", count: 13 },
    { name: "South West England", slug: "south-west-england", count: 12 },
    { name: "South East England", slug: "south-east-england", count: 9 },
    { name: "East England", slug: "east-england", count: 9 },
  ];

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
            <Dropdown title="Browse Universities" icon={<GraduationCap className="w-4 h-4" />}>
              <div className="p-2">
                <Link
                  href="/universities"
                  className="block px-4 py-2 hover:bg-muted rounded-md transition-colors font-semibold text-foreground"
                >
                  <div className="flex items-center justify-between">
                    <span>All Universities A-Z</span>
                    <span className="text-xs text-muted-foreground ml-2">(140)</span>
                  </div>
                </Link>
                <div className="my-2 border-t" />
                <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  By Region
                </div>
                {regions.map((region) => (
                  <Link
                    key={region.slug}
                    href={`/regions/${region.slug}`}
                    className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>{region.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({region.count})</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Dropdown title="Top Ranked" icon={<Trophy className="w-4 h-4" />}>
              <div className="p-2">
                <Link
                  href="/rankings/academic"
                  className="block px-4 py-3 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Top Academic
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Highest Guardian rankings
                  </div>
                </Link>
                <Link
                  href="/rankings/sports"
                  className="block px-4 py-3 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    Top for Sports
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Best sports facilities & teams
                  </div>
                </Link>
                <Link
                  href="/rankings/satisfaction"
                  className="block px-4 py-3 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Top Student Satisfaction
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Highest NSS scores
                  </div>
                </Link>
              </div>
            </Dropdown>

            <Link href="/#about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* Mobile Menu Button & CTA */}
          <div className="flex items-center gap-2">
            <a
              href="/#search"
              className="bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Find a Uni
            </a>
          </div>
        </div>

        {/* Mobile Navigation - Below */}
        <div className="lg:hidden border-t py-2 flex gap-2 overflow-x-auto scrollbar-hide text-xs">
          <Link
            href="/universities"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            All Unis
          </Link>
          <Link
            href="/rankings/academic"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <Star className="w-3.5 h-3.5" />
            Top Academic
          </Link>
          <Link
            href="/rankings/sports"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5" />
            Top Sports
          </Link>
          <Link
            href="/regions/scotland"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            Scotland
          </Link>
          <Link
            href="/regions/london"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            London
          </Link>
          <Link
            href="/regions/wales"
            className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            Wales
          </Link>
        </div>
      </div>
    </nav>
  );
}
