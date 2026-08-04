/**
 * UCAS Clearing cycle data.
 *
 * Everything about "where are we in the cycle" is derived from these dates at
 * request time — nothing about the current phase, countdown or copy is baked in
 * as a literal anywhere else in the app. To roll the site to the next cycle,
 * edit CLEARING_CYCLE and nothing else.
 *
 * Times are stored as UTC instants. UK results-day timings are quoted in BST
 * (UTC+1) in August, so 08:00 BST is 07:00Z.
 */

export type ClearingPhaseId =
  | "pre-clearing" // cycle hasn't opened yet
  | "clearing-open" // open, but before results day
  | "results-week" // results day itself and the days either side
  | "clearing-late" // after the results-day rush, still open
  | "closed"; // cycle over

export interface ClearingDate {
  id: string;
  /** UTC instant the milestone occurs. */
  iso: string;
  /** Short label for tables and timelines. */
  label: string;
  /** What actually happens, in plain English. */
  detail: string;
  /** Show this one in the compact "key dates" rail. */
  key: boolean;
}

export interface ClearingCycle {
  year: number;
  dates: ClearingDate[];
}

export const CLEARING_CYCLE: ClearingCycle = {
  year: 2026,
  dates: [
    {
      id: "clearing-opens",
      iso: "2026-07-02T00:00:00Z",
      label: "Clearing opens",
      detail:
        "Clearing opens for applicants without a place. If you already have your results, you can start contacting universities straight away.",
      key: true,
    },
    {
      id: "sqa-results",
      iso: "2026-08-04T07:00:00Z",
      label: "SQA results (Scotland)",
      detail:
        "Scottish Qualifications Authority results are released. Scottish applicants can enter Clearing from this date.",
      key: true,
    },
    {
      id: "a-level-results",
      iso: "2026-08-13T07:00:00Z",
      label: "A-level results day",
      detail:
        "A-level, BTEC and T-level results are released. Grades appear in the UCAS Hub from 8am.",
      key: true,
    },
    {
      id: "clearing-choices-open",
      iso: "2026-08-13T12:00:00Z",
      label: "Clearing choices open",
      detail:
        "You can add a Clearing choice in the UCAS Hub from 1pm on results day — but only after a university has verbally offered you a place.",
      key: true,
    },
    {
      id: "clearing-closes",
      iso: "2026-10-19T22:59:00Z",
      label: "Clearing closes",
      detail:
        "The last date to add a Clearing choice. Most courses fill long before this — the vast majority of places go in the first week.",
      key: true,
    },
  ],
};

