"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { name: "Trending", href: "/" },
  { name: "Sport", href: "/sport" },
  { name: "Tech", href: "/tech" },
  { name: "Entertainment", href: "/entertainment" },
  { name: "Business", href: "/business" },
  { name: "Crypto", href: "/crypto" },
  { name: "Universities", href: "/universities" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MainNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
            {NAV_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "tracking-editorial uppercase text-[11px] font-semibold hover:text-foreground transition-colors",
                  isActive(pathname, section.href) && "text-foreground"
                )}
              >
                {section.name}
              </Link>
            ))}
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
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {NAV_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2.5 text-sm font-semibold border-b border-border",
                  isActive(pathname, section.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {section.name}
              </Link>
            ))}
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
