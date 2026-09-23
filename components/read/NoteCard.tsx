"use client";

import type { ReactNode } from "react";
import { Ear, EarOff, FileText, RotateCcw } from "lucide-react";
import type { Check } from "@/lib/domain";
import { cn } from "@/lib/utils";
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
  working?: boolean;
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
}: NoteCardProps) {
  const caution =
    overallStatus === "warning" || overallStatus === "repair_required";
  const pass = overallStatus === "pass" && !working;

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
              label={showingOriginal ? "Show adapted" : "Show original"}
              pressed={showingOriginal}
            />
            <ActionButton
              onClick={onToggleListen}
              disabled={!canListen}
              icon={
                listening ? (
                  <EarOff size={18} strokeWidth={2} />
                ) : (
                  <Ear size={18} strokeWidth={2} />
                )
              }
              label={listening ? "Stop" : "Listen"}
              pressed={listening}
            />
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
      </header>

      <AdaptedText
        text={adaptedText}
        marks={marks}
        selectedIndex={selectedIndex}
        onSelectMark={onSelectMark}
        showingOriginal={showingOriginal}
        originalText={originalText}
        working={working}
      />
    </article>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  disabled,
  pressed,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={cn(
        // Quiet by default: the note title owns this row, controls read as tools.
        "group font-ui inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.8125rem] font-medium",
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
