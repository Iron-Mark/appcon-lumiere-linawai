"use client";

import type { ReactNode } from "react";
import {
  ArrowDown,
  Ear,
  FileText,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";
import type { Check } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { AdaptedText } from "./AdaptedText";
import type { TextMark } from "./marks";
import type { ListenRate, SpokenRange } from "./useListen";

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
  working?: boolean;
  /** Listening extras — word tracking, pause/resume, reading speed. */
  listenPaused?: boolean;
  onTogglePause?: () => void;
  listenRate?: ListenRate;
  onCycleRate?: () => void;
  spoken?: SpokenRange | null;
  /** Evidence to highlight in the original view for the selected check. */
  originalHighlight?: { text: string; caution: boolean } | null;
  /** Narrow screens: jump to the Meaning Check rail (stacked below). */
  onJumpToChecks?: () => void;
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
  working = false,
  listenPaused = false,
  onTogglePause,
  listenRate = 1,
  onCycleRate,
  spoken = null,
  originalHighlight = null,
  onJumpToChecks,
}: NoteCardProps) {
  const caution =
    overallStatus === "warning" || overallStatus === "repair_required";
  const pass = overallStatus === "pass" && !working;
  const rateLabel = `${listenRate}×`;

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.35rem",
        minWidth: 0,
        height: "fit-content",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-paper-inset)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.65rem 0.75rem",
          }}
        >
          <h2
            className="font-reading"
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              lineHeight: 1.2,
              color: "var(--color-ink)",
              minWidth: 0,
              flex: "1 1 8rem",
            }}
          >
            {showingOriginal ? "Original source" : title}
          </h2>
          <div
            role="toolbar"
            aria-label="Note actions"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              fontFamily: "var(--font-ui)",
              flex: "0 1 auto",
              justifyContent: "flex-end",
            }}
          >
            <ActionButton
              onClick={onToggleOriginal}
              disabled={working}
              icon={
                showingOriginal ? (
                  <RotateCcw size={18} strokeWidth={2} />
                ) : (
                  <FileText size={18} strokeWidth={2} />
                )
              }
              label={showingOriginal ? "Show clarified" : "Show original"}
              pressed={showingOriginal}
            />
            {listening ? (
              <div
                role="group"
                aria-label="Listening controls"
                className="listen-controls"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.15rem",
                  borderRadius: "0.6rem",
                  background: "var(--color-action-soft)",
                  border: "1px solid var(--color-action-border)",
                }}
              >
                <ActionButton
                  onClick={() => onTogglePause?.()}
                  icon={
                    listenPaused ? (
                      <Play size={18} strokeWidth={2} />
                    ) : (
                      <Pause size={18} strokeWidth={2} />
                    )
                  }
                  label={listenPaused ? "Resume" : "Pause"}
                  compact
                />
                <ActionButton
                  onClick={() => onCycleRate?.()}
                  icon={<Gauge size={18} strokeWidth={2} />}
                  label={rateLabel}
                  ariaLabel={`Reading speed ${rateLabel}. Change speed`}
                  compact
                />
                <ActionButton
                  onClick={onToggleListen}
                  icon={<Square size={16} strokeWidth={2.25} />}
                  label="Stop"
                  compact
                />
              </div>
            ) : (
              <ActionButton
                onClick={onToggleListen}
                disabled={!canListen}
                icon={<Ear size={18} strokeWidth={2} />}
                label="Listen"
              />
            )}
          </div>
        </div>
        <p
          className="font-ui"
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9375rem",
            lineHeight: 1.45,
            color: caution ? "var(--color-warning)" : "var(--color-ink-muted)",
          }}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block size-2 shrink-0 rounded-full",
              working && "animate-pulse bg-ink-subtle motion-reduce:animate-none",
              !working && caution && "bg-warning-border",
              !working && pass && "bg-pass",
              !working && !caution && !pass && "bg-ink-subtle",
            )}
          />
          {statusLine}
        </p>
        {caution && !working && onJumpToChecks ? (
          <button
            type="button"
            onClick={onJumpToChecks}
            className="note-jump-checks font-ui cursor-pointer transition-[background-color,transform] duration-150 ease-out hover:bg-warning-soft active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transition-none"
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.4rem",
              alignSelf: "flex-start",
              minHeight: 40,
              padding: "0.35rem 0.8rem 0.35rem 0.7rem",
              borderRadius: 999,
              border: "1px solid var(--color-warning-border)",
              background:
                "color-mix(in srgb, var(--color-warning-soft) 70%, transparent)",
              color: "var(--color-warning)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            See what was flagged
            <ArrowDown aria-hidden size={14} strokeWidth={2.25} />
          </button>
        ) : null}
      </header>

      <AdaptedText
        text={adaptedText}
        marks={marks}
        selectedIndex={selectedIndex}
        onSelectMark={onSelectMark}
        showingOriginal={showingOriginal}
        originalText={originalText}
        working={working}
        spoken={listening ? spoken : null}
        originalHighlight={originalHighlight}
      />
      <style>{`
        @media (max-width: 860px) {
          .note-jump-checks { display: inline-flex !important; }
        }
      `}</style>
    </article>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  disabled,
  pressed,
  compact,
  ariaLabel,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  pressed?: boolean;
  /** Tighter padding for grouped controls. */
  compact?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      className={cn(
        // Quiet by default: the note title owns this row, controls read as tools.
        "group font-ui inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[0.8125rem] font-medium",
        compact ? "px-2.5" : "px-3",
        "transition-[background-color,border-color,color,transform] duration-150 ease-out motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "enabled:active:translate-y-px",
        pressed
          ? "border-action-border bg-action-soft text-ink enabled:hover:bg-action-soft"
          : "border-transparent bg-transparent text-ink-muted enabled:hover:border-paper-inset enabled:hover:bg-paper-inset enabled:hover:text-ink",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex [&_svg]:size-4",
          pressed ? "text-action" : "text-ink-subtle group-hover:text-action",
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
