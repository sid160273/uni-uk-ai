import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getStoredCoinData } from '@/lib/crypto-data';
import { getCryptoPosts } from '@/lib/crypto-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, chatState } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch current market data for context
    let marketContext = '';
    let coinData: any[] = [];
    try {
      coinData = await getStoredCoinData();
      marketContext = coinData.slice(0, 15).map((coin, i) =>
        `${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): £${coin.price_gbp.toLocaleString()} | 24h: ${coin.price_change_24h > 0 ? '+' : ''}${coin.price_change_24h.toFixed(2)}% | 7d: ${coin.price_change_7d > 0 ? '+' : ''}${coin.price_change_7d.toFixed(2)}%`
      ).join('\n');
    } catch (error) {
      console.error('Error fetching market data for chat:', error);
    }

    // Fetch recent crypto stories
    let storiesContext = '';
    try {
      const posts = await getCryptoPosts();
      storiesContext = posts.slice(0, 5).map((post, i) =>
        `${i + 1}. "${post.title}" — ${post.excerpt} [Read more](/crypto/news#${post.slug})`
      ).join('\n');
    } catch (error) {
      console.error('Error fetching crypto stories for chat:', error);
    }

    const topicsDiscussed = chatState?.topicsDiscussed || [];

    const systemPrompt = `You are the crypto AI assistant at uni-uk.ai/crypto — a sharp, data-driven crypto analyst who makes the market accessible to everyone.

PERSONALITY:
- Knowledgeable but never condescending
- Data-first: always cite specific prices and percentages
- Balanced: acknowledge both bull and bear cases
- British English, conversational tone
- You're excited about crypto but honest about risks

CURRENT MARKET DATA:
${marketContext || 'Market data currently loading...'}

RECENT CRYPTO STORIES:
${storiesContext || 'No stories yet — we are building our crypto coverage!'}

GUIDELINES:
1. Always include specific price data when discussing a coin
2. Reference our articles when relevant: [Title](/crypto/news#slug)
3. Link to live prices: [View all prices](/crypto)
4. Keep responses 2-4 paragraphs max
5. End with a relevant follow-up question or suggestion
6. If asked for financial advice, say you provide analysis and information, not financial advice
7. Use markdown for formatting — bold key numbers, bullet points for lists

STAY ON BRAND:
- You are uni-uk.ai's crypto assistant
- If asked non-crypto questions, redirect warmly: "I'm all about crypto! Speaking of which..."

Topics discussed so far: ${topicsDiscussed.join(', ') || 'None yet'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const aiResponse = completion.choices[0]?.message?.content ||
      "Hey! I'm your crypto AI assistant. Ask me about any coin, market trends, or what's moving right now!";

    // Update state
    const newState = { ...chatState };
    if (!newState.topicsDiscussed) newState.topicsDiscussed = [];
    const lowerMsg = message.toLowerCase();

    for (const coin of coinData) {
      if (
        (lowerMsg.includes(coin.symbol.toLowerCase()) || lowerMsg.includes(coin.name.toLowerCase())) &&
        !newState.topicsDiscussed.includes(coin.name)
      ) {
        newState.topicsDiscussed.push(coin.name);
      }
    }

    // Build recommendations from mentioned coins
    const recommendations = coinData
      .filter(coin =>
        aiResponse.toLowerCase().includes(coin.symbol.toLowerCase()) ||
        aiResponse.toLowerCase().includes(coin.name.toLowerCase())
      )
      .slice(0, 5)
      .map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
        price: coin.price_gbp,
        change24h: coin.price_change_24h,
      }));

    return NextResponse.json({
      message: aiResponse,
      recommendations,
      newState,
    });
  } catch (error: any) {
    console.error('Crypto chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: error.message },
      { status: 500 }
    );
  }
}
