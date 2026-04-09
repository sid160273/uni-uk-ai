/**
 * Section Configuration
 * Single source of truth for all section hubs on uni-uk.ai
 */

export interface SectionConfig {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  categories: string[]; // blog post categories that map to this section
  accentColor: string;  // tailwind color class
  accentHex: string;    // hex for inline styles
  icon: string;         // emoji for quick display
  newsletterTitle: string;
  newsletterDescription: string;
  hasDedicatedDataSource?: boolean; // true for crypto (uses crypto-data.ts)
}

export const SECTIONS: SectionConfig[] = [
  {
    slug: 'trending',
    name: 'Trending Now',
    shortName: 'Trending',
    tagline: 'Every story everyone is searching for — right now',
    categories: [], // empty = all categories
    accentColor: 'text-red-600',
    accentHex: '#dc2626',
    icon: '🔥',
    newsletterTitle: 'The Daily Brief',
    newsletterDescription: 'Every trending story, every morning. The only newsletter that covers everything.',
  },
  {
    slug: 'sport',
    name: 'Sport',
    shortName: 'Sport',
    tagline: 'Scores, drama, and the stories behind the headlines',
    categories: ['Sports'],
    accentColor: 'text-blue-600',
    accentHex: '#2563eb',
    icon: '⚽',
    newsletterTitle: 'Sport Daily',
    newsletterDescription: 'The matches, the drama, the transfers. Every morning before kickoff.',
  },
  {
    slug: 'tech',
    name: 'Tech & AI',
    shortName: 'Tech',
    tagline: 'The future is happening faster than you think',
    categories: ['Technology', 'Science'],
    accentColor: 'text-cyan-600',
    accentHex: '#0891b2',
    icon: '💻',
    newsletterTitle: 'Tech Briefing',
    newsletterDescription: 'AI, startups, Big Tech, and science — the stories shaping tomorrow.',
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    shortName: 'Entertainment',
    tagline: 'Celebrity, culture, and everything people can\'t stop talking about',
    categories: ['Entertainment', 'Culture'],
    accentColor: 'text-pink-600',
    accentHex: '#db2777',
    icon: '🎬',
    newsletterTitle: 'Culture Fix',
    newsletterDescription: 'Celebrity, TV, music, and the viral moments everyone is talking about.',
  },
  {
    slug: 'business',
    name: 'Business & Markets',
    shortName: 'Business',
    tagline: 'Money moves, market shifts, and the economy explained',
    categories: ['Business', 'Politics'],
    accentColor: 'text-emerald-600',
    accentHex: '#059669',
    icon: '📈',
    newsletterTitle: 'Market Morning',
    newsletterDescription: 'Markets, deals, and economic shifts — the money stories that matter.',
  },
  {
    slug: 'crypto',
    name: 'Crypto',
    shortName: 'Crypto',
    tagline: 'Prices, trends, and alpha — updated every hour',
    categories: [],
    accentColor: 'text-orange-500',
    accentHex: '#f97316',
    icon: '₿',
    hasDedicatedDataSource: true,
    newsletterTitle: 'Crypto Morning Brief',
    newsletterDescription: 'Prices, movers, and alpha — before the US market opens.',
  },
  {
    slug: 'universities',
    name: 'Universities',
    shortName: 'Unis',
    tagline: 'Rankings, guides, and everything you need for uni life',
    categories: [],
    accentColor: 'text-violet-600',
    accentHex: '#7c3aed',
    icon: '🎓',
    hasDedicatedDataSource: true,
    newsletterTitle: 'Uni Insider',
    newsletterDescription: 'Rankings, deadlines, and the insider tips for university life.',
  },
];

/** Get a section config by slug */
export function getSection(slug: string): SectionConfig | undefined {
  return SECTIONS.find(s => s.slug === slug);
}

/** Get all section configs for navigation (excludes universities as it has its own nav) */
export function getNavSections(): SectionConfig[] {
  return SECTIONS.filter(s => s.slug !== 'universities');
}

/** Get the main hub sections (the ones that show on homepage) */
export function getHubSections(): SectionConfig[] {
  return SECTIONS.filter(s => !s.hasDedicatedDataSource || s.slug === 'crypto');
}
