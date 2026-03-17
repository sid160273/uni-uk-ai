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
  chatSystemPrompt: string;
  quickTopics: string[];
  chatPlaceholder: string;
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
    chatSystemPrompt: 'You are the breaking news desk at uni-uk.ai. You cover everything trending across all topics — sports, politics, tech, entertainment, business, world events. Be sharp, fast, and opinionated.',
    quickTopics: ['What\'s trending?', 'Breaking news', 'Today\'s biggest story'],
    chatPlaceholder: 'Ask about anything trending...',
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
    chatSystemPrompt: 'You are the sports desk at uni-uk.ai. You live and breathe sport — football, F1, tennis, boxing, cricket, NFL, NBA, everything. You know the stats, the tactics, the drama. Talk like a knowledgeable fan, not a commentator reading a script.',
    quickTopics: ['Premier League', 'F1', 'Transfer rumours', 'Champions League'],
    chatPlaceholder: 'Ask about any sport...',
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
    chatSystemPrompt: 'You are the tech correspondent at uni-uk.ai. You cover AI, startups, Big Tech, gadgets, science breakthroughs, and the intersection of tech and society. You can explain complex topics simply but you don\'t dumb things down. You have opinions about where tech is heading.',
    quickTopics: ['AI news', 'Apple', 'Startups', 'Science breakthroughs'],
    chatPlaceholder: 'Ask about tech or science...',
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
    chatSystemPrompt: 'You are the entertainment editor at uni-uk.ai. You cover celebrities, TV, film, music, viral moments, and pop culture. You\'re plugged into what people are actually talking about. Witty, opinionated, never boring.',
    quickTopics: ['Celebrity news', 'Netflix', 'Music', 'Viral moments'],
    chatPlaceholder: 'Ask about entertainment or culture...',
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
    chatSystemPrompt: 'You are the business analyst at uni-uk.ai. You cover markets, the economy, corporate news, and political decisions that affect money. You make finance accessible without being patronising. You have strong takes on market moves.',
    quickTopics: ['Stock market', 'Economy', 'Interest rates', 'Big deals'],
    chatPlaceholder: 'Ask about business or markets...',
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
    chatSystemPrompt: '', // uses existing /api/crypto/chat
    quickTopics: ['Bitcoin price', 'Ethereum', 'Trending coins', 'Market analysis'],
    chatPlaceholder: 'Ask about any coin or the market...',
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
    chatSystemPrompt: '', // uses existing general chat
    quickTopics: ['Best universities', 'Rankings', 'Student life', 'Applications'],
    chatPlaceholder: 'Ask about universities...',
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
