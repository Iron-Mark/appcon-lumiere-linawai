"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type FaqItem = {
  q: string;
  a: string;
  /** Flat one-line scan chips — never nested cards. */
  checks?: readonly string[];
};

const FAQS: readonly FaqItem[] = [
  {
    q: "How does Linaw know something important was lost?",
    a: "Before adapting, Linaw lists the load-bearing parts of the source. Anything missing or changed is flagged with the original phrase.",
    checks: ["Conditions", "Quantities", "Deadlines", "Negations", "Who-does-what"],
  },
  {
    q: "Do I have to tell anyone I need help reading?",
    a: "No. There is no diagnosis, no special mode, and no profile question—anyone can use Linaw for tired eyes, a second language, or a long memo.",
  },
  {
    q: "What does Taglish-aware mean?",
    a: "Plain Language can be English, Tagalog, or the everyday mix most Filipinos use, while keeping terms like “written approval” intact.",
  },
  {
    q: "Does it work on school or office computers?",
    a: "Yes. If extensions are blocked, the web app still gives the same views and verification—set preferences in onboarding, then read in the workspace.",
  },
  {
    q: "How do I install the Chrome companion?",
    a: "Download the ZIP from Get started, unzip it, then in Chrome go to Extensions → Manage Extensions, turn on Developer mode, and Load unpacked.",
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
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start md:gap-16">
        <div className="md:sticky md:top-28">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="Still wondering?"
            description="Short answers. If something’s missing, jump in and try it."
          />
          <Reveal delay={80} className="font-ui mt-6 flex flex-col gap-2 text-base text-ink-muted">
            <Link href="/onboarding" className="landing-inline-link w-fit">
              Open Linaw
            </Link>
            <a href="#try-it" className="landing-inline-link w-fit">
              Try the live demo
            </a>
          </Reveal>
        </div>

        <div className="font-ui w-full">
          {FAQS.map((item, index) => {
            const isOpen = open === item.q;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <Reveal
                key={item.q}
                delay={Math.min(index * 40, 160)}
                className="faq-row border-b border-border first:border-t"
              >
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : item.q)}
                    className="faq-trigger group flex min-h-11 w-full cursor-pointer items-start justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    <span
                      className={cn(
                        "pt-0.5 text-base font-medium leading-snug text-ink transition-colors duration-[var(--motion-fast)]",
                        isOpen && "text-action",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "faq-icon mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-[var(--motion-fast)]",
                        "group-hover:bg-action-soft group-hover:text-action",
                        isOpen && "bg-action-soft text-action",
                      )}
                    >
                      {isOpen ? (
                        <Minus className="size-4" strokeWidth={2} />
                      ) : (
                        <Plus className="size-4" strokeWidth={2} />
                      )}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  data-open={isOpen ? "true" : "false"}
                  className="faq-panel"
                  inert={!isOpen ? true : undefined}
                >
                  <div className="faq-panel-inner">
                    <div className="pb-5 pr-10">
                      <p className="m-0 text-base leading-relaxed text-pretty text-ink-muted">
                        {item.a}
                      </p>
                      {item.checks ? (
                        <p className="faq-checks m-0 mt-3 flex flex-wrap gap-y-1 text-xs tracking-wide text-ink-subtle uppercase">
                          <span className="sr-only">What it checks: </span>
                          {item.checks.map((check) => (
                            <span key={check} className="faq-check">
                              {check}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
