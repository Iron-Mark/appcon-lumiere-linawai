"use client";

import { useEffect, useState } from "react";
import type { Check } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ShieldCheck,
} from "lucide-react";
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

/**
 * Fidelity layers report with engineering names. Show a reader-facing
 * label first; the layer name stays visible underneath so the four
 * layers remain identifiable.
 */
const LAYER_LABELS: Record<string, string> = {
  "Deterministic fact compare": "Dates, times, and numbers match",
  "Actor–value relationships": "Who and when stay paired",
  "Actor-value relationships": "Who and when stay paired",
  "Semantic verification (NLI): neutral": "Semantic check",
  "Critical fact coverage": "Key facts are all present",
};

function readerLabel(claim: string): { label: string; layer?: string } {
  const mapped = LAYER_LABELS[claim.trim()];
  return mapped ? { label: mapped, layer: claim } : { label: claim };
}

/**
 * A layer that did not actually run reports itself with this reason.
 * It must not read as a pass — the UI shows it as "not run".
 */
const NOT_RUN_REASON = "Semantic check not connected.";

function layerNotRun(check: Check): boolean {
  return check.reason.trim() === NOT_RUN_REASON;
}

/** Ray at a size that registers; overrides the mascot's inline 40px slot. */
const RAY_LARGE = "[&_svg]:size-14! [&_svg]:min-w-14!";