/** Milestone lookup by id. Throws loudly rather than silently returning undefined. */
export function getClearingDate(id: string): ClearingDate {
  const found = CLEARING_CYCLE.dates.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Unknown Clearing milestone: ${id}`);
  }
  return found;
}

const MS_PER_DAY = 86_400_000;

/**
 * Whole days from `now` until `target`, rounded up so that "any part of today
 * remaining" still reads as 1 day rather than 0.
 */
export function daysUntil(targetIso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(targetIso).getTime() - now.getTime()) / MS_PER_DAY);
}

export interface ClearingStatus {
  phase: ClearingPhaseId;
  /** Milestone the site should currently be counting down to, if any. */
  focus: ClearingDate | null;
  daysToFocus: number | null;
  /** Headline/eyebrow copy appropriate to the phase. */
  eyebrow: string;
  headline: string;
  standfirst: string;
  /** True once results are out and the phones are ringing. */
  isLive: boolean;
}

/**
 * Derive the whole Clearing narrative from the calendar.
 *
 * Results week is treated as the window from the first results release (SQA)
 * through seven days after A-level results day — that is when demand, and the
 * urgency of the copy, is at its peak.
 */
export function getClearingStatus(now: Date = new Date()): ClearingStatus {
  const opens = getClearingDate("clearing-opens");
  const sqa = getClearingDate("sqa-results");
  const aLevel = getClearingDate("a-level-results");
  const closes = getClearingDate("clearing-closes");

  const t = now.getTime();
  const tOpens = new Date(opens.iso).getTime();
  const tSqa = new Date(sqa.iso).getTime();
  const tALevel = new Date(aLevel.iso).getTime();
  const tCloses = new Date(closes.iso).getTime();
  const resultsWeekEnds = tALevel + 7 * MS_PER_DAY;

  const { year } = CLEARING_CYCLE;

  if (t < tOpens) {
    return {
      phase: "pre-clearing",
      focus: opens,
      daysToFocus: daysUntil(opens.iso, now),
      eyebrow: `Clearing ${year}`,
      headline: `Clearing ${year} opens soon`,
      standfirst: `Get ahead: research the ${year} courses and universities you would call on results day, before everyone else does.`,
      isLive: false,
    };
  }

  if (t < tSqa) {
    return {
      phase: "clearing-open",
      focus: aLevel,
      daysToFocus: daysUntil(aLevel.iso, now),
      eyebrow: `Clearing ${year} is open`,
      headline: `Clearing ${year} is open`,
      standfirst: `Results day is coming. Shortlist your universities now so you are calling, not searching, the moment your grades land.`,
      isLive: false,
    };
  }

  if (t < resultsWeekEnds) {
    // SQA results are out; A-level results are imminent or just landed.
    const beforeALevel = t < tALevel;
    return {
      phase: "results-week",
      focus: beforeALevel ? aLevel : closes,
      daysToFocus: beforeALevel ? daysUntil(aLevel.iso, now) : null,
      eyebrow: `Clearing ${year} — live`,
      headline: beforeALevel
        ? `Results day is almost here`
        : `Clearing ${year} is live`,
      standfirst: beforeALevel
        ? `Scottish results are out and A-level results follow shortly. Have your shortlist, your grades and your phone ready.`
        : `Places are moving now. Call universities directly — the best courses go in the first 48 hours.`,
      isLive: true,
    };
  }

  if (t < tCloses) {
    return {
      phase: "clearing-late",
      focus: closes,
      daysToFocus: daysUntil(closes.iso, now),
      eyebrow: `Clearing ${year} is open`,
      headline: `There are still places in Clearing`,
      standfirst: `The results-day rush is over, but courses remain. Fewer callers means more time to talk to admissions teams properly.`,
      isLive: true,
    };
  }

  return {
    phase: "closed",
    focus: null,
    daysToFocus: null,
    eyebrow: `Clearing ${year}`,
    headline: `Clearing ${year} has closed`,
    standfirst: `Clearing for ${year} entry is over. Start planning your ${year + 1} application — research now, apply early.`,
    isLive: false,
  };
}

/** Milestones still ahead, soonest first. */
export function getUpcomingDates(now: Date = new Date()): ClearingDate[] {
  return CLEARING_CYCLE.dates
    .filter((d) => new Date(d.iso).getTime() > now.getTime())
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

/** All key milestones with a passed/upcoming flag, in calendar order. */
export function getTimeline(
  now: Date = new Date()
): Array<ClearingDate & { passed: boolean }> {
  return CLEARING_CYCLE.dates
    .filter((d) => d.key)
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map((d) => ({ ...d, passed: new Date(d.iso).getTime() <= now.getTime() }));
}

/**
 * The three situations students actually arrive in on results day. Ordered by
 * how much help each one needs, not by how common it is.
 */
export interface ClearingScenario {
  id: string;
  situation: string;
  summary: string;
  steps: string[];
  href: string;
}

export const CLEARING_SCENARIOS: ClearingScenario[] = [
  {
    id: "missed-grades",
    situation: "You missed your grades",
    summary:
      "Your firm and insurance choices both rejected you. This is what Clearing exists for, and it is not a downgrade — good courses at good universities appear every year.",
    steps: [
      "Check the UCAS Hub — your firm choice may still accept you, or offer an alternative course",
      "If both choices are gone, your Hub will show 'You are in Clearing'",
      "Search courses and write a shortlist of five to ten, with phone numbers",
      "Call them yourself — universities want to hear from the applicant, not a parent",
      "Once a university verbally offers you a place, add it as your Clearing choice in the Hub",
    ],
    href: "/clearing/missed-grades",
  },
  {
    id: "no-offers",
    situation: "You applied but hold no offers",
    summary:
      "You were unsuccessful with all your choices, or declined them. You can use Clearing regardless of your grades.",
    steps: [
      "Confirm your Clearing number in the UCAS Hub",
      "Be open about subject — related courses often have more availability",
      "Ask admissions what they would accept, rather than assuming you fall short",
      "Consider foundation years, which frequently have places when the main course does not",
      "Add your Clearing choice once you have a verbal offer",
    ],
    href: "/clearing/how-it-works",
  },
  {
    id: "better-grades",
    situation: "You did better than expected",
    summary:
      "You beat the conditions of your firm offer. You are not obliged to stay where you are — you can look for a course with higher entry requirements.",
    steps: [
      "Your firm place is already secure — you keep it while you look",
      "Contact universities you would prefer and ask whether they can take you",
      "Only release yourself from your firm choice once another university has confirmed in writing",
      "Nothing changes until you actively make the swap",
    ],
    href: "/clearing/better-than-expected",
  },
];
