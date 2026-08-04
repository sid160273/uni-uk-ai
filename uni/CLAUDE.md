# uni-uk.ai — Project Setup & Context

## Quick Start (New Laptop)

```bash
# 1. Install Node.js 22 (required)
brew install node@22
# Or use nvm:
# nvm install 22 && nvm use 22

# 2. Install dependencies
cd ~/uni
npm install

# 3. Verify .env.local exists (should be in the transferred folder)
# If missing, copy from .env.example and fill in real values from Vercel dashboard:
# https://vercel.com/dashboard → uni-uk-ai → Settings → Environment Variables
cat .env.local

# 4. Run locally
npm run dev
# Site runs at http://localhost:3000

# 5. Link to Vercel (for deployments)
npx vercel login
npx vercel link
```

### System Requirements
- **Node.js:** v22.x (project uses Next.js 16 which requires Node 22+)
- **npm:** v10.x (comes with Node 22)
- **OS:** macOS (developed on Darwin)
- **Git:** standard install

---

## What Is This Project?

**uni-uk.ai** is a UK university and UCAS Clearing guide. It covers 140 UK universities with rankings, entry requirements, student satisfaction and cost of living, plus Clearing guidance and an AI adviser that matches a student's grades against the database.

- **Live site:** https://uni-uk.ai
- **Framework:** Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Hosting:** Vercel
- **Storage:** Google Sheets (BlogPosts sheet, columns A-M) — articles and chat logs
- **AI:** OpenAI GPT-4o-mini for the Clearing adviser and article generation
- **Deployment:** Push to `main` branch triggers Vercel auto-deploy

### History — read this before assuming what the site is

The site has been through two identities:

1. **Dec 2025 – Jan 2026:** UK university finder with an AI chat (`a730c8623` is the last commit of this era).
2. **Mar 2026:** pivoted to "Universal News Intelligence", a general trending-news portal (`67e058400`, `1a8363bc2`). Chat deleted Apr 2026 (`26dee785c`), crons paused May 2026 (`351bcc86e`).
3. **Aug 2026 — current:** repositioned back to universities and Clearing, keeping the editorial design from the news era.

The news-era pages (`/blog/*`, `/topic/*`, `/crypto/*`, `/sport`, `/tech`, `/business`, `/entertainment`) **still exist and still resolve** so old links don't 404, but they are `noindex, follow` and excluded from `sitemap.xml`. See `src/lib/seo.ts`.

---

## Architecture

```
Education feeds ─┐
Google News RSS ─┼→ Education filter → AI Writer → Google Sheets → Next.js Frontend
General trends ──┘                                        ↓
(filtered)                                     Google Indexing API

Student → Clearing adviser (/api/chat) → universities.json + Fuse.js → recommendations
```

### Clearing cycle is data-driven

`src/lib/clearing.ts` is the single source of truth for the cycle. Key dates, the
current phase (`pre-clearing` / `clearing-open` / `results-week` / `clearing-late` /
`closed`), the countdown target and all phase-dependent headline copy derive from it
at request time. **To roll the site to the next cycle, edit `CLEARING_CYCLE` and
nothing else.** Never hardcode a date or a day count in a page.

Pages that depend on the phase use `export const dynamic = "force-dynamic"` so the
copy can't be cached across a milestone boundary.

### Content Pipeline (every 3 hours via Vercel cron)
1. Fetch UK education/Clearing stories (`src/lib/education-sources.ts`) **and** general trends in parallel
2. Filter general trends through `isEducationStory()` — only education-relevant national stories survive
3. Dedup against last 48 hours of posts
4. Generate up to 7 articles (quick-take for breaking, standard for others)
5. Save to Google Sheets
6. Ping Google Indexing API
7. Email alert via Resend if cron fails

Set `EDUCATION_ONLY=false` in Vercel env vars to restore the old general-news behaviour.

---

## Key File Locations

### Pages
| Page | File |
|------|------|
| Homepage (Clearing-first) | `src/app/page.tsx` |
| Clearing hub | `src/app/clearing/page.tsx` |
| Clearing guides | `src/app/clearing/{how-it-works,missed-grades,better-than-expected,key-dates}/page.tsx` |
| Universities index | `src/app/universities/page.tsx` |
| University detail | `src/app/universities/[slug]/page.tsx` |
| Rankings | `src/app/rankings/{academic,satisfaction,sports}/page.tsx` |
| Regions | `src/app/regions/[slug]/page.tsx` |
| About | `src/app/about/page.tsx` |
| Editorial Policy | `src/app/editorial-policy/page.tsx` |
| Contact | `src/app/contact/page.tsx` |
| *Legacy, noindexed* | `src/app/{blog,topic,crypto,sport,tech,business,entertainment}/**` |

### Clearing & universities
| Purpose | File |
|---------|------|
| **Clearing cycle data + phase logic** | `src/lib/clearing.ts` |
| University data + region matching | `src/lib/data.ts` |
| Noindex policy for legacy pages | `src/lib/seo.ts` |
| Clearing adviser API | `src/app/api/chat/route.ts` |
| Chat logging to Sheets | `src/app/api/log-chat/route.ts` |

