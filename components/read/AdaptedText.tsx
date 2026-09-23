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
};

export function AdaptedText({
  text,
  marks,
  selectedIndex,
  onSelectMark,
  showingOriginal,
  originalText,
}: AdaptedTextProps) {
  if (showingOriginal) {
    return (
      <p
        className="font-reading"
        style={{
          margin: 0,
          maxWidth: "var(--measure-reading)",
          fontSize: "1.125rem",
          lineHeight: 1.7,
          color: "var(--color-ink)",
          whiteSpace: "pre-wrap",
        }}
      >
        {originalText ||
          "Original source for this sample is held by the adapter. Paste source text to keep a local copy."}
      </p>
    );
  }

  return (
    <p
      className="font-reading"
      style={{
        margin: 0,
        maxWidth: "var(--measure-reading)",
        fontSize: "1.125rem",
        lineHeight: 1.7,
        color: "var(--color-ink)",
        whiteSpace: "pre-wrap",
      }}
    >
      {renderMarked(text, marks, selectedIndex, onSelectMark)}
    </p>
  );
}

function renderMarked(
  text: string,
  marks: TextMark[],
  selectedIndex: number | null,
  onSelectMark: (checkIndex: number) => void,
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
    nodes.push(
      <mark
        key={`mark-${mark.checkIndex}-${i}`}
        id={`adapted-mark-${mark.checkIndex}`}
        tabIndex={0}
        role="button"
        aria-pressed={selected}
        aria-label={`Meaning check mark: ${mark.phrase}`}
        onClick={() => onSelectMark(mark.checkIndex)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectMark(mark.checkIndex);
          }
        }}
        style={{
          background:
            selected && caution
              ? "color-mix(in srgb, var(--color-warning) 35%, var(--color-paper-raised))"
              : caution
                ? "color-mix(in srgb, var(--color-warning) 22%, var(--color-paper-raised))"
                : "color-mix(in srgb, var(--color-action) 16%, var(--color-paper-raised))",
          color: "inherit",
          borderRadius: "0.15rem",
          padding: "0 0.1em",
          boxShadow:
            selected && caution
              ? "0 0 0 2px var(--color-warning-border)"
              : selected
                ? "0 0 0 2px var(--color-action-border)"
                : undefined,
          cursor: "pointer",
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
  if (!overall) return "Paste a source, or load the development sample.";
  if (overall === "warning" || overall === "repair_required") {
    return "Review a flagged claim against the source.";
  }
  return `Adapted · ${detailLabel} · ${wordingLabel}`;
}
