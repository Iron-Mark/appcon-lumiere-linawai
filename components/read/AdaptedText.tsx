"use client";

import type { ReactNode } from "react";
import type { Check } from "@/lib/domain";
import type { TextMark } from "./marks";

type AdaptedTextProps = {
  text: string;
  marks: TextMark[];
  selectedIndex: number | null;
  onSelectMark: (checkIndex: number) => void;
  showingOriginal: boolean;
  originalText: string;
  /** True while adapt() is in flight — reserves space with a skeleton. */
  working?: boolean;
};

const READING_STYLE = {
  margin: 0,
  maxWidth: "var(--measure-reading)",
  fontSize: "1.1875rem",
  lineHeight: 1.75,
  color: "var(--color-ink)",
  whiteSpace: "pre-wrap",
} as const;

/** Per-line entrance delay so the note "lands" instead of popping in. */
const LINE_STAGGER_MS = 45;

export function AdaptedText({
  text,
  marks,
  selectedIndex,
  onSelectMark,
  showingOriginal,
  originalText,
  working = false,
}: AdaptedTextProps) {
  if (showingOriginal) {
    return (
      <p
        key="original"
        className="font-reading animate-in fade-in-0 duration-300 fill-mode-both motion-reduce:animate-none"
        style={READING_STYLE}
      >
        {originalText ||
          "Original source is held by the adapter. Paste source text to keep a local copy."}
      </p>
    );
  }

  if (working && !text.trim()) {
    return <ReadingSkeleton />;
  }

  if (!text.trim()) {
    return (
      <p
        className="font-reading"
        style={{
          ...READING_STYLE,
          color: "var(--color-ink-muted)",
          fontStyle: "italic",
        }}
      >
        Adapted text will appear on this paper once you run Adapt.
      </p>
    );
  }

  return (
    <p key={text} className="font-reading" style={READING_STYLE}>
      {renderLines(text, marks, selectedIndex, onSelectMark)}
    </p>
  );
}

/** Three reading-width bars in place of the note; keeps layout stable while adapting. */
function ReadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        maxWidth: "var(--measure-reading)",
        paddingTop: "0.35rem",
      }}
    >
      {[92, 78, 64].map((width, i) => (
        <div
          key={width}
          className="animate-pulse rounded-md bg-paper-inset motion-reduce:animate-none"
          style={{
            height: "1.05rem",
            width: `${width}%`,
            animationDelay: `${i * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Split adapted text into lines, each revealing with a short stagger.
 * Mark offsets are shifted into each line so highlights stay aligned.
 */
function renderLines(
  text: string,
  marks: TextMark[],
  selectedIndex: number | null,
  onSelectMark: (checkIndex: number) => void,
): ReactNode {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let lineStart = 0;

  lines.forEach((line, lineIndex) => {
    const lineEnd = lineStart + line.length;
    const local: TextMark[] = [];
    for (const mark of marks) {
      if (mark.end <= lineStart || mark.start >= lineEnd) continue;
      const start = Math.max(mark.start, lineStart) - lineStart;
      const end = Math.min(mark.end, lineEnd) - lineStart;
      if (end <= start) continue;
      local.push({ ...mark, start, end, phrase: line.slice(start, end) });
    }

    nodes.push(
      <span
        key={`line-${lineIndex}-${lineStart}`}
        className="adapted-line animate-in fade-in-0 slide-in-from-bottom-1 duration-300 ease-out fill-mode-both motion-reduce:animate-none"
        style={{
          display: "block",
          animationDelay: `${lineIndex * LINE_STAGGER_MS}ms`,
        }}
      >
        {renderMarked(
          line,
          local,
          selectedIndex,
          onSelectMark,
          marks,
          lineStart,
        )}
      </span>,
    );

    // +1 for the newline consumed by split()
    lineStart = lineEnd + 1;
  });

  return nodes;
}

function renderMarked(
  text: string,
  marks: TextMark[],
  selectedIndex: number | null,
  onSelectMark: (checkIndex: number) => void,
  allMarks: TextMark[],
  lineStart: number,
): ReactNode {
  if (marks.length === 0) return text;

  const nodes: ReactNode[] = [];
  let cursor = 0;

  marks.forEach((mark, i) => {
    if (mark.start > cursor) {
      nodes.push(text.slice(cursor, mark.start));
    }
    const caution =
      mark.status === "warning" || mark.status === "repair_required";
    const selected = selectedIndex === mark.checkIndex;
    const original = allMarks.find((m) => m.checkIndex === mark.checkIndex);
    const isFirstSegment = !original || original.start >= lineStart;

    nodes.push(
      <mark
        key={`mark-${mark.checkIndex}-${i}`}
        id={isFirstSegment ? `adapted-mark-${mark.checkIndex}` : undefined}
        tabIndex={0}
        role="button"
        aria-pressed={selected}
        aria-label={`Meaning check mark: ${mark.phrase}`}
        className="adapted-mark cursor-pointer"
        data-caution={caution ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        onClick={() => onSelectMark(mark.checkIndex)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectMark(mark.checkIndex);
          }
        }}
        style={{
          background: selected
            ? caution
              ? "color-mix(in srgb, var(--color-warning) 38%, var(--color-paper-raised))"
              : "color-mix(in srgb, var(--color-action) 28%, var(--color-paper-raised))"
            : caution
              ? "color-mix(in srgb, var(--color-warning) 14%, transparent)"
              : "transparent",
          color: "inherit",
          borderRadius: "0.12rem",
          padding: "0 0.08em",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          boxShadow: selected
            ? caution
              ? "0 0 0 2px var(--color-warning-border)"
              : "0 0 0 2px var(--color-action-border)"
            : undefined,
          borderBottom: selected
            ? undefined
            : caution
              ? "2px solid var(--color-warning-border)"
              : "2px solid var(--color-action-border)",
          cursor: "pointer",
          transition:
            "background-color var(--motion-fast) ease, box-shadow var(--motion-fast) ease",
        }}
      >
        {text.slice(mark.start, mark.end)}
      </mark>,
    );
    cursor = mark.end;
  });

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function statusLabel(
  overall: Check["status"] | null,
  working: boolean,
  listening: boolean,
  detailLabel: string,
  wordingLabel: string,
): string {
  if (working) return "Adapting…";
  if (listening) return "Reading aloud…";
  if (!overall) return "Paste a source, or use an example.";
  if (overall === "warning" || overall === "repair_required") {
    return "Review a flagged claim against the source.";
  }
  return `Adapted · ${detailLabel} · ${wordingLabel}`;
}
