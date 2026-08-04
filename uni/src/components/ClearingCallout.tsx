import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

import { getClearingStatus, CLEARING_CYCLE } from "@/lib/clearing";

interface ClearingCalloutProps {
  /** Name of the university the reader is currently looking at, if any. */
  universityName?: string;
  className?: string;
}

/**
 * Turns a browsing moment into a calling moment. Copy shifts with the cycle —
 * before results day it is about shortlisting, during Clearing it is about
 * picking up the phone.
 */
export function ClearingCallout({
  universityName,
  className = "",
}: ClearingCalloutProps) {
  const status = getClearingStatus();

  const heading = universityName
    ? status.isLive
      ? `Is ${universityName} in Clearing?`
      : `Thinking about ${universityName} in Clearing ${CLEARING_CYCLE.year}?`
    : `Clearing ${CLEARING_CYCLE.year}`;

  const body = status.isLive
    ? "Vacancies change hour by hour and are never listed here in real time — check the university's own Clearing page, then call them. Our guides cover what to say and what they will ask."
    : "Course vacancies are not published until Clearing opens properly. Use the time now to shortlist, so that on results day you are calling rather than searching.";

  return (
    <aside
      className={`border border-border p-6 ${className}`}
      aria-label={`Clearing ${CLEARING_CYCLE.year} guidance`}
    >
      <p className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-2">
        {status.eyebrow}
      </p>
      <h2 className="font-display text-2xl font-bold mb-2">{heading}</h2>
      <p className="font-body-serif text-muted-foreground mb-5">{body}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/clearing"
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:opacity-90 transition-opacity"
        >
          Clearing guide
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/clearing#adviser"
          className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-editorial hover:bg-muted transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          What are my options?
        </Link>
      </div>
    </aside>
  );
}
