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
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="landing-section"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="how-title"
          eyebrow="How the web app works"
          title="Three steps, zero guesswork."
          description="Choose preferences, adapt a notice, then review Meaning Check. The original stays one step away."
        />
        <ol className="mt-12 grid list-none gap-6 p-0 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.label}
              delay={i * 80}
              className="relative flex flex-col gap-4 rounded-xl border border-border bg-paper-raised p-6 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)] md:p-7"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="font-ui text-xs font-semibold tabular-nums tracking-wider text-ink-subtle"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-paper">
                  <step.icon
                    className="size-5 text-action"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -right-3 hidden -translate-y-1/2 items-center md:flex"
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
              </div>
            </Reveal>
          ))}
        </ol>
        <p className="font-ui mt-10 text-center text-base leading-relaxed text-ink-muted">
          See it in action —{" "}
          <a href="#try-it" className="landing-inline-link">
            try the live demo
          </a>
          .
        </p>
      </div>
    </section>
  );
}
