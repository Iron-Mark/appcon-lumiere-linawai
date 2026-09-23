"use client";

import type { Check } from "@/lib/domain";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Sindi, type SindiState } from "@/components/sindi";

type MeaningCheckRailProps = {
  checks: Check[] | null;
  overallStatus: Check["status"] | null;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  sindiState: SindiState;
  sindiLine?: string;
  loading: boolean;
};

export function MeaningCheckRail({
  checks,
  overallStatus,
  selectedIndex,
  onSelect,
  sindiState,
  sindiLine,
  loading,
}: MeaningCheckRailProps) {
  const hasResults = checks != null && checks.length > 0 && !loading;

  return (
    <aside
      aria-label="Meaning Check"
      className="font-ui flex min-w-0 flex-col gap-4"
    >
      <header className="flex flex-col gap-1.5 border-b border-paper-inset pb-3">
        <h2 className="m-0 text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">
          Meaning Check
        </h2>
        {hasResults && overallStatus === "pass" ? (
          <p className="m-0 text-[0.9375rem] text-pass">
            No issue found in these checks.
          </p>
        ) : null}
      </header>

      <Sindi state={sindiState} line={sindiLine} />

      {!hasResults ? (
        <div className="py-5 text-[0.9375rem] leading-relaxed text-ink-muted">
          {loading
            ? "Checking meaning…"
            : "Checks will appear here after you adapt a note."}
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {checks.map((check, index) => {
            const selected = selectedIndex === index;
            const caution =
              check.status === "warning" || check.status === "repair_required";
            return (
              <li key={`${check.claim}-${index}`}>
                <button
                  type="button"
                  id={`meaning-check-card-${index}`}
                  onClick={() => onSelect(selected ? null : index)}
                  aria-pressed={selected}
                  className={[
                    "flex w-full min-h-11 cursor-pointer flex-col gap-2 rounded-lg px-4 py-3.5 text-left font-ui text-ink",
                    "transition-[background-color,border-color,box-shadow] duration-[var(--motion-base)] ease-out motion-reduce:transition-none",
                    selected
                      ? caution
                        ? "border-2 border-warning-border bg-warning-soft"
                        : "border-2 border-action-border bg-action-soft"
                      : "border border-paper-inset bg-paper-raised hover:border-action-border/60",
                  ].join(" ")}
                >
                  <span
                    className={`flex min-h-5 items-center gap-2 text-xs font-semibold ${
                      caution ? "text-warning" : "text-pass"
                    }`}
                  >
                    {caution ? (
                      <AlertTriangle size={16} strokeWidth={2} aria-hidden />
                    ) : (
                      <CheckCircle2 size={16} strokeWidth={2} aria-hidden />
                    )}
                    {check.status === "repair_required"
                      ? "Needs review"
                      : check.status === "warning"
                        ? "Warning"
                        : "Pass"}
                  </span>
                  <span className="text-[0.9375rem] font-semibold leading-snug">
                    {check.claim}
                  </span>
                  {check.reason ? (
                    <span
                      className={`text-sm leading-snug ${
                        caution ? "text-warning" : "text-ink-muted"
                      }`}
                    >
                      {check.reason}
                    </span>
                  ) : null}
                  {check.evidence ? (
                    <span
                      id={`meaning-check-evidence-${index}`}
                      className="mt-0.5 block rounded-md px-2.5 py-2 font-reading text-[0.8125rem] leading-snug text-ink"
                      style={{
                        background:
                          selected && caution
                            ? "color-mix(in srgb, var(--color-warning) 18%, var(--color-paper-raised))"
                            : "var(--color-paper-inset)",
                        boxShadow:
                          selected && caution
                            ? "inset 0 0 0 2px var(--color-warning-border)"
                            : undefined,
                      }}
                    >
                      {check.evidence}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