/** Per-card entrance delay, after the rail itself has landed. */
const CARD_STAGGER_MS = 40;
const CARD_BASE_DELAY_MS = 120;

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
  const caution =
    overallStatus === "warning" || overallStatus === "repair_required";
  const skippedLayers = hasResults ? checks.filter(layerNotRun).length : 0;
  const ranCount = hasResults ? checks.length - skippedLayers : 0;

  // Flagged checks are always visible. Passes and not-run layers sit behind a
  // disclosure: the reader wants the verdict, the sceptic can open the evidence.
  const flaggedIdx: number[] = [];
  const quietIdx: number[] = [];
  if (hasResults) {
    checks.forEach((c, i) => {
      const flagged =
        !layerNotRun(c) &&
        (c.status === "warning" || c.status === "repair_required");
      (flagged ? flaggedIdx : quietIdx).push(i);
    });
  }
  const quietPassCount = hasResults
    ? quietIdx.filter((i) => !layerNotRun(checks[i]!)).length
    : 0;
  const quietSummary = (() => {
    const noun = quietPassCount === 1 ? "check" : "checks";
    const passed = `${quietPassCount} ${flaggedIdx.length > 0 ? "other " : ""}${noun} passed`;
    return skippedLayers > 0
      ? `${passed} · ${skippedLayers} not run`
      : passed;
  })();

  const [detailsOpen, setDetailsOpen] = useState(false);
  // New result → back to the summary view.
  useEffect(() => {
    setDetailsOpen(false);
  }, [checks]);
  // A mark in the note was chosen whose card is folded away — unfold so the link holds.
  useEffect(() => {
    if (selectedIndex == null) return;
    if (quietIdx.includes(selectedIndex)) setDetailsOpen(true);
    // quietIdx is derived from checks; selectedIndex is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

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
        scrollMarginTop: "4.5rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          paddingBottom: "0.9rem",
          borderBottom: "1px solid var(--color-paper-inset)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ShieldCheck
            size={18}
            strokeWidth={2}
            aria-hidden
            style={{ color: "var(--color-action)", flexShrink: 0 }}
          />
          <h2
            className="font-reading"
            style={{
              margin: 0,
              fontSize: "1.1875rem",
              fontWeight: 600,
              letterSpacing: "-0.012em",
              lineHeight: 1.2,
              color: "var(--color-ink)",
            }}
          >
            Meaning Check
          </h2>
        </div>
        <div
          aria-hidden
          style={{
            height: 3,
            width: "3.25rem",
            borderRadius: 999,
            background: caution && hasResults
              ? "var(--color-warning-border)"
              : "var(--color-action)",
            transition: "background var(--motion-base) ease",
          }}
        />
      </header>

      {!hasResults ? (
        <EmptyRail loading={loading} sindiState={sindiState} sindiLine={sindiLine} />
      ) : (
        <>
          <div
            className={cn(
              "rounded-xl px-3.5 py-3",
              "animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none",
              caution ? "bg-warning-soft/70" : "bg-action-soft/55",
            )}
            style={{ animationDelay: "60ms" }}
          >
            <Sindi
              state={sindiState}
              line={sindiLine}
              className={cn(RAY_LARGE, "items-center")}
            />
            {caution ? (
              <p
                style={{
                  margin: "0.55rem 0 0",
                  fontSize: "0.875rem",
                  lineHeight: 1.45,
                  color: "var(--color-ink-muted)",
                }}
              >
                Review flagged claims against the source.
              </p>
            ) : null}
            {skippedLayers > 0 ? (
              <p
                style={{
                  margin: "0.55rem 0 0",
                  fontSize: "0.8125rem",
                  lineHeight: 1.45,
                  color: "var(--color-ink-muted)",
                }}
              >
                {ranCount} of {checks.length} checks ran in this build.{" "}
                {skippedLayers === 1
                  ? "One layer is not connected yet."
                  : `${skippedLayers} layers are not connected yet.`}
              </p>
            ) : null}
          </div>
          {flaggedIdx.length > 0 ? (
            <ul style={LIST_STYLE} aria-label="Flagged checks">
              {flaggedIdx.map((index) => renderCard(checks[index]!, index))}
            </ul>
          ) : null}

          {quietIdx.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {/* Readers get the verdict; the layer-by-layer evidence is one tap away. */}
              <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                aria-expanded={detailsOpen}
                aria-controls="meaning-check-details"
                className="font-ui group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-paper-inset bg-transparent px-3.5 py-2.5 text-left text-ink-muted transition-[background-color,border-color,color] duration-150 ease-out hover:border-ink-subtle/50 hover:bg-paper-inset/70 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
                style={{ minHeight: 44 }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    minWidth: 0,
                  }}
                >
                  <CheckCircle2
                    size={15}
                    strokeWidth={2}
                    aria-hidden
                    style={{ color: "var(--color-pass)", flexShrink: 0 }}
                  />
                  <span style={{ minWidth: 0 }}>{quietSummary}</span>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    flexShrink: 0,
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-action)",
                  }}
                >
                  {detailsOpen ? "Hide" : "Show"}
                  <ChevronDown
                    size={15}
                    strokeWidth={2.25}
                    aria-hidden
                    className="transition-transform duration-200 ease-out motion-reduce:transition-none"
                    style={{
                      transform: detailsOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </span>
              </button>
              {detailsOpen ? (
                <ul
                  id="meaning-check-details"
                  style={LIST_STYLE}
                  aria-label="All checks"
                >
                  {quietIdx.map((index) => renderCard(checks[index]!, index))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </aside>
  );

  function renderCard(check: Check, index: number) {
              const selected = selectedIndex === index;
              const notRun = layerNotRun(check);
              const cardCaution =
                !notRun &&
                (check.status === "warning" ||
                  check.status === "repair_required");
              const quietPass = !notRun && check.status === "pass" && !selected;
              const { label, layer } = readerLabel(check.claim);
              const showDetail = !notRun && (selected || cardCaution);

              return (
                <li
                  key={`${check.claim}-${index}`}
                  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
                  style={{
                    animationDelay: `${CARD_BASE_DELAY_MS + index * CARD_STAGGER_MS}ms`,
                  }}
                >
                  <button
                    type="button"
                    id={`meaning-check-card-${index}`}
                    onClick={() => {
                      if (notRun) return;
                      onSelect(selected ? null : index);
                    }}
                    aria-pressed={notRun ? undefined : selected}
                    aria-disabled={notRun || undefined}
                    className={cn(
                      "font-ui flex w-full min-h-11 cursor-pointer flex-col text-left text-ink",
                      "rounded-lg border transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px",
                      showDetail ? "gap-2 px-4 py-3.5" : "gap-1 px-3.5 py-3",
                      // Not run: visibly inert, never confused with a pass.
                      notRun &&
                        "cursor-default border-dashed border-ink-subtle/40 bg-transparent opacity-80 active:translate-y-0",
                      // Quiet pass: still clearly a live control.
                      quietPass &&
                        "border-paper-inset border-l-[3px] border-l-pass/45 bg-transparent hover:border-ink-subtle/50 hover:border-l-pass hover:bg-paper-inset/70",
                      cardCaution &&
                        !selected &&
                        "border-warning-border/55 border-l-[3px] border-l-warning-border bg-paper-raised hover:bg-warning-soft/60",
                      selected &&
                        cardCaution &&
                        "border-2 border-warning-border bg-warning-soft shadow-[0_6px_18px_-10px_color-mix(in_srgb,var(--color-warning)_45%,transparent)]",
                      selected &&
                        !cardCaution &&
                        "border-2 border-action-border bg-action-soft",
                    )}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: notRun
                          ? "var(--color-ink-subtle)"
                          : cardCaution
                            ? "var(--color-warning)"
                            : "var(--color-pass)",
                      }}
                    >
                      {notRun ? (
                        <CircleDashed size={15} strokeWidth={2} aria-hidden />
                      ) : cardCaution ? (
                        <AlertTriangle size={15} strokeWidth={2} aria-hidden />
                      ) : (
                        <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                      )}
                      {notRun
                        ? "Not run"
                        : check.status === "repair_required"
                          ? "Needs review"
                          : check.status === "warning"
                            ? "Warning"
                            : "Pass"}
                    </span>
                    <span
                      style={{
                        fontWeight: quietPass ? 500 : 600,
                        fontSize: "0.9375rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </span>
                    {layer ? (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          lineHeight: 1.4,
                          color: "var(--color-ink-subtle)",
                        }}
                      >
                        {layer}
                      </span>
                    ) : null}
                    {notRun ? (
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          lineHeight: 1.45,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        {check.reason} Not counted toward the result.
                      </span>
                    ) : null}
                    {showDetail && check.reason ? (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: cardCaution
                            ? "var(--color-warning)"
                            : "var(--color-ink-muted)",
                          lineHeight: 1.45,
                        }}
                      >
                        {check.reason}
                      </span>
                    ) : null}
                    {showDetail && check.evidence ? (
                      <span
                        id={`meaning-check-evidence-${index}`}
                        className="font-reading"
                        style={{
                          display: "block",
                          marginTop: "0.1rem",
                          padding: "0.6rem 0.75rem",
                          borderRadius: "0.4rem",
                          fontSize: "0.875rem",
                          lineHeight: 1.55,
                          background:
                            selected && cardCaution
                              ? "color-mix(in srgb, var(--color-warning) 18%, var(--color-paper-raised))"
                              : "var(--color-paper-inset)",
                          color: "var(--color-ink)",
                          boxShadow:
                            selected && cardCaution
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
  }
}

const LIST_STYLE = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
} as const;

function EmptyRail({
  loading,
  sindiState,
  sindiLine,
}: {
  loading: boolean;
  sindiState: SindiState;
  sindiLine?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "1rem 0.75rem 0.25rem",
          textAlign: "center",
        }}
      >
        <Sindi
          state={loading ? "working" : sindiState === "empty" ? "empty" : sindiState}
          line={loading ? "Checking meaning…" : sindiLine ?? ""}
          className={cn(RAY_LARGE, "flex-col gap-3 text-center")}
        />
        {loading ? null : (
          <p
            style={{
              margin: 0,
              maxWidth: "16rem",
              fontSize: "0.9375rem",
              lineHeight: 1.5,
              color: "var(--color-ink-muted)",
            }}
          >
            Checks will appear here after you clarify a note.
          </p>
        )}
      </div>
      {loading ? (
        <ul
          aria-hidden="true"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="animate-pulse rounded-lg border border-paper-inset motion-reduce:animate-none"
              style={{
                height: "3.9rem",
                padding: "0.85rem 0.9rem",
                animationDelay: `${i * 120}ms`,
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              <span
                className="rounded-sm bg-paper-inset"
                style={{ height: "0.6rem", width: "3rem" }}
              />
              <span
                className="rounded-sm bg-paper-inset"
                style={{ height: "0.8rem", width: `${72 - i * 9}%` }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
