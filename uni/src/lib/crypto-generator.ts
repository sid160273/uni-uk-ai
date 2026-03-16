/**
 * Crypto Story Generator
 * Uses OpenAI to generate crypto market analysis articles
 */

import OpenAI from 'openai';
import { CoinData, TrendingCoin, formatPrice } from './crypto-sources';
import { CryptoPost } from './crypto-data';

const CRYPTO_IMAGES: Record<string, string> = {
  bitcoin: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=630&fit=crop',
  ethereum: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=1200&h=630&fit=crop',
  default: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
  market: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop',
  defi: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=630&fit=crop',
  nft: 'https://images.unsplash.com/photo-1646463910915-dddbc72b3e87?w=1200&h=630&fit=crop',
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

function calculateReadingTime(content: string): number {
  return Math.ceil(content.split(/\s+/).length / 200);
}

/**
 * Detects the hottest crypto topics right now.
 * Returns a list of specific story angles, prioritising big movers and trending coins.
 */
export function detectHotCryptoTopics(
  topCoins: CoinData[],
  trendingCoins: TrendingCoin[]
): { angle: string; coins: string[]; type: 'mover' | 'trending' | 'market' }[] {
  const topics: { angle: string; coins: string[]; type: 'mover' | 'trending' | 'market' }[] = [];

  // Big movers (>8% change in 24h) — individual coin stories
  const bigMovers = topCoins.filter(c => Math.abs(c.price_change_percentage_24h) > 8);
  for (const coin of bigMovers.slice(0, 3)) {
    const dir = coin.price_change_percentage_24h > 0 ? 'Up' : 'Down';
    topics.push({
      angle: `${coin.name} (${coin.symbol.toUpperCase()}) is ${dir} ${Math.abs(coin.price_change_percentage_24h).toFixed(1)}% — why?`,
      coins: [coin.symbol.toUpperCase()],
      type: 'mover',
    });
  }

  // Trending coins on CoinGecko that aren't in the top 20 — discovery stories
  const topIds = new Set(topCoins.map(c => c.id));
  const trendingNew = trendingCoins.filter(c => !topIds.has(c.id)).slice(0, 2);
  for (const coin of trendingNew) {
    topics.push({
      angle: `${coin.name} (${coin.symbol.toUpperCase()}) is trending on CoinGecko — what is it and why?`,
      coins: [coin.symbol.toUpperCase()],
      type: 'trending',
    });
  }

  // General market story (always generate one)
  const marketTrend = topCoins.slice(0, 5).reduce((sum, c) => sum + c.price_change_percentage_24h, 0) / 5;
  topics.push({
    angle: `Overall market ${marketTrend > 1 ? 'rallying' : marketTrend < -1 ? 'dipping' : 'steady'} — top coins and what to watch`,
    coins: topCoins.slice(0, 5).map(c => c.symbol.toUpperCase()),
    type: 'market',
  });

  return topics;
}

/**
 * Generates a crypto story about a specific angle/topic.
 */
export async function generateCryptoStory(
  topCoins: CoinData[],
  trendingCoins: TrendingCoin[],
  openaiClient: OpenAI,
  specificAngle?: { angle: string; coins: string[]; type: string }
): Promise<CryptoPost | null> {
  const marketContext = topCoins.slice(0, 10).map((coin, i) =>
    `${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): ${formatPrice(coin.current_price)} — ${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}% (24h), 7d: ${coin.price_change_percentage_7d_in_currency ? (coin.price_change_percentage_7d_in_currency > 0 ? '+' : '') + coin.price_change_percentage_7d_in_currency.toFixed(2) + '%' : 'N/A'}`
  ).join('\n');

  const trendingContext = trendingCoins.slice(0, 5).map((coin, i) =>
    `${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) — Rank #${coin.market_cap_rank || '?'}`
  ).join('\n');

  // Determine the story angle
  const bigMovers = topCoins.filter(c => Math.abs(c.price_change_percentage_24h) > 5);
  const marketTrend = topCoins.slice(0, 5).reduce((sum, c) => sum + c.price_change_percentage_24h, 0) / 5;

  const isCoinSpecific = specificAngle && (specificAngle.type === 'mover' || specificAngle.type === 'trending');

  const systemPrompt = `You are the crypto voice of uni-uk.ai — part trader, part storyteller, part that friend who got into Bitcoin in 2015 and won't shut up about it (but in a good way). You live and breathe this market.

YOUR CHARACTER:
- You talk like Crypto Twitter but write like the Financial Times. Sharp, data-heavy, but with personality
- You have OPINIONS. "This looks bullish" is boring. "This is the most interesting setup since the 2024 halving" is better
- Use trader slang naturally — "nuke", "pump", "rug", "send it", "ngmi" — but not so much it alienates newcomers
- You get genuinely excited about big moves. A 15% candle deserves energy in the writing
- Dry humour, occasional sarcasm. "Another day, another memecoin making millionaires while your index fund returns 4%"
- British English

WHAT YOU NEVER DO:
- NEVER use "Here's what you need to know", "Let's dive in", "In this article"
- NEVER use bland headings like "Why Does This Matter?" — make them SPECIFIC: "## Why Whales Are Loading Up Below £80K", "## The On-Chain Data Tells a Different Story"
- NEVER write like a press release or corporate blog
- NEVER use "landscape", "paradigm", "navigate", "unpack"
- No financial advice disclaimers in content (we add those separately)

WRITING STYLE:
- ${isCoinSpecific ? '400-600' : '500-800'} words — tight, punchy, every sentence earns its place
- Open with something that makes a trader stop scrolling — the headline number, a bold call, a dramatic comparison
- Include specific prices, percentages, and levels. Traders want data, not vibes
- H2 headings must be SPECIFIC and INTRIGUING:
  Good: "## The £2,400 Level That's Making or Breaking ETH", "## Three Signals the Smart Money Is Watching"
  Bad: "## What's Moving", "## Why It Matters"
${isCoinSpecific ? `- Focus ENTIRELY on this specific coin — what's driving the move, key support/resistance, what traders should watch
- Title must be specific and magnetic, not a generic question` : `- Cover the market story — what's moving, why, and what's next
- Build a narrative: connect the dots between different coins and trends`}

LINKS:
1. [Track live prices](/crypto)
2. [Ask our crypto AI](/crypto#chat)
3. 1-2 external links to CoinDesk, CoinTelegraph, The Block, etc.

OUTPUT FORMAT (JSON only, no markdown blocks):
{
  "title": "Magnetic headline — specific, data-driven, makes you want to click (50-80 chars)",
  "excerpt": "Lead with the key number or fact (120-160 chars)",
  "content": "Full markdown content",
  "coins": ["BTC", "ETH", ...mentioned coins],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const angleInstruction = specificAngle
    ? `\nYOUR ANGLE: ${specificAngle.angle}\nThis is your story — own it. Give your take on what's happening and why. Make the title specific and magnetic, not a generic question.`
    : '\nFind the most INTERESTING angle — what story is the market telling right now? What would make a trader sit up and pay attention?';

  const userPrompt = `Here's what the market looks like right now. Find the story in the data:

TOP COINS:
${marketContext}

TRENDING ON COINGECKO:
${trendingContext}

MARKET VIBE: ${marketTrend > 1 ? 'Bullish' : marketTrend < -1 ? 'Bearish' : 'Sideways'} (avg top 5: ${marketTrend > 0 ? '+' : ''}${marketTrend.toFixed(2)}%)
BIG MOVERS: ${bigMovers.map(c => `${c.symbol.toUpperCase()} ${c.price_change_percentage_24h > 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(1)}%`).join(', ') || 'Nothing dramatic today'}
${angleInstruction}

Remember:
- Title must be SPECIFIC and MAGNETIC — not "Crypto Market Update" or "What You Need to Know"
- Open with the most striking data point or observation
- Have a genuine take — bullish, bearish, or "this is weird and here's why"
- Excerpt = factual lead for Google snippets

Output ONLY the JSON object.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) return null;

    let jsonText = responseText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);
    const now = new Date().toISOString().split('T')[0];

    // Pick image based on mentioned coins
    const mentionedCoins = (parsed.coins || []).map((c: string) => c.toLowerCase());
    let imageUrl = CRYPTO_IMAGES.market;
    if (mentionedCoins.includes('btc') || mentionedCoins.includes('bitcoin')) {
      imageUrl = CRYPTO_IMAGES.bitcoin;
    } else if (mentionedCoins.includes('eth') || mentionedCoins.includes('ethereum')) {
      imageUrl = CRYPTO_IMAGES.ethereum;
    }

    const post: CryptoPost = {
      slug: `crypto-${generateSlug(parsed.title)}`,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      author: 'uni-uk.ai Crypto Desk',
      publishedAt: now,
      updatedAt: now,
      imageUrl,
      coins: parsed.coins || [],
      tags: parsed.tags || [],
      readingTime: calculateReadingTime(parsed.content),
      status: 'published',
    };

    return post;
  } catch (error) {
    console.error('Error generating crypto story:', error);
    return null;
  }
}

/**
 * Validates a crypto post
 */
export function validateCryptoPost(post: CryptoPost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (post.title.length < 15) errors.push('Title too short');
  if (post.title.length > 120) errors.push('Title too long');
  if (post.excerpt.length < 40) errors.push('Excerpt too short');
  if (post.content.length < 300) errors.push('Content too short');
  if (post.coins.length === 0) errors.push('No coins tagged');
  return { valid: errors.length === 0, errors };
}
