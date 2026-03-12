import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchTopCoins, fetchTrendingCoins } from '@/lib/crypto-sources';
import { saveCoinSnapshot, saveCryptoPost, getCryptoPosts, cryptoSlugExists, StoredCoinData } from '@/lib/crypto-data';
import { generateCryptoStory, validateCryptoPost } from '@/lib/crypto-generator';

/**
 * Crypto Cron Endpoint
 * Runs every hour to fetch prices and generate crypto stories
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Fetch current market data
    console.log('Fetching crypto market data...');
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

    console.log(`Fetched ${topCoins.length} coins, ${trendingCoins.length} trending`);

    // Step 2: Save market data snapshot to Google Sheets
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
    console.log(`Market snapshot saved: ${snapshotSaved}`);

    // Step 3: Generate a crypto story (max 1 per hour)
    let storySaved = false;
    let storyTitle = '';

    // Only generate if we have an OpenAI key
    if (process.env.OPENAI_API_KEY) {
      // Check how many stories we've generated today
      const existingPosts = await getCryptoPosts();
      const today = new Date().toISOString().split('T')[0];
      const todayPosts = existingPosts.filter(p => p.publishedAt === today);

      // Max 6 stories per day
      if (todayPosts.length < 6) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const story = await generateCryptoStory(topCoins, trendingCoins, openai);

        if (story) {
          const validation = validateCryptoPost(story);
          if (!validation.valid) {
            console.warn('Crypto story validation warnings:', validation.errors);
          }

          // Ensure unique slug
          if (await cryptoSlugExists(story.slug)) {
            story.slug = `${story.slug}-${Date.now()}`;
          }

          storySaved = await saveCryptoPost(story);
          storyTitle = story.title;
          if (storySaved) {
            console.log(`Crypto story saved: "${story.title}"`);
          }
        }
      } else {
        console.log(`Already generated ${todayPosts.length} stories today, skipping`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto data updated',
      coinsTracked: coinSnapshots.length,
      trendingCoins: trendingCoins.length,
      snapshotSaved,
      storySaved,
      storyTitle: storyTitle || undefined,
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