### Content Pipeline
| Purpose | File |
|---------|------|
| **Education/Clearing sources** | `src/lib/education-sources.ts` |
| Google Trends | `src/lib/news-sources.ts` |
| Reddit | `src/lib/reddit-trends.ts` |
| UK News Feeds | `src/lib/uk-news-feeds.ts` |
| Aggregator | `src/lib/trend-aggregator.ts` |
| Blog generator | `src/lib/blog-generator.ts` |
| Blog data (Sheets) | `src/lib/blog-data.ts` |
| Dedup | `src/lib/dedup-posts.ts` |

### API Routes (Cron Jobs)
| Route | Schedule | Purpose |
|-------|----------|---------|
| `/api/cron/generate-blog` | Every 3 hours | Education/Clearing content pipeline |
| `/api/cron/fetch-chat-data` | Daily midnight | Chat analytics GA4 → Sheets |
| `/api/cron/fetch-ads-data` | Every 12 hours | Ad performance |
| `/api/cron/daily-digest` | Daily 7am UK | Newsletter via Resend |
| `/api/cron/fetch-crypto` | *paused* | Crypto — route exists, no cron entry |

### Social Media
| Platform | File | Status |
|----------|------|--------|
| Twitter | `src/lib/twitter.ts` | DISABLED (account suspended) |
| Bluesky | `src/lib/bluesky.ts` | Needs account setup |
| Threads | `src/lib/threads.ts` | If configured |

### Components
- Navigation: `src/components/MainNavigation.tsx` (Clearing / Universities / Rankings dropdowns)
- Clearing adviser chat: `src/components/ClearingAdviser.tsx` — **replaces the old `SearchBox.tsx`, which was deleted in `26dee785c`**
- Results-day countdown: `src/components/ClearingCountdown.tsx`
- Clearing CTA block: `src/components/ClearingCallout.tsx`
- Clearing guide shell: `src/components/ClearingGuideLayout.tsx`
- Ranking page shell: `src/components/RankingPage.tsx` (all three ranking pages are thin wrappers)
- University search/filter: `src/components/UniversityDirectory.tsx`
- Shared footer: `src/components/SiteFooter.tsx`
- Structured data: `src/components/StructuredData.tsx`

### Data
- Universities JSON: `src/data/universities.json` (140 universities)
- FAQ data: `src/data/faq-data.ts`
- Static blog posts: `src/data/blog-posts.ts`

---

## Environment Variables

All env vars are set in **Vercel dashboard** (Settings → Environment Variables). For local dev, they live in `.env.local` (gitignored).

### Required
| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | GPT-4o-mini for article generation |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Service account for Sheets + Indexing API |
| `GOOGLE_SHEET_ID` | Blog posts spreadsheet ID |
| `CRON_SECRET` | Auth token for Vercel cron endpoints |

### Social Media (optional)
| Variable | Purpose |
|----------|---------|
| `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET` | Twitter/X (currently disabled) |
| `TWITTER_ENABLED` | Set to `false` (account suspended) |
| `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`, `BLUESKY_ENABLED` | Bluesky posting |
| `THREADS_USER_ID`, `THREADS_ACCESS_TOKEN` | Threads posting |

### Analytics & Ads
| Variable | Purpose |
|----------|---------|
| `GA4_PROPERTY_ID` | Google Analytics 4 |
| `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID` | Google Ads API |
| `ADMIN_SECRET_KEY` | Admin dashboard auth |

### Email
| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` | Newsletter & alerts |
| `ALERT_EMAIL` | sidspace.info@gmail.com |

---

## Design System

- **Style:** Wired magazine editorial aesthetic — monochrome, sharp corners (`--radius: 0.25rem`), red (`destructive`) as the single accent
- **Fonts:** `font-display` (Playfair, headlines), `font-body-serif` (Source Serif, body)
- **Section headers:** `text-[11px] font-bold uppercase tracking-editorial` with `border-b-2 border-foreground`
- **Buttons:** `bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial` (primary); `border border-foreground` (secondary); `bg-destructive` reserved for the Clearing CTA
- **Layout:** 2-column desktop (7/5 grid), content left, sidebar right
- **Images:** 1600x900 for Google Discover eligibility
- **Do not** introduce gradients, `rounded-xl`, or `text-primary` — those are leftovers from the pre-March design and are being removed as pages are touched.

---

## Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Image domains, URL redirects (university slugs, old category URLs) |
| `vercel.json` | Cron job schedules |
| `tsconfig.json` | TypeScript config, `@/*` path alias maps to `./src/*` |
| `postcss.config.mjs` | Tailwind CSS 4 via `@tailwindcss/postcss` |
| `eslint.config.mjs` | ESLint config |

---

## Working Preferences

- **Don't change things without asking first** — always explain reasoning and get confirmation
- **No Co-Authored-By lines** in git commit messages
- **Data-driven, probabilistic thinking** — never hardcode values as fixed rules
- **Deploy:** Push to `main` auto-deploys to Vercel. No manual deploy step needed.
