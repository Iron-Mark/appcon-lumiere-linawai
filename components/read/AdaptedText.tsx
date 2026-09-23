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

const readingClass =
  "font-reading m-0 max-w-[var(--measure-reading)] text-[1.125rem] leading-[1.7] text-ink whitespace-pre-wrap";

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
      <p className={readingClass}>
        {originalText ||
          "Original source for this sample is held by the adapter. Paste source text to keep a local copy."}
      </p>
    );
  }

  return (
    <p className={readingClass}>
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

    const bg = selected
      ? caution
        ? "color-mix(in srgb, var(--color-warning) 35%, var(--color-paper-raised))"
        : "color-mix(in srgb, var(--color-action) 22%, var(--color-paper-raised))"
      : caution
        ? "color-mix(in srgb, var(--color-warning) 22%, var(--color-paper-raised))"
        : "color-mix(in srgb, var(--color-action) 14%, var(--color-paper-raised))";

    const ring = selected
      ? caution
        ? "0 0 0 2px var(--color-warning-border)"
        : "0 0 0 2px var(--color-action-border)"
      : undefined;

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
        className="cursor-pointer rounded-sm px-[0.1em] text-inherit outline-offset-2 transition-[background-color,box-shadow] duration-[var(--motion-base)] ease-out motion-reduce:transition-none"
        style={{ background: bg, boxShadow: ring }}
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
