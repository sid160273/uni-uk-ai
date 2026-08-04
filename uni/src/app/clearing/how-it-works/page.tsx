import type { Metadata } from "next";
import { ClearingGuideLayout } from "@/components/ClearingGuideLayout";
import { FAQSchema } from "@/components/StructuredData";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `How UCAS Clearing Works ${YEAR}: The Process, Step by Step`,
  description: `How Clearing actually works in ${YEAR} — finding vacancies, phoning universities, getting a verbal offer, and adding your Clearing choice in the UCAS Hub.`,
  keywords: [
    "how does clearing work",
    "ucas clearing process",
    "clearing step by step",
    "clearing number",
    "clearing choice",
  ],
  alternates: { canonical: "/clearing/how-it-works" },
};

const STEPS = [
  {
    title: "Check your status in the UCAS Hub",
    body: "On results day your Hub updates before you have spoken to anyone. It will either confirm a place, or tell you that you are in Clearing and show your Clearing number. Read it carefully — sometimes a university accepts you despite a dropped grade, or offers you a different course at the same institution.",
  },
  {
    title: "Build a shortlist before you dial",
    body: "Write down five to ten courses you would genuinely accept, with the university's Clearing phone number next to each. Order them by preference. This is the single biggest difference between a calm results day and a panicked one — the students who struggle are the ones searching and calling at the same time.",
  },
  {
    title: "Phone the universities yourself",
    body: "Call in your order of preference. Have your UCAS ID, Clearing number and full results in front of you, including GCSEs. Universities generally need to speak to the applicant rather than a parent. Expect a short interview about why you want the course — treat it as one.",
  },
  {
    title: "Collect verbal offers",
    body: "A university that wants you will make a verbal offer on the phone. Nothing is binding at this point, and you are allowed to hold several verbal offers at once while you decide. Ask each one how long they will hold it for.",
  },
  {
    title: "Add one Clearing choice in the Hub",
    body: "Once you have decided, enter that university as your Clearing choice. You can only hold one at a time. The university then confirms — or, occasionally, declines, in which case you can add another. On A-level results day the Hub does not accept Clearing choices until 1pm, even though grades appear at 8am.",
  },
  {
    title: "Sort accommodation immediately",
    body: "Once your place is confirmed, contact the accommodation office the same day. Clearing students are usually still eligible for university halls, but rooms go quickly and this is the part people forget in the relief of having a place.",
  },
];

const FAQS = [
  {
    question: "What is a Clearing number?",
    answer:
      "A Clearing number is the reference the UCAS Hub gives you once you are eligible for Clearing. Universities ask for it, along with your UCAS Personal ID, when you call. It appears in your Hub automatically — you do not have to request it.",
  },
  {
    question: "Can I hold more than one Clearing offer?",
    answer:
      "You can hold as many verbal offers as you can collect over the phone, but you can only enter one Clearing choice in the UCAS Hub at a time. If that university declines you, you are free to add another.",
  },
  {
    question: "How long does a university hold a Clearing offer?",
    answer:
      "It varies and it is not formally guaranteed — usually anywhere from a few hours to a couple of days. Ask directly on the call, and do not assume an offer will still be there tomorrow during the results-day rush.",
  },
];

export default function HowClearingWorksPage() {
  return (
    <>
      <FAQSchema faqs={FAQS} />
      <ClearingGuideLayout
        href="/clearing/how-it-works"
        title="How Clearing actually works"
        standfirst="Clearing is a phone process with an online confirmation step at the end — not an online application. Understanding that order is most of the battle."
      >
        <p>
          Most guides describe Clearing as though it were a form you fill in. It
          is not. Universities decide over the phone, and the UCAS Hub only
          records the decision afterwards. Six steps, in this order:
        </p>

        <ol className="not-prose space-y-6 my-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-l-2 border-foreground pl-5">
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <h2 className="font-display text-2xl font-bold leading-tight">
                  {step.title}
                </h2>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="font-display text-3xl font-bold pt-4">
          What universities ask on the call
        </h2>
        <p>
          The call is short — often under ten minutes — and usually covers your
          grades subject by subject, why you want that course, and whether you
          have any relevant experience. They are checking that you understand
          what you are applying for. A one-line answer to &ldquo;why this
          course?&rdquo; is the thing most likely to lose you an offer.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          Where people go wrong
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Letting a parent make the call. Most admissions teams will ask to
            speak to the applicant and you lose your place in the queue.
          </li>
          <li>
            Ruling themselves out. Clearing entry requirements are frequently
            below the published standard offer. Ask, rather than assuming.
          </li>
          <li>
            Accepting the first offer out of relief, before calling the two
            universities they actually wanted.
          </li>
          <li>
            Forgetting accommodation until the following week.
          </li>
        </ul>

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
