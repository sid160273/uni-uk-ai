import type { Metadata } from "next";
import { ClearingGuideLayout } from "@/components/ClearingGuideLayout";
import { FAQSchema } from "@/components/StructuredData";
import { CLEARING_CYCLE, getTimeline, getClearingStatus } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Clearing ${YEAR} Key Dates: Results Days and Deadlines`,
  description: `Every date that matters in Clearing ${YEAR} — when Clearing opens, SQA and A-level results days, when Clearing choices open at 1pm, and the final deadline in October.`,
  keywords: [
    `clearing ${YEAR} dates`,
    `a level results day ${YEAR}`,
    `sqa results day ${YEAR}`,
    "when does clearing close",
    "ucas deadlines",
  ],
  alternates: { canonical: "/clearing/key-dates" },
};

export const dynamic = "force-dynamic";

const FAQS = [
  {
    question: `What time are A-level results released in ${YEAR}?`,
    answer: `A-level results are available in the UCAS Hub from 8am on 13 August ${YEAR}. Schools and colleges usually open earlier for students collecting results in person. Clearing choices cannot be added to the Hub until 1pm the same day.`,
  },
  {
    question: "Why can't I add a Clearing choice until 1pm?",
    answer:
      "UCAS holds Clearing choices until 1pm on A-level results day so that universities have the morning to confirm their existing offer-holders first. The morning is for phone calls; the afternoon is for confirming the outcome in the Hub.",
  },
  {
    question: `When does Clearing ${YEAR} close?`,
    answer: `Clearing closes on 19 October ${YEAR}. In practice most vacancies are gone far earlier — the majority of Clearing places are taken within the first week after A-level results day.`,
  },
  {
    question: "Can I start Clearing before results day?",
    answer: `Yes, if you already hold your results or you have no offers. Clearing opened on 2 July ${YEAR}. Scottish applicants can enter Clearing from SQA results day on 4 August ${YEAR}, ahead of the A-level rush.`,
  },
];

function formatFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

export default function KeyDatesPage() {
  const now = new Date();
  const timeline = getTimeline(now);
  const status = getClearingStatus(now);

  return (
    <>
      <FAQSchema faqs={FAQS} />
      <ClearingGuideLayout
        href="/clearing/key-dates"
        title={`Clearing ${YEAR} key dates`}
        standfirst={`${status.headline}. Every date that matters this cycle, and what actually happens on each one.`}
      >
        <ol className="not-prose space-y-0 my-8">
          {timeline.map((date) => (
            <li
              key={date.id}
              className={`border-l-2 pl-5 py-5 ${
                date.passed ? "border-border" : "border-destructive"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <span
                  className={`font-mono text-sm ${
                    date.passed
                      ? "text-muted-foreground line-through"
                      : "text-destructive font-bold"
                  }`}
                >
                  {formatFull(date.iso)}
                </span>
                {date.passed && (
                  <span className="text-[10px] uppercase tracking-editorial text-muted-foreground border border-border px-1.5 py-0.5">
                    Passed
                  </span>
                )}
              </div>
              <h2
                className={`font-display text-2xl font-bold leading-tight mb-1.5 ${
                  date.passed ? "text-muted-foreground" : ""
                }`}
              >
                {date.label}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {date.detail}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="font-display text-3xl font-bold pt-4">
          How results day itself runs
        </h2>
        <p>
          The timings on A-level results day are fixed and they matter, because
          the gap between them is where places are won:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>From 8am</strong> — your grades and your application status
            appear in the UCAS Hub. Schools open for results in person.
          </li>
          <li>
            <strong>8am to 1pm</strong> — the phone window. Universities confirm
            their existing offer-holders and take Clearing calls. This is when
            you should be calling, not searching.
          </li>
          <li>
            <strong>From 1pm</strong> — you can add a Clearing choice in the
            Hub, but only after a university has verbally offered you a place.
          </li>
        </ul>

        <h2 className="font-display text-3xl font-bold pt-4">
          Scotland runs on a different clock
        </h2>
        <p>
          SQA results land nine days before A-level results this year. Scottish
          applicants therefore enter Clearing before the main rush, when
          admissions lines are quieter and more courses are open. If you are in
          Scotland, that head start is a genuine advantage — use it.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">Common questions</h2>
        {FAQS.map((faq) => (
          <div key={faq.question}>
            <h3 className="font-display text-xl font-bold mb-1.5">
              {faq.question}
            </h3>
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </ClearingGuideLayout>
    </>
  );
}
