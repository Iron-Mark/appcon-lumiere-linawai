import { CircleCheck, TriangleAlert } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Verification() {
  return (
    <section
      id="verification"
      aria-labelledby="verification-title"
      className="border-y border-border bg-paper-inset/40 px-5 py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="verification-title"
          eyebrow="Meaning Check"
          title="Four words can change everything."
          description="Most simplifiers make text shorter. Linaw checks whether critical meaning survived. Checks can warn; they do not prove a rewrite is correct."
          align="center"
        />

        <Reveal delay={100} className="mt-12">
          <figure className="font-ui m-0 overflow-hidden rounded-xl border border-border bg-paper-raised shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]">
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col gap-4 border-b border-border p-6 md:border-r md:border-b-0 md:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-muted">Original</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <CircleCheck className="size-3.5 text-pass" aria-hidden="true" />
                    Source of truth
                  </span>
                </div>
                <blockquote className="font-reading m-0 text-lg leading-relaxed text-ink md:text-xl">
                  Employees may work remotely up to three days a week,{" "}
                  <mark className="rounded bg-action-soft px-1 text-ink">
                    only with written approval
                  </mark>{" "}
                  from their department head.
                </blockquote>
              </div>

              <div className="flex flex-col gap-4 p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-muted">A typical simplification</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border/50 bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-ink">
                    <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
                    Flagged
                  </span>
                </div>
                <blockquote className="font-reading m-0 text-lg leading-relaxed text-ink md:text-xl">
                  You can work from home up to three days a week.
                  <span className="ml-1 inline-flex items-center rounded border border-dashed border-warning bg-warning-soft px-1.5 text-base text-ink">
                    <span className="sr-only">Missing phrase: </span>
                    <del className="decoration-warning decoration-2">only with written approval</del>
                  </span>
                </blockquote>
                <div className="mt-auto flex gap-3 rounded-lg bg-warning-soft p-4 text-sm leading-relaxed text-ink">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                  <p className="m-0">
                    <strong className="font-semibold">Important condition may have changed.</strong>{" "}
                    The adaptation reads as a right, but the source makes it a
                    permission. Review the source before you rely on it.
                  </p>
                </div>
              </div>
            </div>
            <figcaption className="border-t border-border px-6 py-4 text-center text-sm text-ink-muted md:px-8">
              This is what Linaw catches: the quiet condition that turns “you can”
              into “you can, if.”
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={160}>
          <dl className="font-ui mx-auto mt-10 grid max-w-3xl gap-6 text-center sm:grid-cols-3">
            {[
              ["Conditions", "only if, unless, except"],
              ["Quantities", "numbers, limits, amounts"],
              ["Deadlines", "dates, times, durations"],
            ].map(([term, detail]) => (
              <div key={term} className="flex flex-col gap-1">
                <dt className="font-semibold text-ink">{term}</dt>
                <dd className="m-0 text-sm text-ink-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
