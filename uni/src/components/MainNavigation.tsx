"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

function NavDropdown({ title, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:text-foreground transition-colors tracking-editorial uppercase text-[11px] font-semibold"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-background border border-border shadow-lg z-50 min-w-[240px]">
          {children}
        </div>
      )}
    </div>
  );
}

const categories = [
  "Sports", "Politics", "Entertainment", "Technology",
  "Business", "Science", "Health", "World", "Culture", "Breaking",
];

export function MainNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-display text-2xl md:text-3xl font-black tracking-tight">
              uni-uk<span className="text-destructive">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 text-muted-foreground">
            <Link href="/" className="tracking-editorial uppercase text-[11px] font-semibold hover:text-foreground transition-colors">
              Trending
            </Link>

            <NavDropdown title="Categories">
              <div className="py-1">
                <Link
                  href="/blog"
                  className="block px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  All Stories
                </Link>
                <div className="border-t border-border" />
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog/category/${cat.toLowerCase()}`}
                    className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <NavDropdown title="Universities">
              <div className="py-1">
                <Link href="/universities" className="block px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors">
                  All Universities A-Z
                </Link>
                <div className="border-t border-border" />
                <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-editorial">
                  Rankings
                </div>
                <Link href="/rankings/academic" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Top Academic
                </Link>
                <Link href="/rankings/sports" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Top Sports
                </Link>
                <Link href="/rankings/satisfaction" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Student Satisfaction
                </Link>
                <div className="border-t border-border" />
                <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-editorial">
                  Regions
                </div>
                {[
                  { name: "London", slug: "london" },
                  { name: "Scotland", slug: "scotland" },
                  { name: "Wales", slug: "wales" },
                  { name: "North England", slug: "north-england" },
                  { name: "Midlands", slug: "midlands" },
                ].map((region) => (
                  <Link key={region.slug} href={`/regions/${region.slug}`} className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                    {region.name}
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <Link href="/crypto" className="tracking-editorial uppercase text-[11px] font-semibold hover:text-foreground transition-colors">
              Crypto
            </Link>

            <Link href="/#about" className="tracking-editorial uppercase text-[11px] font-semibold hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="/#search"
              className="hidden sm:inline-flex bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-editorial hover:opacity-80 transition-opacity"
            >
              Ask AI
            </a>
            <button
              className="lg:hidden p-2 hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category bar - desktop */}
        <div className="hidden lg:flex items-center gap-6 border-t border-border py-2 overflow-x-auto scrollbar-hide">
          <span className="text-destructive text-[11px] font-bold uppercase tracking-editorial shrink-0">
            Featured
          </span>
          {["Sports", "Politics", "Business", "Technology", "Science", "Culture"].map((cat) => (
            <Link
              key={cat}
              href={`/blog/category/${cat.toLowerCase()}`}
              className="text-[11px] font-medium uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {cat}
            </Link>
          ))}
          <Link
            href="/crypto"
            className="text-[11px] font-medium uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Crypto
          </Link>
          <Link
            href="/universities"
            className="text-[11px] font-medium uppercase tracking-editorial text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Universities
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold border-b border-border">
              Trending Now
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold border-b border-border">
              All Stories
            </Link>
            <Link href="/crypto" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold border-b border-border">
              Crypto
            </Link>
            <Link href="/universities" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold border-b border-border">
              Universities
            </Link>
            <div className="pt-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-editorial mb-2">
                Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog/category/${cat.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-1.5 border border-border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-3">
              <a
                href="/#search"
                onClick={() => setMobileOpen(false)}
                className="block w-full bg-foreground text-background text-center py-2.5 text-sm font-semibold uppercase tracking-editorial"
              >
                Ask AI
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
