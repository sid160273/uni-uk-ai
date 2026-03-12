import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAllBlogPostsCombined } from '@/lib/blog-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, chatState } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch current trending stories for context
    let trendingContext = '';
    let trendingStories: any[] = [];
    try {
      const allPosts = await getAllBlogPostsCombined();
      trendingStories = allPosts.slice(0, 10);
      trendingContext = trendingStories.map((post, i) =>
        `${i + 1}. "${post.title}" (${post.category}) — ${post.excerpt} [Read more](/blog/${post.slug})`
      ).join('\n');
    } catch (error) {
      console.error('Error fetching trending stories for chat:', error);
    }

    // Build conversation context
    const topicsDiscussed = chatState?.topicsDiscussed || [];

    const systemPrompt = `You are the AI behind uni-uk.ai — a sharp, engaging news assistant that helps people understand what's trending RIGHT NOW.

YOUR PERSONALITY:
- You're like a brilliant, well-informed friend who always knows what's going on
- Conversational, witty, and insightful — never dry or robotic
- You explain complex stories simply without being condescending
- You have genuine opinions and analysis, not just facts
- You're excited about connecting people to what matters

WHAT YOU DO:
- Help people learn about trending topics and current events
- Provide context, background, and analysis on any trending story
- Connect different stories and explain why they matter
- Suggest related topics they might find interesting
- Direct people to our detailed articles for deeper reading

CURRENT TOP TRENDING STORIES (use these to inform your responses):
${trendingContext || 'No stories loaded yet — tell the user to check back soon!'}

CONVERSATION GUIDELINES:
1. If someone asks about a specific topic, check if it's in our trending stories and reference the article
2. If they ask "what's trending?" or similar, give them a punchy summary of the top stories
3. Always link to relevant articles using markdown: [Article Title](/blog/slug)
4. Be opinionated — share your analysis of WHY things are trending
5. If asked about something not in our stories, still be helpful and knowledgeable
6. Keep responses concise but insightful — 2-4 paragraphs max
7. End responses with a question or suggestion to keep the conversation going
8. When listing multiple stories, use bullet points for readability

FORMATTING:
- Use markdown for links, bold, and bullet points
- When mentioning a trending story, ALWAYS link to it
- Keep paragraphs short and punchy

STAY ON BRAND:
- You are uni-uk.ai's trending news assistant
- If someone asks unrelated questions, be friendly but redirect: "I'm all about what's trending right now! Speaking of which, have you seen [topic]?"
- Never be dismissive — always be warm and redirect to trending content

Topics discussed so far: ${topicsDiscussed.join(', ') || 'None yet'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const aiResponse = completion.choices[0]?.message?.content ||
      "Hey! I'm here to help you catch up on what's trending. Ask me about any topic or say 'what's trending?' to get started!";

    // Update state — track what topics have been discussed
    const newState = { ...chatState };
    const lowerMsg = message.toLowerCase();

    if (!newState.topicsDiscussed) newState.topicsDiscussed = [];

    // Detect topics from the message
    for (const story of trendingStories) {
      const titleWords = story.title.toLowerCase().split(/\s+/);
      const matchCount = titleWords.filter((word: string) =>
        word.length > 3 && lowerMsg.includes(word)
      ).length;

      if (matchCount >= 2 && !newState.topicsDiscussed.includes(story.title)) {
        newState.topicsDiscussed.push(story.title);
      }
    }

    // Build recommendations from trending stories mentioned in the response
    const recommendations = trendingStories
      .filter(story => aiResponse.toLowerCase().includes(story.title.toLowerCase().split(' ')[0]))
      .slice(0, 5)
      .map((story: any) => ({
        id: story.slug,
        name: story.title,
        slug: story.slug,
        location: story.category,
        description: story.excerpt,
        imageUrl: story.imageUrl,
        category: story.category,
      }));

    return NextResponse.json({
      message: aiResponse,
      recommendations,
      newState,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error.message },
      { status: 500 }
    );
  }
}
