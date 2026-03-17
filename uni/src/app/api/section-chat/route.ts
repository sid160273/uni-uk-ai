import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSectionPosts } from '@/lib/section-data';
import { getSection } from '@/lib/sections';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Section-scoped AI chat
 * POST /api/section-chat
 * Body: { message, section, chatState }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, section: sectionSlug, chatState } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const section = getSection(sectionSlug || 'trending');

    // Fetch section-specific stories for context
    let stories: any[] = [];
    let storyContext = '';
    try {
      stories = await getSectionPosts(sectionSlug || 'trending', 10);
      storyContext = stories.map((post, i) =>
        `${i + 1}. "${post.title}" (${post.category}) — ${post.excerpt} [Read more](/blog/${post.slug})`
      ).join('\n');
    } catch (error) {
      console.error('Error fetching section stories for chat:', error);
    }

    const topicsDiscussed = chatState?.topicsDiscussed || [];

    const sectionPrompt = section?.chatSystemPrompt ||
      'You are the AI behind uni-uk.ai — a sharp, engaging news assistant.';

    const systemPrompt = `${sectionPrompt}

YOUR PERSONALITY:
- Sharp, witty, and genuinely knowledgeable about ${section?.name || 'trending news'}
- You have real opinions — don't sit on the fence
- Conversational, never robotic or dry
- You're the person everyone turns to for ${section?.name || 'news'} because you always know what's going on

CURRENT ${(section?.name || 'TRENDING').toUpperCase()} STORIES:
${storyContext || 'No stories loaded — tell the user to check back soon.'}

GUIDELINES:
1. Reference our articles with markdown links: [Title](/blog/slug)
2. If asked "what's trending?", give a punchy summary of the top stories
3. Be opinionated — share WHY things matter, not just facts
4. Keep responses concise: 2-4 paragraphs max
5. End with a follow-up question or suggestion
6. Use bullet points for multiple items
7. Stay in your lane: you're the ${section?.name || 'news'} expert at uni-uk.ai

Topics discussed so far: ${topicsDiscussed.join(', ') || 'None yet'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });

    const aiResponse = completion.choices[0]?.message?.content ||
      `I'm here to help with ${section?.name || 'trending'} news — ask me anything!`;

    // Track discussed topics
    const newState = { ...chatState, topicsDiscussed: [...topicsDiscussed] };
    const lowerMsg = message.toLowerCase();

    for (const story of stories) {
      const titleWords = story.title.toLowerCase().split(/\s+/);
      const matchCount = titleWords.filter((w: string) => w.length > 3 && lowerMsg.includes(w)).length;
      if (matchCount >= 2 && !newState.topicsDiscussed.includes(story.title)) {
        newState.topicsDiscussed.push(story.title);
      }
    }

    const recommendations = stories
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

    return NextResponse.json({ message: aiResponse, recommendations, newState });
  } catch (error: any) {
    console.error('Section chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: error.message },
      { status: 500 }
    );
  }
}
