import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";

import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { ClearingCountdown } from "@/components/ClearingCountdown";
import { ClearingAdviser } from "@/components/ClearingAdviser";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { BreadcrumbSchema, FAQSchema } from "@/components/StructuredData";
import {
  CLEARING_CYCLE,
  CLEARING_SCENARIOS,
  getClearingStatus,
  getTimeline,
} from "@/lib/clearing";
import { getAllUniversities } from "@/lib/data";

export const dynamic = "force-dynamic";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `UCAS Clearing ${YEAR}: Dates, How It Works and What To Do`,
  description: `Everything you need for Clearing ${YEAR}: key dates, how Clearing actually works, what to do if you missed your grades or did better than expected, and 140 UK universities to search.`,
  keywords: [
    `clearing ${YEAR}`,
    "ucas clearing",
    "clearing process",
    "clearing dates",
    "how does clearing work",
    "clearing university places",
  ],
  alternates: { canonical: "/clearing" },
  openGraph: {
    title: `UCAS Clearing ${YEAR}: Dates, How It Works and What To Do`,
    description: `Key dates, the real process, and 140 UK universities to search.`,
    type: "article",
    url: "https://uni-uk.ai/clearing",
    siteName: "uni-uk.ai",
  },
};

const FAQS = [
  {
    question: "What is Clearing?",
    answer:
      "Clearing is how UCAS matches applicants who do not hold a confirmed place with universities that still have course vacancies. You contact universities directly, they make you a verbal offer over the phone, and you then add that university as your Clearing choice in the UCAS Hub.",
  },
  {
    question: "Am I eligible for Clearing?",
    answer:
      "You can use Clearing if you applied through UCAS and hold no confirmed place — because you missed the conditions of your offers, declined your offers, applied after 30 June, or were unsuccessful with all your choices. You can also enter Clearing by releasing yourself from a firm place you no longer want.",
  },
  {
    question: `When does Clearing ${YEAR} open and close?`,
    answer: `Clearing ${YEAR} opened on 2 July ${YEAR} and closes on 19 October ${YEAR}. Scottish SQA results are released on 4 August ${YEAR} and A-level results on 13 August ${YEAR}. Most Clearing places are taken in the first few days after A-level results day.`,
  },
  {
    question: "Do I call the university or apply online?",
    answer:
      "You call. Universities give Clearing offers verbally over the phone, and only once you have that verbal offer do you add them as your Clearing choice in the UCAS Hub. Some universities also run online Clearing forms, but a phone call is still the fastest route on results day.",
  },
  {
    question: "How many Clearing choices can I hold?",
    answer:
      "One at a time. You can call as many universities as you like and collect several verbal offers, but you can only add one Clearing choice in the Hub. If that university declines you, you can add another.",
  },
  {
    question: "Can I use Clearing if I did better than expected?",
    answer:
      "Yes. UCAS Adjustment no longer exists — it was withdrawn after 2021. If you exceed your offer and want a different university, you self-release into Clearing. Crucially, you keep your existing firm place until you release yourself, so secure a written confirmation from the new university first.",
  },
  {
    question: "Are Clearing courses worse than the ones advertised earlier?",
    answer:
      "No. Clearing vacancies exist because of how offers and acceptances happen to fall in a given year, not because a course is weak. Russell Group universities routinely appear in Clearing. Entry requirements in Clearing are often lower than the standard published offer.",
  },
  {
    question: "What should I have ready before I call?",
    answer:
      "Your UCAS ID and Clearing number, your actual results including GCSEs, your personal statement, a pen and paper, and a shortlist of courses with their phone numbers. Call yourself rather than asking a parent to — universities usually need to speak to the applicant directly.",
  },
  {
    question: "Can international students use Clearing?",
    answer:
      "Yes. International students can apply through Clearing on the same basis, though you should factor in visa processing time before term starts and check that the university can issue a CAS in time.",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default function ClearingHubPage() {
  const now = new Date();
  const status = getClearingStatus(now);
  const timeline = getTimeline(now);
  const total = getAllUniversities().length;

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uni-uk.ai" },
          { name: `Clearing ${YEAR}`, url: "https://uni-uk.ai/clearing" },
        ]}
      />
      <FAQSchema faqs={FAQS} />
      <MainNavigation />

      {status.focus && status.daysToFocus !== null && (
        <ClearingCountdown
          targetIso={status.focus.iso}
          label={`${status.focus.label} — ${formatDate(status.focus.iso)}`}
          initialNow={now.getTime()}
          href="/clearing/key-dates"
        />
      )}

      {/* Hero */}
      <section className="border-b border-border py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
            {status.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.96] mb-4">
            UCAS Clearing {YEAR}
          </h1>
          <p className="font-body-serif text-lg md:text-xl text-muted-foreground">
            {status.standfirst} This page covers the dates, the process as it
            actually works, and what to do in each of the three situations
            students arrive in.
          </p>
        </div>
      </section>

      {/* Scenarios with steps */}
      <section className="border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-8">
            Find your situation
          </h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {CLEARING_SCENARIOS.map((scenario, i) => (
              <div key={scenario.id} className="border border-border p-6">
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <h3 className="font-display text-2xl font-bold leading-tight mt-2 mb-3">
                  {scenario.situation}
                </h3>
                <p className="font-body-serif text-sm text-muted-foreground leading-relaxed mb-5">
                  {scenario.summary}
                </p>
                <ol className="space-y-2.5 mb-5">
                  {scenario.steps.map((step, s) => (
                    <li key={s} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                        {s + 1}
                      </span>
                      <span className="font-body-serif leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  href={scenario.href}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-editorial hover:text-destructive transition-colors"
                >
                  Read the full guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adviser + dates */}
      <section id="adviser" className="border-b border-border py-12">
        <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-6">
              Ask the Clearing adviser
            </h2>
            <ClearingAdviser />
          </div>

          <aside className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-4">
                Key dates {YEAR}
              </h2>
              <ol>
                {timeline.map((date) => (
                  <li
                    key={date.id}
                    className="py-3 border-b border-border last:border-0"
                  >
                    <div className="flex gap-4 items-baseline">
                      <span
                        className={`font-mono text-xs whitespace-nowrap ${
                          date.passed
                            ? "text-muted-foreground line-through"
                            : "text-destructive font-bold"
                        }`}
                      >
                        {formatDate(date.iso)}
                      </span>
                      <span
                        className={`text-sm ${date.passed ? "text-muted-foreground" : "font-semibold"}`}
                      >
                        {date.label}
                      </span>
                    </div>
                    <p className="font-body-serif text-xs text-muted-foreground mt-1.5">
                      {date.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                <h3 className="text-[11px] font-bold uppercase tracking-editorial">
                  UCAS customer service
                </h3>
              </div>
              <a
                href="tel:03714680468"
                className="font-display text-2xl font-bold hover:text-destructive transition-colors"
              >
                0371 468 0468
              </a>
              <p className="font-body-serif text-sm text-muted-foreground mt-2">
                For questions about the Hub itself — your Clearing number, your
                application status, or adding a choice.
              </p>
            </div>

            <AdPlaceholder id="clearing-hub-sidebar" format="rectangle" />
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-[11px] font-bold uppercase tracking-editorial border-b-2 border-foreground pb-1.5 mb-6">
            Clearing questions, answered
          </h2>
          <div className="divide-y divide-border">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5">
                <h3 className="font-display text-xl font-bold mb-2">
                  {faq.question}
                </h3>
                <p className="font-body-serif text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 border border-border p-6">
            <h2 className="font-display text-2xl font-bold mb-3">
              Start your shortlist
            </h2>
            <p className="font-body-serif text-muted-foreground mb-5">
              {total} UK universities, with entry requirements, rankings, cost of
              living and student satisfaction for each.
            </p>
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
            >
              Search universities
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
