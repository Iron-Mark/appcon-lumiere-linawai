import { ArrowRight, TriangleAlert } from "lucide-react";

/**
 * Illustrative before/after card. Static marketing copy only —
 * the app adapts the user's own content through lib/adapt.
 * Visual: quiet note window on warm paper.
 */
export function HeroDemoCard() {
  return (
    <figure className="border-beam font-ui m-0 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] bg-paper-raised shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_6%,transparent),0_24px_48px_-28px_color-mix(in_srgb,var(--color-ink)_28%,transparent)]">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-paper-raised px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-[color-mix(in_srgb,var(--color-ink-subtle)_55%,var(--color-paper-inset))]" />
            <span className="size-2 rounded-full bg-[color-mix(in_srgb,var(--color-action-border)_35%,var(--color-paper-inset))]" />
            <span className="size-2 rounded-full bg-[color-mix(in_srgb,var(--color-warning-border)_28%,var(--color-paper-inset))]" />
          </span>
          <span className="truncate text-xs font-medium text-ink-muted">
            enrollment-policy.pdf
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-warning-border/40 bg-warning-soft px-2.5 py-1 text-xs font-medium text-ink">
          <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
          Condition flagged
        </span>
      </div>

      <div className="relative grid gap-px bg-border md:grid-cols-2">
        <div className="flex flex-col gap-2.5 bg-paper-raised p-5 text-left sm:p-6">
          <p className="m-0 text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">
            Source
          </p>
          <p className="font-reading m-0 text-[0.9375rem] leading-relaxed text-ink sm:text-base">
            Students may drop a subject before the midterm,{" "}
            <span className="rounded-sm bg-warning-soft px-1 underline decoration-warning decoration-2 underline-offset-4">
              only with written approval
            </span>{" "}
            from their adviser.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 z-10 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-paper-raised text-ink-subtle md:flex"
        >
          <ArrowRight className="size-3.5" />
        </div>

        <div className="flex flex-col gap-2.5 bg-paper-raised p-5 text-left sm:p-6">
          <p className="m-0 text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">
            Key Points
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.9375rem] leading-relaxed text-ink sm:text-base">
            <li className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink/35"
              />
              You can drop a subject before the midterm.
            </li>
            <li className="flex gap-2.5 text-ink-muted">
              <span
                aria-hidden="true"
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-warning"
              />
              <span>
                <span className="sr-only">Flagged: </span>
                Missing: needs your adviser&apos;s written approval.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <figcaption className="sr-only">
        Example: Linaw flags that a Key Points summary dropped the condition
        “only with written approval.”
      </figcaption>
    </figure>
  );
}
