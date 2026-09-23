"use client";

import type { ReactNode } from "react";
import { Ear, EarOff, FileText, RotateCcw } from "lucide-react";
import type { Check } from "@/lib/domain";
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
        padding: "1.5rem 1.6rem 1.35rem",
        background: "var(--color-paper-raised)",
        border: "1px solid var(--color-paper-inset)",
        borderRadius: "0.65rem",
        boxShadow: "0 1px 0 color-mix(in srgb, var(--color-ink) 5%, transparent)",
        minWidth: 0,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "1.35rem",
            fontWeight: 650,
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "0.9375rem",
            color: caution ? "var(--color-warning)" : "var(--color-ink-muted)",
          }}
        >
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
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontFamily: "var(--font-ui)",
          paddingTop: "0.25rem",
        }}
      >
        <ActionButton
          onClick={onToggleOriginal}
          icon={showingOriginal ? <RotateCcw size={16} /> : <FileText size={16} />}
          label={showingOriginal ? "Show adapted" : "Show original"}
        />
        <ActionButton
          onClick={onToggleListen}
          disabled={!canListen}
          icon={listening ? <EarOff size={16} /> : <Ear size={16} />}
          label={listening ? "Stop" : "Listen"}
          pressed={listening}
        />
      </div>
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.45rem 0.85rem",
        borderRadius: "0.4rem",
        border: pressed
          ? "1.5px solid var(--color-action-border)"
          : "1.5px solid var(--color-paper-inset)",
        background: pressed
          ? "var(--color-action-soft)"
          : "var(--color-paper)",
        color: "var(--color-ink)",
        fontSize: "0.875rem",
        fontWeight: 550,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--font-ui)",
      }}
    >
      <span aria-hidden style={{ display: "inline-flex", color: "var(--color-action)" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
