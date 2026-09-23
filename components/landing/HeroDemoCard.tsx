import { TriangleAlert } from "lucide-react";

/**
 * Illustrative before/after card. Static marketing copy only —
 * the app adapts the user's own content through lib/adapt.
 */
export function HeroDemoCard() {
  return (
    <figure className="border-beam rounded-2xl bg-card font-ui shadow-[0_1px_2px_rgb(26_24_20/0.05),0_12px_40px_-12px_rgb(26_24_20/0.18)]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-2 rounded-full bg-action" aria-hidden="true" />
          <span>enrollment-policy.pdf</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border/50 bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-ink">
          <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
          1 condition flagged
        </span>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-bl-2xl bg-card p-5 text-left md:rounded-bl-2xl">
          <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">
            Source
          </p>
          <p className="font-reading leading-relaxed text-ink">
            Students may drop a subject before the midterm,{" "}
            <span className="rounded bg-warning-soft px-1 underline decoration-warning decoration-2 underline-offset-4">
              only with written approval
            </span>{" "}
            from their adviser.
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5 text-left">
          <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">
            Key Points
          </p>
          <ul className="flex flex-col gap-1.5 leading-relaxed text-ink">
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
