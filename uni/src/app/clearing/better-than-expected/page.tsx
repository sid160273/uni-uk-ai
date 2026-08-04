import type { Metadata } from "next";
import { ClearingGuideLayout } from "@/components/ClearingGuideLayout";
import { FAQSchema } from "@/components/StructuredData";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Did Better Than Expected? Trading Up in Clearing ${YEAR}`,
  description: `Beat your offer in ${YEAR}? UCAS Adjustment no longer exists — here is how self-release into Clearing works, and how to trade up without losing the place you already have.`,
  keywords: [
    "did better than expected a levels",
    "ucas adjustment",
    "self release into clearing",
    "trade up university",
    "exceeded offer conditions",
  ],
  alternates: { canonical: "/clearing/better-than-expected" },
};

const FAQS = [
  {
    question: "Does UCAS Adjustment still exist?",
    answer:
      "No. Adjustment was withdrawn by UCAS after the 2021 cycle. If you exceed your offer and want to move, you now use self-release into Clearing instead. The outcome is similar but the mechanics differ — critically, self-release gives up your existing place.",
  },
  {
    question: "Do I lose my firm place while I look around?",
    answer:
      "Not while you are only making enquiries. Your firm place stays confirmed until you actively release yourself in the UCAS Hub. Only release once another university has confirmed it will take you — ideally in writing.",
  },
  {
    question: "Can I get my original place back after releasing myself?",
    answer:
      "There is no guarantee. Once you self-release, your original university is under no obligation to take you back, and the place may be given to someone else. Treat release as irreversible.",
  },
  {
    question: "Is it worth moving for a slightly higher-ranked university?",
    answer:
      "Often not. Course content, teaching quality, city, cost of living and graduate outcomes for your specific subject matter more than a few places in a general league table. Move for a genuinely better fit, not for a ranking.",
  },
];

export default function BetterThanExpectedPage() {
  return (
    <>
      <FAQSchema faqs={FAQS} />
      <ClearingGuideLayout
        href="/clearing/better-than-expected"
        title="You did better than expected"
        standfirst="You beat your offer. You are allowed to look elsewhere — but the mechanism changed in 2021, and getting the order of operations wrong is the one way to turn good news into a problem."
      >
        <p>
          <strong>UCAS Adjustment no longer exists.</strong> It was withdrawn
          after the 2021 cycle. If you exceeded your offer and want a different
          university, the route now is <em>self-release into Clearing</em>. The
          difference matters: Adjustment let you hold your place while you
          shopped around, whereas self-release gives it up.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          The one rule that matters
        </h2>
        <p className="border-l-2 border-destructive pl-5 text-lg">
          Do not release yourself until another university has confirmed, in
          writing, that it will accept you. Enquiring costs you nothing.
          Releasing costs you your place.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          How to do it safely
        </h2>

        <h3 className="font-display text-xl font-bold">
          1. Work out what you actually want
        </h3>
        <p>
          Be specific about why the alternative is better — a stronger
          department in your subject, a placement year, a city you would rather
          live in. &ldquo;Higher in the league table&rdquo; is rarely a good
          enough reason to disrupt a confirmed place.
        </p>

        <h3 className="font-display text-xl font-bold">
          2. Call your target universities while still holding your place
        </h3>
        <p>
          Explain that you have exceeded your offer, that you hold a confirmed
          place elsewhere, and that you are considering self-releasing. Ask
          plainly whether they would take you. Admissions teams deal with this
          every year and will tell you straight.
        </p>

        <h3 className="font-display text-xl font-bold">
          3. Get it in writing
        </h3>
        <p>
          Ask for email confirmation before you touch the Hub. A verbal
          &ldquo;we would probably be able to&rdquo; is not a place.
        </p>

        <h3 className="font-display text-xl font-bold">
          4. Only then, self-release
        </h3>
        <p>
          In the UCAS Hub, choose to release yourself into Clearing. You will
          receive a Clearing number, at which point you add the new university
          as your Clearing choice.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          Things people forget
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Accommodation.</strong> Your new university&rsquo;s halls
            may be allocated already. Check availability before releasing, not
            after.
          </li>
          <li>
            <strong>Student finance.</strong> You must update your Student
            Finance application with the new university and course, or your
            first payment can be delayed.
          </li>
          <li>
            <strong>Scholarships.</strong> Any grade-based scholarship attached
            to your original offer does not travel with you.
          </li>
          <li>
            <strong>It is fine to stay.</strong> Exceeding your offer is not an
            obligation to move. Most students who beat their grades stay where
            they are and start the year happy.
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
