import { BookOpen, ChevronRight, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: BookOpen,
    label: "Read",
    description: "Open any article, memo, or PDF. Linaw quietly reads it with you.",
  },
  {
    icon: SlidersHorizontal,
    label: "Adapt",
    description: "Switch to Key Points, Plain Language, or Listen in one tap.",
  },
  {
    icon: ShieldCheck,
    label: "Verify",
    description: "Every condition, number, and deadline is checked against the source.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="px-5 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="how-title"
          eyebrow="How the web app works"
          title="Three steps, zero guesswork."
          description="Choose preferences, adapt a notice, then review Meaning Check. The original stays one step away."
        />
        <ol className="mt-12 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.label} delay={i * 80} className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-paper-raised">
                  <step.icon className="size-5 text-action" strokeWidth={1.75} aria-hidden="true" />
                </span>
                {i < STEPS.length - 1 ? (
                  <span aria-hidden="true" className="hidden flex-1 items-center gap-1 md:flex">
                    <span className="h-px flex-1 bg-border" />
                    <ChevronRight className="size-4 text-ink-subtle" />
                  </span>
                ) : null}
              </div>
              <div>
                <h3 className="font-reading text-lg font-semibold text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.label}
                </h3>
                <p className="font-ui mt-1 max-w-xs leading-relaxed text-pretty text-ink-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
