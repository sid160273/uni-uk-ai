"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQSchema } from "./StructuredData";
import type { FAQItem } from "@/data/faq-data";

// Re-export FAQItem type and data functions for convenience
export type { FAQItem } from "@/data/faq-data";
export {
  universityFAQs,
  academicRankingFAQs,
  sportsRankingFAQs,
  satisfactionRankingFAQs,
} from "@/data/faq-data";

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ item, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-base pr-4">{item.question}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

interface FAQProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQ({ faqs, title = "Frequently Asked Questions", className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("py-8", className)}>
      <FAQSchema faqs={faqs} />
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="bg-card border rounded-xl p-6">
        {faqs.map((faq, index) => (
          <FAQAccordionItem
            key={index}
            item={faq}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}
