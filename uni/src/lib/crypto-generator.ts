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

  const systemPrompt = `You are a sharp crypto market analyst writing for uni-uk.ai/crypto — a fast-paced crypto intelligence platform.

VOICE:
- Confident, data-driven, engaging
- Explain crypto in a way that's accessible to newcomers but respected by experienced traders
- British English
- No financial advice disclaimers in the content (we add those separately)

WRITE:
- ${isCoinSpecific ? '400-600' : '500-800'} words — concise, punchy
- Clear H2 (##) and H3 (###) headings
- Include specific price data and percentage changes
${isCoinSpecific ? `- Focus on THIS SPECIFIC COIN — why it's moving, what's driving it, key levels
- Use QUESTION-BASED headings for SEO: "Why Is [Coin] ${specificAngle.type === 'mover' ? 'Moving' : 'Trending'}?", "What Does This Mean?"
- Title MUST be a long-tail question format` : `- "What's Moving" section with specific coins
- "Why It Matters" section explaining market dynamics
- "What to Watch" section with upcoming catalysts`}

LINK REQUIREMENTS:
1. Link to our crypto dashboard: [View live prices](/crypto)
2. Link to our AI chat: [Ask our crypto AI](/crypto#chat)
3. 1-2 external links to authoritative crypto sources (CoinDesk, CoinTelegraph, etc.)

OUTPUT FORMAT (JSON only, no markdown blocks):
{
  "title": "${isCoinSpecific ? 'Long-tail question title about this specific coin (50-80 chars)' : 'Engaging crypto headline (50-70 chars)'}",
  "excerpt": "Compelling summary starting with the key fact (120-160 chars)",
  "content": "Full markdown content",
  "coins": ["BTC", "ETH", ...mentioned coins],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const angleInstruction = specificAngle
    ? `\nSPECIFIC ANGLE: ${specificAngle.angle}\nFocus on this specific topic. Make the title a question about this coin/topic.`
    : '\nFocus on the most interesting angle — what\'s the story the market is telling right now?';

  const userPrompt = `Write a crypto ${isCoinSpecific ? 'analysis' : 'market overview'} based on current data:

MARKET OVERVIEW (top coins by market cap):
${marketContext}

TRENDING RIGHT NOW:
${trendingContext}

MARKET DIRECTION: ${marketTrend > 1 ? 'Bullish' : marketTrend < -1 ? 'Bearish' : 'Sideways'} (avg top 5: ${marketTrend > 0 ? '+' : ''}${marketTrend.toFixed(2)}%)
BIG MOVERS (>5% change): ${bigMovers.map(c => `${c.symbol.toUpperCase()} ${c.price_change_percentage_24h > 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(1)}%`).join(', ') || 'None today'}
${angleInstruction}
Output ONLY the JSON object.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
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
