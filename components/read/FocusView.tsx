"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Ear,
  Square,
} from "lucide-react";
import type { Check, MeaningMap } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  factsInUnit,
  linkFacts,
  splitIntoUnits,
  TYPE_LABEL,
  type LinkedFact,
} from "./factLinks";

type FocusViewProps = {
  adaptedText: string;
  meaningMap: MeaningMap;
  checks: Check[];
  onSelectCheck: (index: number | null) => void;
  /** Speak just this card; the parent owns the speech engine. */
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  speaking: boolean;
};

/**
 * The adapted note, one sentence at a time. Big type, one idea, a clear
 * next step. Facts that appear in the sentence are named underneath so the
 * reader knows what kind of thing they are looking at; a flagged fact is
 * called out before they move on.
 */
export function FocusView({
  adaptedText,
  meaningMap,
  checks,
  onSelectCheck,
  onSpeak,
  onStopSpeaking,
  speaking,
}: FocusViewProps) {
  const units = useMemo(() => splitIntoUnits(adaptedText), [adaptedText]);
  const linked = useMemo(
    () => linkFacts(meaningMap.criticalFacts, checks, adaptedText),
    [meaningMap, checks, adaptedText],
  );
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // New note → start over.
  useEffect(() => {
    setIndex(0);
  }, [adaptedText]);

  const total = units.length;
  const current = units[Math.min(index, Math.max(0, total - 1))] ?? "";
  const facts = useMemo(() => factsInUnit(current, linked), [current, linked]);
  const flagged = facts.filter(
    (f) => f.status === "warning" || f.status === "repair_required",
  );

  const go = (next: number) => {
    if (next < 0 || next >= total) return;
    if (speaking) onStopSpeaking();
    setIndex(next);
    // Keep focus on the card so arrow keys keep working and SR announces it.
    requestAnimationFrame(() => cardRef.current?.focus({ preventScroll: true }));
  };

  if (total === 0) return null;

  return (
    <div
      className="focus-view font-ui animate-in fade-in-0 duration-300 fill-mode-both motion-reduce:animate-none"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div
        role="group"
        aria-roledescription="one step at a time"
        aria-label={`Step ${index + 1} of ${total}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <ol
          aria-hidden
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            gap: "0.35rem",
            alignItems: "center",
          }}
        >
          {units.map((_, i) => {
            const unitFlagged = factsInUnit(units[i]!, linked).some(
              (f) => f.status !== "pass",
            );
            return (
              <li
                key={i}
                style={{
                  width: i === index ? "1.35rem" : "0.5rem",
                  height: "0.5rem",
                  borderRadius: 999,
                  background:
                    i === index
                      ? unitFlagged
                        ? "var(--color-warning-border)"
                        : "var(--color-action)"
                      : unitFlagged
                        ? "color-mix(in srgb, var(--color-warning-border) 55%, transparent)"
                        : "var(--color-paper-inset)",
                  transition: "width var(--motion-base) ease, background-color var(--motion-base) ease",
                }}
              />
            );
          })}
        </ol>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "var(--color-ink-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {index + 1} / {total}
        </span>
      </div>

      <div
        ref={cardRef}
        key={index}
        tabIndex={0}
        aria-live="polite"
        aria-atomic="true"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            go(index - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            go(0);
          } else if (e.key === "End") {
            e.preventDefault();
            go(total - 1);
          }
        }}
        className={cn(
          "focus-card animate-in fade-in-0 slide-in-from-right-2 duration-300 ease-out fill-mode-both motion-reduce:animate-none",
          "rounded-2xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          flagged.length > 0
            ? "border-warning-border/60 bg-warning-soft/30"
            : "border-paper-inset bg-paper-raised",
          speaking && "ring-2 ring-action/30",
        )}
        style={{
          padding: "1.75rem 1.6rem 1.5rem",
          minHeight: "12rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1.25rem",
          boxShadow:
            "0 1px 2px color-mix(in srgb, var(--color-ink) 6%, transparent), 0 14px 36px -20px color-mix(in srgb, var(--color-ink) 22%, transparent)",
        }}
      >
        <p
          className="font-reading"
          style={{
            margin: 0,
            fontSize: "clamp(1.5rem, 1.2rem + 1vw, 1.9rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.012em",
            color: "var(--color-ink)",
            textWrap: "balance",
          }}
        >
          {current}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {facts.length > 0 ? (
            <ul
              aria-label="Facts in this step"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
              }}
            >
              {facts.map((f) => (
                <li key={f.fact.id}>
                  <FactPill linked={f} onSelect={onSelectCheck} />
                </li>
              ))}
            </ul>
          ) : null}
          {flagged.length > 0 ? (
            <p
              role="status"
              style={{
                margin: 0,
                display: "flex",
                gap: "0.45rem",
                alignItems: "flex-start",
                fontSize: "0.9375rem",
                lineHeight: 1.45,
                color: "var(--color-warning)",
              }}
            >
              <AlertTriangle
                size={16}
                strokeWidth={2.25}
                aria-hidden
                style={{ flexShrink: 0, marginTop: "0.15rem" }}
              />
              <span>
                Meaning Check flagged this step. Check the source before you rely on it.
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <NavButton
          onClick={() => go(index - 1)}
          disabled={index === 0}
          icon={<ArrowLeft size={16} strokeWidth={2.25} />}
          label="Back"
        />
        <button
          type="button"
          onClick={() => (speaking ? onStopSpeaking() : onSpeak(current))}
          aria-pressed={speaking}
          className={cn(
            "font-ui inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-[background-color,border-color,color] duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            speaking
              ? "border-action-border bg-action-soft text-ink"
              : "border-paper-inset bg-transparent text-ink-muted hover:bg-paper-inset hover:text-ink",
          )}
        >
          {speaking ? (
            <Square size={14} strokeWidth={2.25} aria-hidden />
          ) : (
            <Ear size={16} strokeWidth={2} aria-hidden />
          )}
          {speaking ? "Stop" : "Read this step"}
        </button>
        <NavButton
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
          icon={<ArrowRight size={16} strokeWidth={2.25} />}
          label={index >= total - 1 ? "Done" : "Next"}
          primary={index < total - 1}
          iconAfter
        />
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  icon,
  label,
  primary = false,
  iconAfter = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  iconAfter?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-ui inline-flex min-h-11 min-w-[6.5rem] cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-[background-color,border-color,transform,opacity] duration-150 ease-out motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-default disabled:opacity-40",
        "enabled:active:translate-y-px",
        primary
          ? "adapt-primary border-transparent bg-action text-paper-raised hover:bg-action-hover"
          : "border-paper-inset bg-transparent text-ink enabled:hover:bg-paper-inset",
      )}
    >
      {!iconAfter ? icon : null}
      {label}
      {iconAfter ? icon : null}
    </button>
  );
}

function FactPill({
  linked,
  onSelect,
}: {
  linked: LinkedFact;
  onSelect: (index: number | null) => void;
}) {
  const caution = linked.status === "warning" || linked.status === "repair_required";
  const clickable = linked.checkIndex != null;
  const content = (
    <>
      {caution ? (
        <AlertTriangle size={12} strokeWidth={2.25} aria-hidden />
      ) : (
        <CheckCircle2 size={12} strokeWidth={2.25} aria-hidden />
      )}
      <span style={{ fontWeight: 600 }}>{TYPE_LABEL[linked.fact.type]}</span>
      {linked.fact.value ? <span>· {linked.fact.value}</span> : null}
    </>
  );
  const className = cn(
    "font-ui inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem]",
    caution
      ? "border-warning-border/60 bg-warning-soft text-warning"
      : "border-paper-inset bg-paper-inset/60 text-ink-muted",
    clickable &&
      "cursor-pointer hover:bg-paper-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
  );
  return clickable ? (
    <button
      type="button"
      onClick={() => onSelect(linked.checkIndex)}
      className={className}
      title="Open this check in Meaning Check"
    >
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  );
}
