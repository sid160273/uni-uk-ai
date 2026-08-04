import type { Metadata } from "next";
import { ClearingGuideLayout } from "@/components/ClearingGuideLayout";
import { FAQSchema } from "@/components/StructuredData";
import { CLEARING_CYCLE } from "@/lib/clearing";

const YEAR = CLEARING_CYCLE.year;

export const metadata: Metadata = {
  title: `Missed Your Grades? What To Do on Results Day ${YEAR}`,
  description: `Missed the conditions of your offer in ${YEAR}? Here is exactly what to do, in order — check the Hub, call your firm choice, work your Clearing shortlist, and secure a place.`,
  keywords: [
    "missed my grades",
    "missed offer conditions",
    "results day help",
    "clearing missed grades",
    "didn't get into university",
    "remark a level",
  ],
  alternates: { canonical: "/clearing/missed-grades" },
};

const FAQS = [
  {
    question: "I missed my grades by one mark. Will my firm choice still take me?",
    answer:
      "Often, yes. Universities routinely confirm places for applicants who narrowly miss, especially where the course is not oversubscribed. Check the UCAS Hub first — many near-misses are already confirmed there before you have spoken to anyone. If it shows unsuccessful, call the university and ask directly.",
  },
  {
    question: "Should I ask for a remark before entering Clearing?",
    answer:
      "Do both at once. A remark can take weeks and Clearing places go in days, so secure a place through Clearing while the remark is in progress. If the remark comes back higher, you can then approach your original university again — though they are not obliged to hold anything for you.",
  },
  {
    question: "Is a Clearing place worth less than a normal offer?",
    answer:
      "No. The degree is identical, and vacancies arise from how offers happen to fall in a given year rather than from course quality. Russell Group universities appear in Clearing most years.",
  },
  {
    question: "What if I do not want to go anywhere in Clearing?",
    answer:
      "That is a legitimate choice. You can take a year out and reapply in the next cycle with your grades already achieved, which strengthens your application. Resitting, an apprenticeship, or a foundation year are all reasonable routes too.",
  },
];

export default function MissedGradesPage() {
  return (
    <>
      <FAQSchema faqs={FAQS} />
      <ClearingGuideLayout
        href="/clearing/missed-grades"
        title="You missed your grades"
        standfirst="This is the situation Clearing was built for. It is a normal route into a good degree, taken by tens of thousands of students every year — and today is recoverable."
      >
        <p>
          First: do not make any decisions in the first ten minutes. The single
          most common mistake on results day is acting on the assumption that
          your place is gone before checking whether it actually is.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          Do these four things, in this order
        </h2>

        <h3 className="font-display text-xl font-bold">
          1. Check the UCAS Hub before you call anyone
        </h3>
        <p>
          Your Hub updates on results-day morning independently of your grades.
          A dropped grade does not automatically mean rejection — universities
          confirm near-misses all the time, and your Hub may already show your
          place as confirmed. It may also show an alternative course offer at
          the same university.
        </p>

        <h3 className="font-display text-xl font-bold">
          2. If it says unsuccessful, ring your firm choice anyway
        </h3>
        <p>
          Ask two questions: whether they will still consider you, and whether
          they have a related course they would accept you onto. Departments
          have discretion, and a direct, polite call from the applicant
          occasionally changes the answer. Do this before you start on Clearing
          — it takes five minutes and it is the highest-value call you will make.
        </p>

        <h3 className="font-display text-xl font-bold">
          3. Then your insurance choice
        </h3>
        <p>
          If your firm is definitely gone, your insurance may confirm
          automatically. If it does not, the same call applies.
        </p>

        <h3 className="font-display text-xl font-bold">
          4. Work a Clearing shortlist
        </h3>
        <p>
          Now open Clearing properly. Write down five to ten courses with phone
          numbers, ordered by preference, and call them in order. Be flexible
          about the exact course title — a related degree at a university you
          like usually beats the original title at one you do not.
        </p>

        <h2 className="font-display text-3xl font-bold pt-4">
          Widen the search deliberately
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Adjacent subjects.</strong> Biomedical science instead of
            medicine, business economics instead of economics. The first year
            often overlaps heavily and internal transfers are sometimes possible.
          </li>
          <li>
            <strong>Foundation years.</strong> A four-year degree with an
            integrated foundation year frequently has places when the three-year
            version does not, and the entry requirements are lower.
          </li>
          <li>
            <strong>Different regions.</strong> Demand is uneven across the UK.
            Courses that are full in London may be open in the North East or
            Wales, and your cost of living drops substantially.
          </li>
          <li>
            <strong>Joint honours.</strong> Combining your subject with a less
            oversubscribed one opens up places.
          </li>
        </ul>

        <h2 className="font-display text-3xl font-bold pt-4">
          What to say on the phone
        </h2>
        <p>
          Give your name, UCAS ID and Clearing number, then your grades subject
          by subject. Say which course you are calling about and give one real
          reason you want it. If they say the course is full, ask what else they
          have in the same department — that question alone finds a lot of
          places.
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
