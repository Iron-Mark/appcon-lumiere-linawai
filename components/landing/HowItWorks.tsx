import { ChevronRight } from "lucide-react";
import {
  KeyPoints,
  MeaningCheck,
  NoticeSheet,
} from "@/components/illustrations";
import { Sindi, SunMark, type SindiState } from "@/components/sindi";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS: {
  state: SindiState;
  label: string;
  description: string;
  art: typeof NoticeSheet;
}[] = [
  {
    state: "reading",
    label: "Read",
    description:
      "Open any article, memo, or PDF. Linaw quietly reads it with you.",
    art: NoticeSheet,
  },
  {
    state: "working",
    label: "Adapt",
    description: "Switch to Key Points, Plain Language, or Listen in one tap.",
    art: KeyPoints,
  },
  {
    state: "pass",
    label: "Verify",
    description:
      "Every condition, number, and deadline is checked against the source.",
    art: MeaningCheck,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="landing-section"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="pointer-events-none absolute top-[-0.5rem] right-0 hidden md:block">
          <SunMark className="size-36 opacity-40" />
        </Reveal>
        <SectionHeading
          id="how-title"
          eyebrow="How the web app works"
          title="Three steps, zero guesswork."
          description="Choose preferences, adapt a notice, then review Meaning Check. The original stays one step away."
        />
        <ol className="mt-8 grid list-none gap-0 divide-y divide-border p-0 md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.label}
              delay={i * 80}
              className="relative flex flex-col gap-4 py-6 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="font-reading text-3xl font-semibold tabular-nums leading-none text-ink-subtle"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Sindi state={step.state} line="" size={44} />
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 right-0 z-10 hidden size-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-paper md:flex"
                  >
                    <ChevronRight className="size-4 text-ink-subtle" />
                  </span>
                ) : null}
              </div>
              <div>
                <h3 className="font-reading m-0 text-lg font-semibold text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.label}
                </h3>
                <p className="font-ui mt-2 leading-relaxed text-pretty text-ink-muted">
                  {step.description}
                </p>
                <step.art className="mt-4 h-24 w-40" />
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
