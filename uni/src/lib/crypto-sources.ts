/**
 * Crypto Data Sources Module
 * Fetches cryptocurrency data from CoinGecko free API
 */

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  small: string;
  large: string;
  price_btc: number;
  market_cap_rank: number;
  score: number;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { gbp: number; usd: number };
    market_cap: { gbp: number; usd: number };
    total_volume: { gbp: number; usd: number };
    high_24h: { gbp: number; usd: number };
    low_24h: { gbp: number; usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number;
    ath: { gbp: number; usd: number };
    ath_change_percentage: { gbp: number; usd: number };
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url: string;
    twitter_screen_name: string;
  };
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Fetches top coins by market cap
 */
export async function fetchTopCoins(limit = 20): Promise<CoinData[]> {
  try {
    const url = `${COINGECKO_BASE}/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=7d`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.warn(`CoinGecko markets API returned ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return [];
  }
}

/**
 * Fetches trending coins from CoinGecko
 */
export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const response = await fetch(`${COINGECKO_BASE}/search/trending`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.warn(`CoinGecko trending API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.coins || []).map((c: any) => c.item);
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return [];
  }
}

/**
 * Fetches detailed info for a single coin
 */
export async function fetchCoinDetail(coinId: string): Promise<CoinDetail | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      console.warn(`CoinGecko coin detail API returned ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching coin detail for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetches historical price data for charts
 */
export async function fetchCoinHistory(
  coinId: string,
  days: number = 7
): Promise<{ prices: [number, number][]; volumes: [number, number][] }> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=gbp&days=${days}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return { prices: [], volumes: [] };
    }

    const data = await response.json();
    return {
      prices: data.prices || [],
      volumes: data.total_volumes || [],
    };
  } catch (error) {
    console.error(`Error fetching history for ${coinId}:`, error);
    return { prices: [], volumes: [] };
  }
}

/**
 * Maps common symbols to CoinGecko IDs
 */
export const SYMBOL_TO_ID: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  bnb: 'binancecoin',
  xrp: 'ripple',
  sol: 'solana',
  ada: 'cardano',
  doge: 'dogecoin',
  dot: 'polkadot',
  matic: 'matic-network',
  avax: 'avalanche-2',
  shib: 'shiba-inu',
  link: 'chainlink',
  uni: 'uniswap',
  atom: 'cosmos',
  ltc: 'litecoin',
  xlm: 'stellar',
  algo: 'algorand',
  near: 'near',
  ftm: 'fantom',
  apt: 'aptos',
};

/**
 * Format price for display (GBP)
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) {
    return `£${price.toFixed(4)}`;
  }
  return `£${price.toFixed(8)}`;
}

/**
 * Format large numbers (market cap, volume)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `£${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `£${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `£${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `£${(num / 1e3).toFixed(2)}K`;
  return `£${num.toFixed(2)}`;
}
