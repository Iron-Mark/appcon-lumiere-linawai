"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  GitBranch,
  Hash,
  ShieldQuestion,
  Users,
} from "lucide-react";
import type { Check, CriticalFactType, MeaningMap } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  factMeta,
  factTitle,
  linkFacts,
  RULE_TYPES,
  TIME_TYPES,
  TYPE_LABEL,
  type LinkedFact,
} from "./factLinks";

type GlanceViewProps = {
  meaningMap: MeaningMap;
  checks: Check[];
  adaptedText: string;
  selectedIndex: number | null;
  onSelectCheck: (index: number | null) => void;
};

/**
 * The note as structure instead of prose: when things happen, who does what,
 * and which rules gate it. Every tile is a Meaning Map fact, so it is grounded
 * in the source and carries its Meaning Check status.
 */
export function GlanceView({
  meaningMap,
  checks,
  adaptedText,
  selectedIndex,
  onSelectCheck,
}: GlanceViewProps) {
  const linked = linkFacts(meaningMap.criticalFacts, checks, adaptedText);
  const when = linked.filter((l) => TIME_TYPES.has(l.fact.type));
  const rules = linked.filter((l) => RULE_TYPES.has(l.fact.type));
  const rest = linked.filter(
    (l) => !TIME_TYPES.has(l.fact.type) && !RULE_TYPES.has(l.fact.type),
  );

  if (linked.length === 0) {
    return (
      <p
        className="font-ui"
        style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: "0.9375rem" }}
      >
        Nothing structured was found in this note yet — the text view has the
        full wording.
      </p>
    );
  }

  return (
    <div
      className="glance font-ui animate-in fade-in-0 duration-300 fill-mode-both motion-reduce:animate-none"
      style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}
    >
      {meaningMap.sourceIntent ? (
        <p
          className="font-reading"
          style={{
            margin: 0,
            fontSize: "1.0625rem",
            lineHeight: 1.5,
            color: "var(--color-ink-muted)",
          }}
        >
          {meaningMap.sourceIntent}
        </p>
      ) : null}

      {when.length > 0 ? (
        <Section icon={<CalendarClock size={15} strokeWidth={2} />} title="When">
          <ol className="glance-timeline">
            {when.map((l, i) => (
              <li key={l.fact.id} className="glance-timeline-item">
                <span aria-hidden className="glance-timeline-dot" data-status={l.status} />
                <Tile
                  linked={l}
                  selected={selectedIndex != null && l.checkIndex === selectedIndex}
                  onSelect={onSelectCheck}
                  delayMs={i * 40}
                  emphasis
                />
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {rest.length > 0 ? (
        <Section icon={<Users size={15} strokeWidth={2} />} title="Who does what">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" }}>
            {rest.map((l, i) => (
              <li key={l.fact.id}>
                <Tile
                  linked={l}
                  selected={selectedIndex != null && l.checkIndex === selectedIndex}
                  onSelect={onSelectCheck}
                  delayMs={120 + i * 40}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {rules.length > 0 ? (
        <Section
          icon={<ShieldQuestion size={15} strokeWidth={2} />}
          title="Only if / never"
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" }}>
            {rules.map((l, i) => (
              <li key={l.fact.id}>
                <Tile
                  linked={l}
                  selected={selectedIndex != null && l.checkIndex === selectedIndex}
                  onSelect={onSelectCheck}
                  delayMs={200 + i * 40}
                  rule
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <style>{`
        .glance-timeline {
          position: relative;
          list-style: none;
          margin: 0;
          display: grid;
          gap: 0.5rem;
          padding: 0 0 0 1.35rem;
        }
        .glance-timeline::before {
          content: "";
          position: absolute;
          left: 0.42rem;
          top: 0.9rem;
          bottom: 0.9rem;
          width: 2px;
          border-radius: 1px;
          background: var(--color-paper-inset);
        }
        .glance-timeline-item { position: relative; }
        .glance-timeline-dot {
          position: absolute;
          left: -1.35rem;
          top: 0.95rem;
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 999px;
          background: var(--color-paper-raised);
          border: 2px solid var(--color-action-border);
          box-shadow: 0 0 0 3px var(--color-paper-raised);
        }
        .glance-timeline-dot[data-status="warning"],
        .glance-timeline-dot[data-status="repair_required"] {
          border-color: var(--color-warning-border);
          background: var(--color-warning-soft);
        }
      `}</style>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <h3
        style={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-ink-subtle)",
        }}
      >
        <span aria-hidden style={{ display: "inline-flex", color: "var(--color-action)" }}>
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function typeIcon(type: CriticalFactType): ReactNode {
  switch (type) {
    case "prohibition":
    case "negation":
      return <Ban size={14} strokeWidth={2} />;
    case "quantity":
      return <Hash size={14} strokeWidth={2} />;
    case "condition":
    case "exception":
    case "permission":
      return <GitBranch size={14} strokeWidth={2} />;
    default:
      return null;
  }
}

function Tile({
  linked,
  selected,
  onSelect,
  delayMs,
  emphasis = false,
  rule = false,
}: {
  linked: LinkedFact;
  selected: boolean;
  onSelect: (index: number | null) => void;
  delayMs: number;
  /** Timeline entries: the value is the headline. */
  emphasis?: boolean;
  /** Rules: amber-leaning frame even when passing, since they gate everything else. */
  rule?: boolean;
}) {
  const { fact, checkIndex, status } = linked;
  const caution = status === "warning" || status === "repair_required";
  const title = factTitle(fact);
  const meta = factMeta(fact);
  const clickable = checkIndex != null;
  const icon = typeIcon(fact.type);

  const body = (
    <>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: caution
              ? "var(--color-warning)"
              : rule
                ? "var(--color-ink-muted)"
                : "var(--color-action)",
          }}
        >
          {icon}
          {fact.negated && fact.type !== "negation" && fact.type !== "prohibition"
            ? `Not · ${TYPE_LABEL[fact.type]}`
            : TYPE_LABEL[fact.type]}
        </span>
        <span
          aria-label={caution ? "Flagged by Meaning Check" : "Passed Meaning Check"}
          style={{
            display: "inline-flex",
            color: caution ? "var(--color-warning)" : "var(--color-pass)",
            opacity: caution ? 1 : 0.7,
          }}
        >
          {caution ? (
            <AlertTriangle size={14} strokeWidth={2.25} aria-hidden />
          ) : (
            <CheckCircle2 size={14} strokeWidth={2} aria-hidden />
          )}
        </span>
      </span>
      <span
        className={emphasis ? "font-reading" : "font-ui"}
        style={{
          display: "block",
          fontSize: emphasis ? "1.25rem" : "1rem",
          fontWeight: emphasis ? 600 : 500,
          lineHeight: 1.3,
          letterSpacing: emphasis ? "-0.01em" : undefined,
          color: "var(--color-ink)",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span
          style={{
            display: "block",
            fontSize: "0.875rem",
            lineHeight: 1.4,
            color: "var(--color-ink-muted)",
          }}
        >
          {meta}
        </span>
      ) : null}
      {fact.condition && fact.condition.trim() !== title ? (
        <Chip label="Only if" text={fact.condition} />
      ) : null}
      {fact.exception && fact.exception.trim() !== title ? (
        <Chip label="Except" text={fact.exception} />
      ) : null}
      {selected && fact.evidence ? (
        <span
          className="font-reading animate-in fade-in-0 duration-200 fill-mode-both motion-reduce:animate-none"
          style={{
            display: "block",
            marginTop: "0.25rem",
            padding: "0.5rem 0.65rem",
            borderRadius: "0.4rem",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            background: caution
              ? "color-mix(in srgb, var(--color-warning) 16%, var(--color-paper-raised))"
              : "var(--color-paper-inset)",
            color: "var(--color-ink)",
          }}
        >
          {fact.evidence}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "glance-tile flex w-full flex-col gap-1.5 rounded-xl border text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
    "animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none",
    emphasis ? "px-4 py-3.5" : "px-3.5 py-3",
    caution
      ? "border-warning-border/60 bg-warning-soft/40"
      : rule
        ? "border-paper-inset bg-paper-inset/40"
        : "border-paper-inset bg-paper-raised",
    selected && (caution ? "border-2 border-warning-border bg-warning-soft" : "border-2 border-action-border bg-action-soft"),
    clickable &&
      "cursor-pointer hover:border-ink-subtle/50 hover:bg-paper-inset/70 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
  );

  const style = { animationDelay: `${delayMs}ms` } as const;

  if (!clickable) {
    return (
      <div className={className} style={style}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(selected ? null : checkIndex)}
      aria-pressed={selected}
      className={className}
      style={style}
    >
      {body}
    </button>
  );
}

function Chip({ label, text }: { label: string; text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.35rem",
        marginTop: "0.15rem",
        padding: "0.25rem 0.55rem",
        borderRadius: "0.4rem",
        background: "color-mix(in srgb, var(--color-warning-soft) 65%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-warning-border) 35%, transparent)",
        fontSize: "0.8125rem",
        lineHeight: 1.4,
        color: "var(--color-ink)",
        maxWidth: "100%",
      }}
    >
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-warning)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ minWidth: 0 }}>{text}</span>
    </span>
  );
}
