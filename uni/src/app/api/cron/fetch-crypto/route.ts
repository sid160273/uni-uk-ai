import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchTopCoins, fetchTrendingCoins, formatPrice } from '@/lib/crypto-sources';
import { saveCoinSnapshot, saveCryptoPost, getCryptoPosts, cryptoSlugExists, StoredCoinData } from '@/lib/crypto-data';
import { generateCryptoStory, detectHotCryptoTopics, validateCryptoPost } from '@/lib/crypto-generator';
import { postTweet } from '@/lib/twitter';
import { postToBluesky } from '@/lib/bluesky';
import { postToThreads } from '@/lib/threads';
import { formatCryptoTweet, formatBlueskyPostCrypto, formatThreadsPostCrypto } from '@/lib/tweet-formatter';

const MAX_STORIES_PER_DAY = 10;
const MAX_STORIES_PER_CYCLE = 3;

/**
 * Crypto Cron Endpoint
 * Runs every hour to fetch prices, detect hot topics, generate targeted stories, and tweet them.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Fetch current market data
    console.log('[Crypto] Fetching market data...');
    const [topCoins, trendingCoins] = await Promise.all([
      fetchTopCoins(20),
      fetchTrendingCoins(),
    ]);

    if (topCoins.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Could not fetch market data from CoinGecko',
        duration: Date.now() - startTime,
      });
    }

    console.log(`[Crypto] ${topCoins.length} coins, ${trendingCoins.length} trending`);

    // Step 2: Save market data snapshot
    const coinSnapshots: StoredCoinData[] = topCoins.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      price_gbp: coin.current_price,
      price_change_24h: coin.price_change_percentage_24h || 0,
      price_change_7d: coin.price_change_percentage_7d_in_currency || 0,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume,
      sparkline: coin.sparkline_in_7d?.price || [],
      last_updated: coin.last_updated || new Date().toISOString(),
    }));

    const snapshotSaved = await saveCoinSnapshot(coinSnapshots);
    console.log(`[Crypto] Snapshot saved: ${snapshotSaved}`);

    // Step 3: Detect hot topics and generate targeted stories
    const savedStories: { title: string; slug: string; tweeted: boolean; tweetId?: string }[] = [];

    if (process.env.OPENAI_API_KEY) {
      const existingPosts = await getCryptoPosts();
      const today = new Date().toISOString().split('T')[0];
      const todayPosts = existingPosts.filter(p => p.publishedAt === today);
      const remaining = MAX_STORIES_PER_DAY - todayPosts.length;

      if (remaining > 0) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Detect what's hot right now
        const hotTopics = detectHotCryptoTopics(topCoins, trendingCoins);
        console.log(`[Crypto] Detected ${hotTopics.length} hot topics: ${hotTopics.map(t => t.type).join(', ')}`);

        // Generate stories for each hot topic (up to cycle + daily limits)
        const toGenerate = hotTopics.slice(0, Math.min(MAX_STORIES_PER_CYCLE, remaining));

        for (const topic of toGenerate) {
          try {
            const story = await generateCryptoStory(topCoins, trendingCoins, openai, topic);
            if (!story) continue;

            const validation = validateCryptoPost(story);
            if (!validation.valid) {
              console.warn(`[Crypto] Validation warnings for "${story.title}":`, validation.errors);
            }

            // Ensure unique slug
            if (await cryptoSlugExists(story.slug)) {
              story.slug = `${story.slug}-${Date.now()}`;
            }

            const saved = await saveCryptoPost(story);
            if (!saved) continue;

            console.log(`[Crypto] Saved: "${story.title}" (${topic.type})`);

            // Tweet it with price data for engagement
            let tweeted = false;
            let tweetId: string | undefined;

            const priceData = topic.coins
              .map(sym => {
                const coin = topCoins.find(c => c.symbol.toUpperCase() === sym);
                if (!coin) return null;
                return {
                  symbol: coin.symbol.toUpperCase(),
                  price: formatPrice(coin.current_price),
                  change24h: coin.price_change_percentage_24h,
                };
              })
              .filter((d): d is { symbol: string; price: string; change24h: number } => d !== null);

            const tweetText = formatCryptoTweet({
              title: story.title,
              slug: story.slug,
              coins: story.coins,
              tags: story.tags,
              priceData,
            });

            const tweetResult = await postTweet(tweetText);
            if (tweetResult.success) {
              tweeted = true;
              tweetId = tweetResult.tweetId;
              console.log(`[Twitter] Crypto tweet sent — ID: ${tweetResult.tweetId}`);
            } else {
              console.warn(`[Twitter] Failed for "${story.slug}": ${tweetResult.error}`);
            }

            // Post to Bluesky with link card
            try {
              const cryptoInput = { title: story.title, slug: story.slug, coins: story.coins, tags: story.tags, priceData };
              const bskyData = formatBlueskyPostCrypto(cryptoInput);
              const bskyResult = await postToBluesky(bskyData.text, bskyData.linkUrl);
              if (bskyResult.success) {
                console.log(`[Bluesky] Crypto post — ${bskyResult.uri}`);
              } else {
                console.warn(`[Bluesky] Failed: ${bskyResult.error}`);
              }
            } catch (bskyErr: any) {
              console.error(`[Bluesky] Error:`, bskyErr.message);
            }

            // Post to Threads
            try {
              const cryptoInput = { title: story.title, slug: story.slug, coins: story.coins, tags: story.tags, priceData };
              const threadsText = formatThreadsPostCrypto(cryptoInput);
              const threadsResult = await postToThreads(threadsText);
              if (threadsResult.success) {
                console.log(`[Threads] Crypto post — ${threadsResult.postId}`);
              } else {
                console.warn(`[Threads] Failed: ${threadsResult.error}`);
              }
            } catch (threadsErr: any) {
              console.error(`[Threads] Error:`, threadsErr.message);
            }

            savedStories.push({ title: story.title, slug: story.slug, tweeted, tweetId });
          } catch (err: any) {
            console.error(`[Crypto] Error generating story for topic "${topic.angle}":`, err.message);
          }
        }
      } else {
        console.log(`[Crypto] Already generated ${todayPosts.length} stories today, skipping`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto data updated',
      coinsTracked: coinSnapshots.length,
      trendingCoins: trendingCoins.length,
      snapshotSaved,
      storiesGenerated: savedStories.length,
      stories: savedStories,
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Crypto cron error:', error);
    return NextResponse.json(
      { error: 'Crypto cron failed', details: error.message, duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}
