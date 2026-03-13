import { NextRequest, NextResponse } from 'next/server';

interface TrendItem {
  title: string;
  trafficVolume?: string;
  pictureUrl?: string;
  region: string;
  regionLabel: string;
  relatedHeadlines: string[];
}

// Supported countries
const SUPPORTED_REGIONS: Record<string, string> = {
  GB: 'UK',
  US: 'USA',
  AU: 'Australia',
  CA: 'Canada',
  IN: 'India',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  BR: 'Brazil',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
  AE: 'UAE',
  SG: 'Singapore',
  NZ: 'New Zealand',
  IE: 'Ireland',
  IT: 'Italy',
  ES: 'Spain',
  MX: 'Mexico',
  AR: 'Argentina',
};

function parseTrendsRSS(xmlText: string, region: string, regionLabel: string): TrendItem[] {
  const items: TrendItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const trafficMatch = itemXml.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
    const pictureMatch = itemXml.match(/<ht:picture>(.*?)<\/ht:picture>/);

    // Extract related headlines
    const newsItemRegex = /<ht:news_item_title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/ht:news_item_title>/g;
    const headlines: string[] = [];
    let newsMatch;
    while ((newsMatch = newsItemRegex.exec(itemXml)) !== null) {
      headlines.push(newsMatch[1].replace(/<[^>]*>/g, '').trim());
    }

    if (titleMatch) {
      items.push({
        title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
        trafficVolume: trafficMatch ? trafficMatch[1].trim() : undefined,
        pictureUrl: pictureMatch ? pictureMatch[1].trim() : undefined,
        region,
        regionLabel,
        relatedHeadlines: headlines,
      });
    }
  }

  return items;
}

/**
 * GET /api/trends?geo=GB&limit=10
 * Fetches live Google Trends for a given country
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const geo = (searchParams.get('geo') || 'GB').toUpperCase();
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

  const regionLabel = SUPPORTED_REGIONS[geo];
  if (!regionLabel) {
    return NextResponse.json(
      { error: `Unsupported region: ${geo}`, supported: Object.keys(SUPPORTED_REGIONS) },
      { status: 400 }
    );
  }

  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; uni-uk.ai/1.0)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch trends for ${geo}`, status: response.status },
        { status: 502 }
      );
    }

    const xmlText = await response.text();
    const items = parseTrendsRSS(xmlText, geo, regionLabel);

    return NextResponse.json({
      region: geo,
      regionLabel,
      topics: items.slice(0, limit),
      fetchedAt: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error(`Error fetching trends for ${geo}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch trends', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trends/regions — returns list of supported regions
 */
export { SUPPORTED_REGIONS };
