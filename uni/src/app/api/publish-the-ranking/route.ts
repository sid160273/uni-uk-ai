import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { notifyNewBlogPost } from '@/lib/google-indexing';

/**
 * One-off endpoint to publish the THE Most International Universities 2026 article.
 * GET /api/publish-the-ranking?secret=CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const slug = 'most-international-universities-world-2026-the-ranking';

  const title = "Imperial Beats Oxford in THE's Most International Universities 2026 — Here's the Full Breakdown";

  const excerpt = "Hong Kong dominates the top three for a third straight year, but the real story is Imperial College London leapfrogging Oxford to become the UK's most internationally connected university. Meanwhile, Australia and Canada are paying the price for their visa crackdowns.";

  const content = `Imperial College London has done something Oxford hasn't managed in years — it's become Britain's most internationally connected university, according to the Times Higher Education Most International Universities 2026 ranking.

And while that's a headline in itself, the bigger story is what's happening to universities in countries that have tightened their borders. Spoiler: it's not going well for them.

## The Top 10: Hong Kong's Hat-Trick

City University of Hong Kong has topped this ranking for the third consecutive year, and honestly, it's not even close. The entire podium is Hong Kong:

| Rank | University | Country |
|------|-----------|---------|
| 1 | City University of Hong Kong | Hong Kong |
| 2 | Hong Kong University of Science and Technology | Hong Kong |
| 3 | University of Hong Kong | Hong Kong |
| 4 | [Imperial College London](/universities/imperial-ac-uk) | United Kingdom |
| =5 | Abu Dhabi University | UAE |
| =5 | [University of Oxford](/universities/ox-ac-uk) | United Kingdom |
| 7 | [University of Cambridge](/universities/cam-ac-uk) | United Kingdom |
| 8 | ETH Zurich | Switzerland |
| 9 | École Polytechnique Fédérale de Lausanne | Switzerland |
| 10 | Nanyang Technological University | Singapore |

Hong Kong's dominance makes sense when you look at the numbers. These universities recruit heavily from mainland China, which THE counts as international, and they've built their entire identity around being global institutions in a city that's fundamentally international.

## Imperial's Big Move

[Imperial College London](/universities/imperial-ac-uk) climbing to fourth overall — and first among UK universities — isn't a fluke. With roughly 50% international students and a research profile that spans the globe, Imperial has been quietly building exactly the kind of institution this ranking rewards.

What's interesting is that Imperial's rise isn't because it got dramatically more international. It's partly because the competition stumbled. More on that in a moment.

[Oxford](/universities/ox-ac-uk) (tied 5th) and [Cambridge](/universities/cam-ac-uk) (7th) remain in the top 10, and both have international student populations above 40%. These three UK institutions have something in common: massive endowments and elite reputations that make them recession-proof when it comes to attracting foreign talent.

## The UK's Secret Weapon

While Australia lost 83% of its ranked institutions to lower positions and Canada saw 75% decline, the UK held relatively steady. Only 41% of British institutions dropped places.

The numbers tell the story. UK universities averaged an extraordinary 98.9 out of 100 for international students and 96.8 for international staff. Those aren't rankings — they're near-perfect scores.

Other UK universities worth watching in the international space:

- **[London School of Economics](/universities/lse-ac-uk)** — 70% international students, one of the highest in the world
- **[London School of Hygiene & Tropical Medicine](/universities/lshtm-ac-uk)** — 60% international students
- **[University of St Andrews](/universities/st-andrews-ac-uk)** — 47% international students
- **[University of Edinburgh](/universities/ed-ac-uk)** — 44% international students
- **[University of Warwick](/universities/warwick-ac-uk)** — 43% international students
- **[University of Glasgow](/universities/gla-ac-uk)** — 42% international students

## The Visa Crunch Effect

Here's where it gets uncomfortable for some countries. Australia, Canada, and the Netherlands all saw significant drops — and the timing lines up neatly with policy shifts that restricted international student flows.

**Australia** was hit hardest. 83% of its ranked universities dropped positions. The country has been tightening student visa requirements, capping international enrolments, and making it harder for graduates to stay.

**Canada** wasn't far behind at 75%. Similar story — tighter visa rules, reduced post-graduation work permits, and political rhetoric about reducing temporary immigration.

**The Netherlands** saw 60% of institutions decline, partly linked to debates about English-language teaching and international student caps.

THE notes that while the student enrolment data predates the 2024 policy announcements, the international reputation scores — surveyed through January 2025 — already showed declines across all three nations. In other words: the damage to perception started before the policies even fully kicked in.

## What This Ranking Actually Measures

Unlike a standard university ranking, the THE Most International Universities ranking focuses on four specific metrics:

1. **International students** — percentage of the student body from abroad
2. **International staff** — percentage of academics from other countries
3. **International co-authorship** — proportion of research papers with international collaborators
4. **International reputation** — share of votes from outside the home country in THE's Academic Reputation Survey (25% of total score)

That last one is crucial. You can have all the international students you want, but if academics around the world don't recognise your university, you'll struggle in this ranking.

## What It Means for Students

If you're a UK student considering where to study, the international dimension matters more than you might think. Universities with diverse student bodies and global research connections offer:

- **Broader networks** — your coursemates will be from dozens of countries
- **Research opportunities** — international collaborations mean cutting-edge, globally relevant research
- **Career prospects** — employers value graduates who've operated in diverse environments
- **Cultural experience** — studying alongside people from around the world is an education in itself

The UK's strong showing in this ranking is a reminder that British universities remain genuinely global institutions — even as other English-speaking countries retreat behind visa barriers.

Browse our full guide to [UK universities](/universities) to find the right international experience for you.`;

  const imageUrl = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=900&fit=crop';
  const category = 'World';
  const tags = JSON.stringify([
    'university rankings', 'THE rankings', 'international universities',
    'Imperial College', 'Oxford', 'Cambridge', 'UK universities',
    'higher education', 'study abroad', 'international students'
  ]);

  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      slug,
      title,
      excerpt,
      content,
      'uni-uk.ai Newsroom',
      now,
      now,
      imageUrl,
      category,
      tags,
      '6',
      'https://www.timeshighereducation.com/student/best-universities/most-international-universities-world',
      'published',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'BlogPosts!A:M',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    // Ping Google Indexing
    try {
      await notifyNewBlogPost(slug);
    } catch (e) {
      console.error('Indexing ping failed:', e);
    }

    // Social media posts
    const socialPosts = {
      twitter: `Imperial leapfrogs Oxford to become the UK's most international university 🇬🇧\n\nHong Kong dominates the top 3 for the third year running.\n\nMeanwhile, Australia and Canada are paying the price for visa crackdowns.\n\nFull breakdown 👇\nhttps://uni-uk.ai/blog/${slug}`,

      bluesky: `Imperial leapfrogs Oxford to become the UK's most international university.\n\nHong Kong dominates the top 3. Australia and Canada drop hard after visa crackdowns.\n\nThe full THE Most International Universities 2026 breakdown:`,

      threads: `Imperial College London just beat Oxford to become Britain's most internationally connected university 🏆\n\nThe THE Most International Universities 2026 ranking is out and the UK is looking strong — while Australia (83% of unis dropped) and Canada (75% dropped) are paying the price for tightening borders.\n\nHong Kong? Top 3 for the third year straight.\n\nFull breakdown with all the UK unis: https://uni-uk.ai/blog/${slug}`,

      funny_twitter: `Oxford: "We're the world's best university"\n\nImperial: "Cool. We're more international though"\n\nOxford: 👁️👄👁️\n\nhttps://uni-uk.ai/blog/${slug}`,

      funny_twitter_2: `Countries that cracked down on international students and then wondered why their universities dropped in the international rankings:\n\n🇦🇺 Australia: 83% dropped\n🇨🇦 Canada: 75% dropped\n\nShocked. Absolutely shocked.\n\nhttps://uni-uk.ai/blog/${slug}`,

      funny_twitter_3: `THE: "Who's the most international university?"\n\nHong Kong: "Us. Again. For the third time. Can we stop doing this now?"\n\nhttps://uni-uk.ai/blog/${slug}`,

      funny_threads: `Australia: *restricts international students*\nAlso Australia: "Why are we dropping in the international rankings?"\n\nCanada: *does the same thing*\nAlso Canada: "Wait, us too?"\n\nMeanwhile Imperial College London is just sat there in 4th place eating popcorn 🍿\n\nFull ranking: https://uni-uk.ai/blog/${slug}`,
    };

    return NextResponse.json({
      success: true,
      slug,
      url: `https://uni-uk.ai/blog/${slug}`,
      title,
      socialPosts,
    });
  } catch (error: any) {
    console.error('Error publishing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
