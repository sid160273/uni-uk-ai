import { NextRequest, NextResponse } from 'next/server';
import { fetchTopCoins, fetchCoinHistory } from '@/lib/crypto-sources';
import { getStoredCoinData } from '@/lib/crypto-data';

/**
 * GET /api/crypto/prices
 * Returns current crypto prices (from cache or live)
 * Query params: ?coin=bitcoin&days=7 for history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin');
    const days = parseInt(searchParams.get('days') || '7', 10);

    // If requesting a specific coin's history
    if (coin) {
      const history = await fetchCoinHistory(coin, Math.min(days, 30));
      return NextResponse.json({
        coin,
        days,
        prices: history.prices,
        volumes: history.volumes,
      });
    }

    // Try stored data first (faster), fall back to live
    let coins = await getStoredCoinData();

    if (coins.length === 0) {
      const liveCoins = await fetchTopCoins(20);
      coins = liveCoins.map(c => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        image: c.image,
        price_gbp: c.current_price,
        price_change_24h: c.price_change_percentage_24h || 0,
        price_change_7d: c.price_change_percentage_7d_in_currency || 0,
        market_cap: c.market_cap,
        volume_24h: c.total_volume,
        sparkline: c.sparkline_in_7d?.price?.slice(-24) || [],
        last_updated: c.last_updated,
      }));
    }

    return NextResponse.json({ coins });
  } catch (error: any) {
    console.error('Crypto prices API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
