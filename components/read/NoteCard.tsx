"use client";

import { Ear, EarOff, FileText, RotateCcw } from "lucide-react";
import type { Check } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { AdaptedText } from "./AdaptedText";
import type { TextMark } from "./marks";

type NoteCardProps = {
  title: string;
  statusLine: string;
  adaptedText: string;
  originalText: string;
  showingOriginal: boolean;
  onToggleOriginal: () => void;
  listening: boolean;
  onToggleListen: () => void;
  canListen: boolean;
  marks: TextMark[];
  selectedIndex: number | null;
  onSelectMark: (checkIndex: number) => void;
  overallStatus: Check["status"] | null;
};

export function NoteCard({
  title,
  statusLine,
  adaptedText,
  originalText,
  showingOriginal,
  onToggleOriginal,
  listening,
  onToggleListen,
  canListen,
  marks,
  selectedIndex,
  onSelectMark,
  overallStatus,
}: NoteCardProps) {
  const caution =
    overallStatus === "warning" || overallStatus === "repair_required";

  return (
    <article
      className="flex min-w-0 flex-col gap-5 rounded-xl border border-paper-inset bg-paper-raised px-5 py-5 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_6%,transparent),0_12px_28px_-18px_color-mix(in_srgb,var(--color-ink)_18%,transparent)] sm:px-7 sm:py-6"
    >
      <header className="flex flex-col gap-1.5">
        <h1 className="font-ui m-0 text-[1.35rem] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p
          className={`font-ui m-0 text-[0.9375rem] leading-snug ${
            caution ? "text-warning" : "text-ink-muted"
          }`}
        >
          {statusLine}
        </p>
      </header>

      <div className="min-w-0">
        <AdaptedText
          text={adaptedText}
          marks={marks}
          selectedIndex={selectedIndex}
          onSelectMark={onSelectMark}
          showingOriginal={showingOriginal}
          originalText={originalText}
        />
      </div>

      <div className="font-ui flex flex-wrap gap-2 border-t border-paper-inset pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleOriginal}
          disabled={!adaptedText.trim() && !originalText.trim()}
          className="min-h-11 gap-2 px-4 font-ui text-[0.9375rem] font-semibold"
        >
          {showingOriginal ? (
            <RotateCcw aria-hidden className="size-4 text-action" strokeWidth={2} />
          ) : (
            <FileText aria-hidden className="size-4 text-action" strokeWidth={2} />
          )}
          {showingOriginal ? "Show adapted" : "Show original"}
        </Button>
        <Button
          type="button"
          variant={listening ? "secondary" : "outline"}
          onClick={onToggleListen}
          disabled={!canListen}
          aria-pressed={listening}
          className="min-h-11 gap-2 px-4 font-ui text-[0.9375rem] font-semibold"
        >
          {listening ? (
            <EarOff aria-hidden className="size-4 text-action" strokeWidth={2} />
          ) : (
            <Ear aria-hidden className="size-4 text-action" strokeWidth={2} />
          )}
          {listening ? "Stop" : "Listen"}
        </Button>
      </div>
    </article>
  );
}
