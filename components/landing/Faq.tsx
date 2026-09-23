"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const FAQS = [
  {
    q: "How does Linaw know something important was lost?",
    a: "Before adapting, Linaw extracts the load-bearing parts of the source — conditions, quantities, deadlines, negations, and who-does-what. Every adapted view is then checked against that list, and anything missing or changed is flagged with the original phrase.",
  },
  {
    q: "Do I have to tell anyone I need help reading?",
    a: "No. There is no diagnosis, no special mode, and no profile question. Linaw is designed so anyone can use it for any reason — tired eyes, a second language, or just a long memo.",
  },
  {
    q: "What does Taglish-aware mean?",
    a: "Plain Language can be written in English, Tagalog, or the natural mix most Filipinos actually use day to day, while keeping technical terms like “written approval” intact so nothing gets mistranslated.",
  },
  {
    q: "Does it work on school or office computers?",
    a: "Yes. If your device blocks extensions, the web app gives you the same views and verification — set your preferences in onboarding, then read in the workspace.",
  },
  {
    q: "Is Linaw free?",
    a: "The companion and web app are free during the beta. Core reading features will always have a free tier.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.q ?? null);

  return (
    <section aria-labelledby="faq-title" className="border-t border-border px-5 py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr]">
        <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered plainly." />
        <div className="font-ui flex w-full flex-col">
          {FAQS.map((item) => {
            const isOpen = open === item.q;
            return (
              <div key={item.q} className="border-b border-border last:border-b-0">
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : item.q)}
                    className="flex w-full items-center justify-between gap-4 rounded-lg py-5 text-left text-base font-medium text-ink"
                  >
                    {item.q}
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-ink-muted transition-transform", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                {isOpen ? (
                  <div className="flag-panel pb-5 text-base leading-relaxed text-ink-muted">
                    <p className="m-0">{item.a}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
