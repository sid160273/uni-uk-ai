"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const REGIONS = [
  { name: "London", slug: "london", count: 27 },
  { name: "Scotland", slug: "scotland", count: 16 },
  { name: "North England", slug: "north-england", count: 20 },
  { name: "Midlands", slug: "midlands", count: 13 },
  { name: "South West England", slug: "south-west-england", count: 12 },
  { name: "South East England", slug: "south-east-england", count: 9 },
  { name: "East England", slug: "east-england", count: 9 },
  { name: "Wales", slug: "wales", count: 7 },
  { name: "Northern Ireland", slug: "northern-ireland", count: 2 },
] as const;

const RANKINGS = [
  {
    name: "Top academic",
    href: "/rankings/academic",
    detail: "Highest Guardian rankings",
  },
  {
    name: "Student satisfaction",
    href: "/rankings/satisfaction",
    detail: "Highest NSS scores",
  },
  {
    name: "Top for sport",
    href: "/rankings/sports",
    detail: "Best facilities and teams",
  },
] as const;

const CLEARING_LINKS = [
  { name: "Clearing hub", href: "/clearing", detail: "Where to start" },
  {
    name: "How Clearing works",
    href: "/clearing/how-it-works",
    detail: "Step by step",
  },
  {
    name: "If you missed your grades",
    href: "/clearing/missed-grades",
    detail: "What to do first",
  },
  {
    name: "If you did better than expected",
    href: "/clearing/better-than-expected",
    detail: "Trading up",
  },
  {
    name: "Key dates",
    href: "/clearing/key-dates",
    detail: "The 2026 calendar",
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

interface DropdownProps {
  title: string;
  active: boolean;
  children: React.ReactNode;
}

function Dropdown({ title, active, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 tracking-editorial uppercase text-[11px] font-semibold py-2 hover:text-foreground transition-colors",
          active && "text-foreground"
        )}
      >
        {title}
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-background border border-border shadow-xl z-50 min-w-[260px] max-h-[70vh] overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MainNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <span className="font-display text-2xl md:text-3xl font-black tracking-tight">
              uni-uk<span className="text-destructive">.ai</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-6 text-muted-foreground">
            <Dropdown title="Clearing" active={isActive(pathname, "/clearing")}>
              <div className="py-2">
                {CLEARING_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2.5 hover:bg-muted transition-colors"
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {link.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {link.detail}
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Dropdown
              title="Universities"
              active={
                isActive(pathname, "/universities") ||
                isActive(pathname, "/regions")
              }
            >
              <div className="py-2">
                <Link
                  href="/universities"
                  className="block px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>All universities A–Z</span>
                    <span className="text-xs text-muted-foreground">140</span>
                  </div>
                </Link>
                <div className="my-2 border-t border-border" />
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
                  By region
                </div>
                {REGIONS.map((region) => (
                  <Link
                    key={region.slug}
                    href={`/regions/${region.slug}`}
                    className="block px-4 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>{region.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {region.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Dropdown title="Rankings" active={isActive(pathname, "/rankings")}>
              <div className="py-2">
                {RANKINGS.map((ranking) => (
                  <Link
                    key={ranking.href}
                    href={ranking.href}
                    className="block px-4 py-2.5 hover:bg-muted transition-colors"
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {ranking.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {ranking.detail}
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <Link
              href="/about"
              className={cn(
                "tracking-editorial uppercase text-[11px] font-semibold hover:text-foreground transition-colors",
                isActive(pathname, "/about") && "text-foreground"
              )}
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/clearing"
              className="hidden sm:inline-flex bg-destructive text-destructive-foreground px-4 py-2 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
            >
              Clearing 2026
            </Link>
            <button
              className="lg:hidden p-2 hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/clearing"
              onClick={() => setMobileOpen(false)}
              className="block w-full bg-destructive text-destructive-foreground text-center py-3 text-sm font-bold uppercase tracking-editorial mb-4"
            >
              Clearing 2026
            </Link>

            <div className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground py-2 border-b border-border">
              Clearing
            </div>
            {CLEARING_LINKS.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold border-b border-border text-muted-foreground"
              >
                {link.name}
              </Link>
            ))}

            <div className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground py-2 pt-5 border-b border-border">
              Universities
            </div>
            <Link
              href="/universities"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-semibold border-b border-border text-muted-foreground"
            >
              All universities A–Z
            </Link>
            {RANKINGS.map((ranking) => (
              <Link
                key={ranking.href}
                href={ranking.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold border-b border-border text-muted-foreground"
              >
                {ranking.name}
              </Link>
            ))}

            <div className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground py-2 pt-5 border-b border-border">
              Regions
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              {REGIONS.map((region) => (
                <Link
                  key={region.slug}
                  href={`/regions/${region.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-1.5 bg-muted text-xs font-semibold"
                >
                  {region.name}
                </Link>
              ))}
            </div>

            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 mt-5 text-sm font-semibold border-t border-border text-muted-foreground"
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
