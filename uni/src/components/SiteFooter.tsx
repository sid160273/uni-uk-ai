import Link from "next/link";
import { CLEARING_CYCLE } from "@/lib/clearing";

const COLUMNS: Array<{ heading: string; links: Array<{ name: string; href: string }> }> = [
  {
    heading: `Clearing ${CLEARING_CYCLE.year}`,
    links: [
      { name: "Clearing hub", href: "/clearing" },
      { name: "How Clearing works", href: "/clearing/how-it-works" },
      { name: "If you missed your grades", href: "/clearing/missed-grades" },
      { name: "If you did better than expected", href: "/clearing/better-than-expected" },
      { name: "Key dates", href: "/clearing/key-dates" },
    ],
  },
  {
    heading: "Universities",
    links: [
      { name: "All universities A–Z", href: "/universities" },
      { name: "Top academic", href: "/rankings/academic" },
      { name: "Student satisfaction", href: "/rankings/satisfaction" },
      { name: "Top for sport", href: "/rankings/sports" },
    ],
  },
  {
    heading: "Regions",
    links: [
      { name: "London", href: "/regions/london" },
      { name: "Scotland", href: "/regions/scotland" },
      { name: "North England", href: "/regions/north-england" },
      { name: "Midlands", href: "/regions/midlands" },
      { name: "Wales", href: "/regions/wales" },
    ],
  },
  {
    heading: "About",
    links: [
      { name: "About us", href: "/about" },
      { name: "Editorial policy", href: "/editorial-policy" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-3">
                {column.heading}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-display text-xl font-bold">
              uni-uk<span className="text-destructive">.ai</span>
            </div>
            <p className="text-[10px] uppercase tracking-editorial text-muted-foreground mt-1">
              UK university and Clearing guidance
            </p>
          </div>
          <p className="text-xs text-muted-foreground max-w-md md:text-right">
            &copy; {new Date().getFullYear()} uni-uk.ai. We are an independent
            guide, not affiliated with UCAS. Always confirm course details and
            offers directly with the university.
          </p>
        </div>
      </div>
    </footer>
  );
}
