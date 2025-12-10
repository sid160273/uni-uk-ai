import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAllUniversities, University } from '@/lib/data';

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

    const universities = getAllUniversities();

    // Build context about what the user is looking for
    const userPreferences = [];
    if (chatState?.location) userPreferences.push(`Location: ${chatState.location}`);
    if (chatState?.course) userPreferences.push(`Course: ${chatState.course}`);
    if (chatState?.predictedGrades) userPreferences.push(`Predicted Grades: ${chatState.predictedGrades}`);
    if (chatState?.vibe) userPreferences.push(`Vibe: ${chatState.vibe}`);
    if (chatState?.sports) userPreferences.push(`Interested in sports facilities`);
    if (chatState?.nightlife) userPreferences.push(`Interested in nightlife`);

    const userContext = userPreferences.length > 0
      ? `\n\nUser Preferences So Far:\n${userPreferences.join('\n')}`
      : '';

    // Create detailed university database for AI knowledge
    const universityKnowledge = universities.map(uni => ({
      name: uni.name,
      location: uni.location,
      description: uni.description?.substring(0, 300) || 'No description available',
      features: uni.features?.join(', ') || 'N/A',
      rankings: `Guardian: ${uni.rankings?.guardian || 'N/A'}, THE World: ${uni.rankings?.the || 'N/A'}, NSS: ${uni.rankings?.nss || 'N/A'}%`,
      costOfLiving: uni.locationStats?.costOfLiving || 'N/A',
      nightlife: `${uni.locationStats?.nightlife || 'N/A'}/5`,
      vibe: uni.locationStats?.vibe || 'N/A',
      sportsRanking: uni.campusStats?.sportsRanking || 'N/A',
      internationalStudents: uni.campusStats?.internationalStudents ? `${uni.campusStats.internationalStudents}%` : 'N/A',
      entryRequirements: uni.entryRequirements?.substring(0, 150) || 'Varies by course',
      slug: uni.slug // For generating URLs
    }));

    // System prompt for the AI with full database knowledge
    const systemPrompt = `You are an expert UK university advisor with comprehensive knowledge of all 141 UK universities listed on Uni-UK.AI.

IMPORTANT: You have access to detailed information about each university including:
- Exact rankings (Guardian, THE World Rankings, NSS satisfaction scores)
- Entry requirements and typical A-level offers
- Accommodation options
- Location statistics (cost of living, nightlife ratings, campus vibe)
- Sports rankings and facilities
- International student percentages
- Detailed descriptions and unique features
- Travel information and accessibility

YOUR UNIVERSITY DATABASE (use this information when making recommendations):
${JSON.stringify(universityKnowledge.slice(0, 30), null, 2)}
... and 111 more universities with similar detailed data.

CONVERSATION GUIDELINES:
1. Ask ONE focused question at a time in this order:
   - First: What subject/course they want to study
   - Second: Their predicted/achieved grades (A-levels, IB, etc.)
   - Third: Location preference in the UK
   - Fourth: Campus vibe, sports, nightlife preferences
2. Be warm, conversational, and encouraging
3. When recommending universities:
   - ALWAYS include 2-3 interesting/unique details about EACH university
   - Cite SPECIFIC details from the database:
     * Mention actual rankings (e.g., "ranked #12 in the Guardian League Table")
     * Reference real features (e.g., "offers excellent sports facilities with a ranking of #25")
     * Quote entry requirements (e.g., "typically requires AAB-BBB at A-level")
     * Match their grades to entry requirements
     * Describe the actual vibe (e.g., "has a 'Historic & Friendly' atmosphere")
     * Add interesting facts (e.g., "has a vibrant nightlife scene with 5/5 rating" or "18% international students")
   - Explain WHY each university matches using real data points
   - End your recommendations with: "You can explore these universities in detail below!"
   - THEN immediately follow up with 1-2 data-driven questions to refine their search
4. CRITICAL: When providing recommendations, ALWAYS include follow-up questions in the SAME response
   - Ask about factors they haven't mentioned yet based on our database:
     * "Is nightlife important to you? Some cities have much better nightlife scenes than others."
     * "How important are sports facilities? We have universities ranked from #1 to #100+ for sports."
     * "Will you be living in university accommodation, renting privately, or with family?"
     * "Are you interested in a campus with a high international student population?"
     * "Does cost of living matter? Some cities are much more affordable than others."
     * "Would you prefer a city vibe, campus town feel, or historic university atmosphere?"
     * "How important is student satisfaction? Some universities score above 85% on NSS."
     * "Are you looking for strong employability rates after graduation?"
   - These questions help you refine and improve recommendations in the next exchange
5. Only provide 3-5 recommendations when you have: subject + grades + location
6. Keep responses concise but informative (2-3 sentences per university when recommending)

NEVER make up information - only use the exact data provided in your database.

Current conversation stage: ${userPreferences.length === 0 ? 'Just starting - ask what subject they want to study' : userPreferences.length === 1 ? 'Ask about their predicted or achieved grades (A-levels, IB, BTECs, etc.)' : userPreferences.length === 2 ? 'Ask about location preference in the UK' : 'Ask follow-up questions or make specific recommendations with data'}${userContext}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective and fast
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1200, // Increased for detailed responses with interesting facts AND follow-up questions
    });

    const aiResponse = completion.choices[0]?.message?.content ||
      "I'm here to help you find the perfect university! What are you most interested in studying?";

    // Extract preferences from the conversation
    const newState = { ...chatState };
    const lowerMsg = message.toLowerCase();

    // Update state based on user message
    if (lowerMsg.includes('london')) newState.location = 'London';
    else if (lowerMsg.includes('scotland')) newState.location = 'Scotland';
    else if (lowerMsg.includes('wales')) newState.location = 'Wales';
    else if (lowerMsg.includes('north')) newState.location = 'North England';
    else if (lowerMsg.includes('south')) newState.location = 'South England';

    // Detect course interest
    if (lowerMsg.includes('medicine') || lowerMsg.includes('medical')) newState.course = 'Medicine';
    else if (lowerMsg.includes('engineering')) newState.course = 'Engineering';
    else if (lowerMsg.includes('business')) newState.course = 'Business';
    else if (lowerMsg.includes('computer') || lowerMsg.includes('computing')) newState.course = 'Computer Science';
    else if (lowerMsg.includes('art')) newState.course = 'Arts';
    else if (lowerMsg.includes('law')) newState.course = 'Law';
    else if (lowerMsg.includes('nursing')) newState.course = 'Nursing';
    else if (lowerMsg.includes('psychology')) newState.course = 'Psychology';

    // Detect grades (A-levels, IB, etc.)
    if (lowerMsg.match(/a\*a\*a|aaa|aab|abb|bbb|abc|bbc|ccc/i)) {
      newState.predictedGrades = message.match(/[a-c\*]{3,}/i)?.[0] || '';
    } else if (lowerMsg.includes('ib') || lowerMsg.match(/\d{2}\s*points?/)) {
      newState.predictedGrades = message.match(/(ib\s*)?\d{2}\s*points?/i)?.[0] || 'IB';
    }

    // Detect interests
    if (lowerMsg.includes('sport') || lowerMsg.includes('gym') || lowerMsg.includes('athletic')) newState.sports = true;
    if (lowerMsg.includes('nightlife') || lowerMsg.includes('party') || lowerMsg.includes('club')) newState.nightlife = true;

    // Extract university names mentioned in AI response to show as cards
    let recommendations: University[] = [];

    // Try to extract university names from AI response
    const mentionedUniversities = universities.filter(uni =>
      aiResponse.toLowerCase().includes(uni.name.toLowerCase())
    );

    if (mentionedUniversities.length > 0) {
      // Show universities that AI specifically mentioned
      recommendations = mentionedUniversities.slice(0, 5);
    } else {
      // Fallback: Use Fuse.js search based on user preferences
      const Fuse = (await import('fuse.js')).default;
      const searchTerms = [];
      if (newState.location) searchTerms.push(newState.location);
      if (newState.course) searchTerms.push(newState.course);

      if (searchTerms.length > 0) {
        const fuse = new Fuse(universities, {
          keys: [
            { name: 'name', weight: 0.4 },
            { name: 'location', weight: 0.3 },
            { name: 'description', weight: 0.2 },
            { name: 'features', weight: 0.1 },
          ],
          threshold: 0.4,
        });

        const results = fuse.search(searchTerms.join(' '));
        recommendations = results.slice(0, 8).map(r => r.item);

        // Apply intelligent filters
        if (newState.sports) {
          recommendations = recommendations.filter(u => (u.campusStats.sportsRanking || 100) < 50);
        }
        if (newState.nightlife) {
          recommendations = recommendations.filter(u => u.locationStats.nightlife >= 4);
        }

        // Limit to top 5
        recommendations = recommendations.slice(0, 5);
      }
    }

    return NextResponse.json({
      message: aiResponse,
      recommendations: recommendations.slice(0, 5),
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
