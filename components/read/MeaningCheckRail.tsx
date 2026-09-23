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
      id="meaning-check"
      aria-label="Meaning Check"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minWidth: 0,
        fontFamily: "var(--font-ui)",
        scrollMarginTop: "1.25rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
          }}
        >
          Meaning Check
        </h2>
        {hasResults && overallStatus === "pass" ? (
          <p
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              color: "var(--color-pass)",
            }}
          >
            No issue found in these checks.
          </p>
        ) : null}
      </header>

      <Sindi state={sindiState} line={sindiLine} />

      {!hasResults ? (
        <div
          style={{
            padding: "1.25rem 0",
            color: "var(--color-ink-muted)",
            fontSize: "0.9375rem",
            lineHeight: 1.5,
          }}
        >
          {loading
            ? "Checking meaning…"
            : "Checks will appear here after you adapt a note."}
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    border: selected
                      ? caution
                        ? "2px solid var(--color-warning-border)"
                        : "2px solid var(--color-action-border)"
                      : "1px solid var(--color-paper-inset)",
                    background: selected
                      ? caution
                        ? "var(--color-warning-soft)"
                        : "var(--color-action-soft)"
                      : "var(--color-paper-raised)",
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-ui)",
                    transition:
                      "background var(--motion-base) ease, border-color var(--motion-base) ease",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: caution
                        ? "var(--color-warning)"
                        : "var(--color-pass)",
                    }}
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
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {check.claim}
                  </span>
                  {check.reason ? (
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: caution
                          ? "var(--color-warning)"
                          : "var(--color-ink-muted)",
                        lineHeight: 1.45,
                      }}
                    >
                      {check.reason}
                    </span>
                  ) : null}
                  {check.evidence ? (
                    <span
                      id={`meaning-check-evidence-${index}`}
                      style={{
                        display: "block",
                        marginTop: "0.15rem",
                        padding: "0.55rem 0.65rem",
                        borderRadius: "0.35rem",
                        fontSize: "0.8125rem",
                        lineHeight: 1.45,
                        fontFamily: "var(--font-reading)",
                        background:
                          selected && caution
                            ? "color-mix(in srgb, var(--color-warning) 18%, var(--color-paper-raised))"
                            : "var(--color-paper-inset)",
                        color: "var(--color-ink)",
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
