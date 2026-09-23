import { TriangleAlert } from "lucide-react";

/**
 * Illustrative before/after card. Static marketing copy only —
 * the app adapts the user's own content through lib/adapt.
 * Visual: quiet Granola-like note window on warm paper.
 */
export function HeroDemoCard() {
  return (
    <figure className="font-ui m-0 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] bg-paper-raised shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_6%,transparent),0_24px_48px_-28px_color-mix(in_srgb,var(--color-ink)_28%,transparent)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#c4a484]" />
            <span className="size-2 rounded-full bg-[#b8c49a]" />
            <span className="size-2 rounded-full bg-[#d4c4a8]" />
          </span>
          <span className="truncate text-xs text-ink-muted">
            enrollment-policy.pdf
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-warning-border/40 bg-warning-soft px-2 py-1 text-xs font-medium text-ink">
          <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
          Condition flagged
        </span>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="flex flex-col gap-2 bg-paper-raised p-5 text-left">
          <p className="m-0 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-subtle uppercase">
            Source
          </p>
          <p className="font-reading m-0 leading-relaxed text-ink">
            Students may drop a subject before the midterm,{" "}
            <span className="rounded bg-warning-soft px-1 underline decoration-warning decoration-2 underline-offset-4">
              only with written approval
            </span>{" "}
            from their adviser.
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-paper-raised p-5 text-left">
          <p className="m-0 text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-subtle uppercase">
            Key Points
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 leading-relaxed text-ink">
            <li className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink/40"
              />
              You can drop a subject before the midterm.
            </li>
            <li className="flex gap-2 text-ink-muted">
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
