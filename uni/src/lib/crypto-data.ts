/**
 * Crypto Data Module
 * Reads/writes crypto data from Google Sheets (CryptoData + CryptoPosts tabs)
 */

import { google } from 'googleapis';

export interface CryptoPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  coins: string[]; // e.g. ["BTC", "ETH"]
  tags: string[];
  readingTime: number;
  status: 'published' | 'draft';
}

export interface StoredCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price_gbp: number;
  price_change_24h: number;
  price_change_7d: number;
  market_cap: number;
  volume_24h: number;
  sparkline: number[];
  last_updated: string;
}

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

/**
 * Fetches crypto posts from Google Sheets (CryptoPosts tab)
 */
export async function getCryptoPosts(): Promise<CryptoPost[]> {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GOOGLE_SHEET_ID) {
      return [];
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'CryptoPosts!A:L',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    const posts: CryptoPost[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;

      const status = (row[11] || 'published').toLowerCase();
      if (status === 'draft') continue;

      try {
        posts.push({
          slug: row[0] || '',
          title: row[1] || '',
          excerpt: row[2] || '',
          content: row[3] || '',
          author: row[4] || 'uni-uk.ai Crypto Desk',
          publishedAt: row[5] || new Date().toISOString().split('T')[0],
          updatedAt: row[6] || row[5] || new Date().toISOString().split('T')[0],
          imageUrl: row[7] || '',
          coins: parseJsonArray(row[8]),
          tags: parseJsonArray(row[9]),
          readingTime: parseInt(row[10], 10) || 4,
          status: status as 'published' | 'draft',
        });
      } catch (e) {
        console.error(`Error parsing crypto post row ${i}:`, e);
      }
    }

    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return posts;
  } catch (error) {
    console.error('Error fetching crypto posts:', error);
    return [];
  }
}

/**
 * Saves a crypto post to Google Sheets
 */
export async function saveCryptoPost(post: CryptoPost): Promise<boolean> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      post.slug,
      post.title,
      post.excerpt,
      post.content,
      post.author,
      post.publishedAt,
      post.updatedAt,
      post.imageUrl,
      JSON.stringify(post.coins),
      JSON.stringify(post.tags),
      post.readingTime.toString(),
      post.status,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'CryptoPosts!A:L',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error('Error saving crypto post:', error);
    return false;
  }
}

/**
 * Gets a crypto post by slug
 */
export async function getCryptoPostBySlug(slug: string): Promise<CryptoPost | undefined> {
  const posts = await getCryptoPosts();
  return posts.find(p => p.slug === slug);
}

/**
 * Saves coin market data snapshot to Google Sheets
 */
export async function saveCoinSnapshot(coins: StoredCoinData[]): Promise<boolean> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Clear existing data and write fresh
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'CryptoData!A2:K1000',
    });

    const rows = coins.map(coin => [
      coin.id,
      coin.symbol,
      coin.name,
      coin.image,
      coin.price_gbp.toString(),
      coin.price_change_24h.toString(),
      coin.price_change_7d.toString(),
      coin.market_cap.toString(),
      coin.volume_24h.toString(),
      JSON.stringify(coin.sparkline.slice(-24)), // Last 24 points
      coin.last_updated,
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'CryptoData!A2',
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });

    return true;
  } catch (error) {
    console.error('Error saving coin snapshot:', error);
    return false;
  }
}

/**
 * Gets stored coin data from Google Sheets
 */
export async function getStoredCoinData(): Promise<StoredCoinData[]> {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !process.env.GOOGLE_SHEET_ID) {
      return [];
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'CryptoData!A2:K100',
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows.map(row => ({
      id: row[0] || '',
      symbol: row[1] || '',
      name: row[2] || '',
      image: row[3] || '',
      price_gbp: parseFloat(row[4]) || 0,
      price_change_24h: parseFloat(row[5]) || 0,
      price_change_7d: parseFloat(row[6]) || 0,
      market_cap: parseFloat(row[7]) || 0,
      volume_24h: parseFloat(row[8]) || 0,
      sparkline: parseJsonArray(row[9]).map(Number),
      last_updated: row[10] || '',
    }));
  } catch (error) {
    console.error('Error fetching stored coin data:', error);
    return [];
  }
}

/**
 * Checks if a crypto post slug already exists
 */
export async function cryptoSlugExists(slug: string): Promise<boolean> {
  const posts = await getCryptoPosts();
  return posts.some(p => p.slug === slug);
}

function parseJsonArray(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (value.includes(',')) return value.split(',').map(s => s.trim()).filter(Boolean);
    return value ? [value.trim()] : [];
  }
}
