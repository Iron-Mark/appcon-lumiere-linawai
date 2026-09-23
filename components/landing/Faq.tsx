"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const FAQS = [
  {
    q: "How does Linaw know something important was lost?",
    a: "Before adapting, Linaw extracts the load-bearing parts of the source: conditions, quantities, deadlines, negations, and who-does-what. Every adapted view is then checked against that list, and anything missing or changed is flagged with the original phrase.",
  },
  {
    q: "Do I have to tell anyone I need help reading?",
    a: "No. There is no diagnosis, no special mode, and no profile question. Linaw is designed so anyone can use it for any reason: tired eyes, a second language, or just a long memo.",
  },
  {
    q: "What does Taglish-aware mean?",
    a: "Plain Language can be written in English, Tagalog, or the natural mix most Filipinos actually use day to day, while keeping technical terms like “written approval” intact so nothing gets mistranslated.",
  },
  {
    q: "Does it work on school or office computers?",
    a: "Yes. If your device blocks extensions, the web app gives you the same views and verification. Set your preferences in onboarding, then read in the workspace.",
  },
  {
    q: "How do I install the Chrome companion?",
    a: "Download linaw-chrome-extension.zip from the Get started section, unzip it, then in Chrome go to Extensions → Manage Extensions, turn on Developer mode, and choose Load unpacked with the extracted folder.",
  },
  {
    q: "Is Linaw free?",
    a: "The companion and web app are free during the beta. Core reading features will always have a free tier.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.q ?? null);
  const baseId = useId();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="landing-section landing-section--inset"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered plainly."
          description={
            <>
              Can&apos;t find what you need?{" "}
              <Link href="/onboarding" className="landing-inline-link">
                Open Linaw
              </Link>{" "}
              or{" "}
              <a href="#get-started" className="landing-inline-link">
                get started
              </a>{" "}
              with the web app or Chrome companion.
            </>
          }
        />
        <div className="font-ui w-full overflow-hidden rounded-xl border border-border bg-paper-raised shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]">
          {FAQS.map((item, index) => {
            const isOpen = open === item.q;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div key={item.q} className="border-b border-border last:border-b-0">
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : item.q)}
                    className={cn(
                      "flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
                      isOpen && "bg-paper-inset/40",
                    )}
                  >
                    {item.q}
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-ink-muted transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <div className="flag-panel px-5 pb-5 text-base leading-relaxed text-ink-muted">
                    <p className="m-0">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
