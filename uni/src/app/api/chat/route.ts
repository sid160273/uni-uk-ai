import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAllUniversities, University } from '@/lib/data';
import { getClearingStatus, getTimeline } from '@/lib/clearing';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatState {
  course?: string;
  isInternational?: boolean;
  country?: string;
  /** Grades the student actually holds, once results are out. */
  achievedGrades?: string;
  /** Grades they were predicted, before results day. */
  predictedGrades?: string;
  location?: string;
  /** Which results-day situation they are in — drives the advice. */
  situation?: 'missed-grades' | 'no-offers' | 'better-grades' | 'holding-offer';
  sports?: boolean;
  nightlife?: boolean;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

/** Course keywords → canonical course name. Extend rather than special-case. */
const COURSE_PATTERNS: Array<[RegExp, string]> = [
  [/veterinary|vet medicine/, 'Veterinary Medicine'],
  [/medicine|medical school|mbbs/, 'Medicine'],
  [/dentistry|dental/, 'Dentistry'],
  [/nursing|midwifery/, 'Nursing'],
  [/pharmac/, 'Pharmacy'],
  [/engineer/, 'Engineering'],
  [/computer|computing|software|data science/, 'Computer Science'],
  [/business|management|marketing/, 'Business'],
  [/economics|finance|accounting/, 'Economics & Finance'],
  [/\blaw\b|llb/, 'Law'],
  [/psycholog/, 'Psychology'],
  [/architect/, 'Architecture'],
  [/journalis|media studies/, 'Media & Journalism'],
  [/\bart\b|design|fine art/, 'Art & Design'],
  [/history|politics|sociolog/, 'Humanities & Social Sciences'],
  [/biolog|chemistr|physic|maths|mathematic/, 'Sciences'],
  [/sport science|sports science/, 'Sport Science'],
  [/education|teaching|teacher/, 'Education'],
];

const REGION_PATTERNS: Array<[RegExp, string]> = [
  [/london/, 'London'],
  [/scotland|edinburgh|glasgow|aberdeen|dundee|st andrews/, 'Scotland'],
  [/wales|cardiff|swansea|bangor/, 'Wales'],
  [/northern ireland|belfast/, 'Northern Ireland'],
  [/manchester|leeds|liverpool|newcastle|sheffield|north/, 'North England'],
  [/birmingham|nottingham|leicester|coventry|midlands/, 'Midlands'],
  [/bristol|exeter|bath|plymouth|south west/, 'South West England'],
  [/brighton|southampton|portsmouth|kent|surrey|south east/, 'South East England'],
  [/cambridge|norwich|essex|east/, 'East England'],
];

const COUNTRIES = [
  'india', 'china', 'usa', 'america', 'canada', 'nigeria', 'malaysia',
  'singapore', 'hong kong', 'pakistan', 'bangladesh', 'saudi arabia', 'uae',
  'kenya', 'ghana', 'south africa', 'australia', 'new zealand', 'ireland',
];

/**
 * Read what we can out of the student's message. This is a cheap first pass —
 * the model still sees the raw text, so a miss here degrades the follow-up
 * questions rather than the advice itself.
 */
function updateState(state: ChatState, message: string): ChatState {
  const next = { ...state };
  const lower = message.toLowerCase();

  if (/international|overseas|foreign student/.test(lower)) next.isInternational = true;
  else if (/domestic|uk student|british|home student/.test(lower)) next.isInternational = false;

  for (const country of COUNTRIES) {
    if (lower.includes(country)) {
      next.country = country.charAt(0).toUpperCase() + country.slice(1);
      next.isInternational = true;
      break;
    }
  }

  for (const [pattern, course] of COURSE_PATTERNS) {
    if (pattern.test(lower)) {
      next.course = course;
      break;
    }
  }

  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(lower)) {
      next.location = region;
      break;
    }
  }

  // Which results-day situation are they in? This is the single most useful
  // thing to know during Clearing, so look for it explicitly.
  if (/missed|didn't get|did not get|dropped a grade|below my offer|rejected/.test(lower)) {
    next.situation = 'missed-grades';
  } else if (/better than|exceeded|higher than expected|smashed|did better/.test(lower)) {
    next.situation = 'better-grades';
  } else if (/no offers|no offer|unsuccessful|turned down everywhere/.test(lower)) {
    next.situation = 'no-offers';
  } else if (/got my place|firm choice accepted|got in/.test(lower)) {
    next.situation = 'holding-offer';
  }

  // Grades: A-level style (AAB, A*AB, BBC) or IB points.
  //
  // Case-sensitive on purpose. Matching case-insensitively means ordinary words
  // made of the letters A-E — "bad", "cab", "ace", "dead" — parse as grades, and
  // a wrong grade in chatState is worse than no grade, because the model is told
  // it is fact. Students write grades in caps; if they do not, the model still
  // reads the raw message.
  const alevel = message.match(
    /\b((?:A\*|[A-E])[ ]?(?:A\*|[A-E])[ ]?(?:A\*|[A-E])(?:[ ]?(?:A\*|[A-E]))?)\b/
  );
  const ib =
    message.match(/\b(\d{2})\s*(?:ib\s*)?points?\b/i) ||
    message.match(/\bib\s*(\d{2})\b/i);
  const grades =
    alevel?.[1]?.replace(/\s+/g, '') || (ib ? `IB ${ib[1]} points` : null);

  if (grades) {
    // "predicted" only if they say so; during Clearing most grades are achieved.
    if (/predicted|expecting|should get/.test(lower)) next.predictedGrades = grades;
    else next.achievedGrades = grades;
  }

  if (/sport|gym|athletic|football team/.test(lower)) next.sports = true;
  if (/nightlife|going out|clubs|social scene/.test(lower)) next.nightlife = true;

  return next;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = body?.message;
    const chatState: ChatState = body?.chatState ?? {};
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'The adviser is not configured right now. Please try again later.' },
        { status: 503 }
      );
    }

    const universities = getAllUniversities();
    const status = getClearingStatus();
    const timeline = getTimeline();

    const known: string[] = [];
    if (chatState.situation) known.push(`Situation: ${chatState.situation}`);
    if (chatState.course) known.push(`Course: ${chatState.course}`);
    if (chatState.achievedGrades) known.push(`Achieved grades: ${chatState.achievedGrades}`);
    if (chatState.predictedGrades) known.push(`Predicted grades: ${chatState.predictedGrades}`);
    if (chatState.isInternational !== undefined) {
      known.push(`Student type: ${chatState.isInternational ? 'International' : 'UK/domestic'}`);
    }
    if (chatState.country) known.push(`Home country: ${chatState.country}`);
    if (chatState.location) known.push(`Preferred location: ${chatState.location}`);
    if (chatState.sports) known.push('Cares about sport facilities');
    if (chatState.nightlife) known.push('Cares about nightlife');

    const knownBlock = known.length
      ? `\n\nWHAT YOU ALREADY KNOW ABOUT THIS STUDENT:\n${known.join('\n')}`
      : '';

    // Give the model the database, trimmed to what it needs to reason and link.
    const universityKnowledge = universities.map((uni) => ({
      name: uni.name,
      slug: uni.slug,
      location: uni.location,
      entryRequirements: uni.entryRequirements?.substring(0, 180) || 'Varies by course',
      rankings: `Guardian ${uni.rankings?.guardian ?? 'n/a'}, THE ${uni.rankings?.the ?? 'n/a'}, NSS ${uni.rankings?.nss ?? 'n/a'}%`,
      costOfLiving: uni.locationStats?.costOfLiving ?? 'n/a',
      nightlife: uni.locationStats?.nightlife ?? 'n/a',
      vibe: uni.locationStats?.vibe ?? 'n/a',
      sportsRanking: uni.campusStats?.sportsRanking ?? 'n/a',
      features: uni.features?.join(', ') || '',
    }));

    const datesBlock = timeline
      .map((d) => `- ${d.label}: ${new Date(d.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}${d.passed ? ' (passed)' : ''}`)
      .join('\n');

    const systemPrompt = `You are the UCAS Clearing adviser on uni-uk.ai. You help UK and international students find a university place during Clearing.

WHERE WE ARE IN THE CYCLE RIGHT NOW: ${status.headline}. ${status.standfirst}
${status.isLive ? 'Clearing is LIVE. Urgency is real — advise them to phone universities today.' : 'Clearing has not hit peak yet. Advise them to prepare a shortlist now.'}

KEY DATES THIS CYCLE:
${datesBlock}

HOW CLEARING ACTUALLY WORKS (never contradict this):
- Students phone universities directly. Universities give a VERBAL offer over the phone.
- Only after a verbal offer do they add the Clearing choice in the UCAS Hub.
- On A-level results day, grades appear from 8am but Clearing choices cannot be added until 1pm.
- Students who did BETTER than their offer keep their firm place while they look elsewhere. They must not release themselves until another university confirms.
- A student can only hold ONE Clearing choice at a time.
- Entry requirements in Clearing are often lower than the advertised standard offer. Never tell a student they definitely cannot get in — tell them to ask.

SCOPE — you only help with UK universities, courses and Clearing. If asked about anything else, be warm, say it is outside what you cover, and offer to help with their university search instead. Never be rude, even to spam.

TONE: calm, practical, encouraging. Many students reading this have just had bad news. Do not be breezy about it, and do not catastrophise either — Clearing is a normal route, not a failure.

YOUR UNIVERSITY DATABASE (${universities.length} UK universities — use ONLY this data for facts):
${JSON.stringify(universityKnowledge.slice(0, 40), null, 2)}
... and ${Math.max(0, universities.length - 40)} more with the same fields. If a university is not in your data, say you do not have its details rather than inventing them.

RULES:
1. Every time you name a university, link it: [University Name](/universities/SLUG) using the EXACT slug from the database. Never guess or shorten a slug.
2. Ask ONE question at a time. If you must ask more, use markdown bullet points.
3. Establish, in this order, whatever you do not already know: their situation (missed grades / no offers / better than expected), their subject, their actual grades, then location preference.
4. Once you know situation + subject + grades, recommend 3-5 specific universities. For each, give a concrete reason grounded in the database — the ranking, the entry requirements, the vibe, cost of living.
5. Compare their grades against the entry requirements in the data and be honest but encouraging about the gap. Always frame it as "worth calling" rather than "you will not get in".
6. Tell them the practical next step: call the university's Clearing hotline today.
7. Never invent rankings, entry requirements, hotline numbers, course availability or deadlines. If you do not know, say so and point them at UCAS.
8. Keep it tight — 2-3 sentences per university.
${knownBlock}`;

    // Feed back the recent turns so the adviser does not re-ask what it just asked.
    const priorTurns = history.slice(-8).map((m) => ({
      role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...priorTurns,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "I'm here to help you find a place through Clearing. What subject are you hoping to study?";

    const newState = updateState(chatState, message);

    // Prefer the universities the adviser actually named; fall back to a search
    // over what we know about the student.
    let recommendations: University[] = universities.filter((uni) =>
      aiResponse.toLowerCase().includes(uni.name.toLowerCase())
    );

    if (recommendations.length === 0) {
      const searchTerms = [newState.location, newState.course].filter(Boolean);
      if (searchTerms.length > 0) {
        const Fuse = (await import('fuse.js')).default;
        const fuse = new Fuse(universities, {
          keys: [
            { name: 'name', weight: 0.4 },
            { name: 'location', weight: 0.3 },
            { name: 'description', weight: 0.2 },
            { name: 'features', weight: 0.1 },
          ],
          threshold: 0.4,
        });

        let results = fuse.search(searchTerms.join(' ')).map((r) => r.item);
        if (newState.sports) {
          results = results.filter((u) => (u.campusStats?.sportsRanking ?? 100) < 50);
        }
        if (newState.nightlife) {
          results = results.filter((u) => (u.locationStats?.nightlife ?? 0) >= 4);
        }
        recommendations = results;
      }
    }

    return NextResponse.json({
      message: aiResponse,
      recommendations: recommendations.slice(0, 5),
      newState,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('Clearing adviser error:', details);
    return NextResponse.json(
      { error: 'Failed to process chat request', details },
      { status: 500 }
    );
  }
}
