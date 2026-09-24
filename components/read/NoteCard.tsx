"use client";

import type { ReactNode } from "react";
import {
  AlignLeft,
  ArrowDown,
  Ear,
  FileText,
  LayoutList,
  Pause,
  Play,
  RotateCcw,
  Square,
  StepForward,
} from "lucide-react";
import type { Check, MeaningMap } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { AdaptedText } from "./AdaptedText";
import { FocusView } from "./FocusView";
import { GlanceView } from "./GlanceView";
import type { TextMark } from "./marks";
import { DEVICE_VOICE_ID, deviceVoiceName, LINAW_VOICE_ID } from "@/lib/listen/rank";
import {
  LISTEN_PITCHES,
  LISTEN_RATES,
  PITCH_LABELS,
  type ListenSettings,
  type ListenVoice,
} from "@/lib/listen/settings";
import type { SpokenRange } from "./useListen";

/** How the note is laid out. Same facts, same checks — different shape. */
export type NoteView = "text" | "glance" | "focus";

export const NOTE_VIEWS: { id: NoteView; label: string; hint: string }[] = [
  { id: "text", label: "Text", hint: "The note as prose" },
  { id: "glance", label: "At a glance", hint: "When, who, and the rules — as a layout" },
  { id: "focus", label: "One at a time", hint: "One step per screen" },
];

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
  listenSettings?: ListenSettings;
  listenVoices?: ListenVoice[];
  onListenChange?: (patch: Partial<ListenSettings>) => void;
  listenNote?: string | null;
  spoken?: SpokenRange | null;
  /** Evidence to highlight in the original view for the selected check. */
  originalHighlight?: { text: string; caution: boolean } | null;
  /** Narrow screens: jump to the Meaning Check rail (stacked below). */
  onJumpToChecks?: () => void;
  /** Layout of the note; needs the Meaning Map + checks for the non-prose views. */
  view?: NoteView;
  onViewChange?: (view: NoteView) => void;
  meaningMap?: MeaningMap | null;
  checks?: Check[] | null;
  onSelectCheck?: (index: number | null) => void;
  /** Focus view reads one step aloud through the parent's speech engine. */
  onSpeakText?: (text: string) => void;
  onStopSpeaking?: () => void;
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
  listenSettings,
  listenVoices = [],
  onListenChange,
  listenNote = null,
  spoken = null,
  originalHighlight = null,
  onJumpToChecks,
  view = "text",
  onViewChange,
  meaningMap = null,
  checks = null,
  onSelectCheck,
  onSpeakText,
  onStopSpeaking,
}: NoteCardProps) {
  const caution =
    overallStatus === "warning" || overallStatus === "repair_required";
  const pass = overallStatus === "pass" && !working;
  const hasStructure =
    Boolean(meaningMap && checks && adaptedText.trim()) && !working;
  const showSwitcher = Boolean(onViewChange) && hasStructure && !showingOriginal;
  const activeView: NoteView = showingOriginal || !hasStructure ? "text" : view;

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
            {canListen && listenSettings && onListenChange ? (
              <ListenMenu
                settings={listenSettings}
                voices={listenVoices}
                onChange={onListenChange}
                note={listenNote}
              />
            ) : null}
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

      {showSwitcher ? (
        <div
          role="tablist"
          aria-label="How to lay out the note"
          className="note-view-switcher font-ui"
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            gap: "0.15rem",
            padding: "0.2rem",
            borderRadius: "0.7rem",
            background: "var(--color-paper-inset)",
            marginTop: "-0.35rem",
          }}
        >
          {NOTE_VIEWS.map((v) => {
            const active = activeView === v.id;
            const Icon =
              v.id === "text" ? AlignLeft : v.id === "glance" ? LayoutList : StepForward;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={v.hint}
                onClick={() => onViewChange?.(v.id)}
                className={cn(
                  "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[0.5rem] px-3 text-[0.8125rem] font-medium transition-[background-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  active
                    ? "bg-paper-raised text-ink shadow-[0_1px_2px_color-mix(in_srgb,var(--color-ink)_10%,transparent)]"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon
                  aria-hidden
                  className={cn("size-4", active ? "text-action" : "text-ink-subtle")}
                  strokeWidth={2}
                />
                {v.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeView === "glance" && meaningMap && checks ? (
        <GlanceView
          meaningMap={meaningMap}
          checks={checks}
          adaptedText={adaptedText}
          selectedIndex={selectedIndex}
          onSelectCheck={(i) => onSelectCheck?.(i)}
        />
      ) : activeView === "focus" && meaningMap && checks ? (
        <FocusView
          adaptedText={adaptedText}
          meaningMap={meaningMap}
          checks={checks}
          onSelectCheck={(i) => onSelectCheck?.(i)}
          onSpeak={(t) => onSpeakText?.(t)}
          onStopSpeaking={() => onStopSpeaking?.()}
          speaking={listening}
        />
      ) : (
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
      )}
      <style>{`
        @media (max-width: 860px) {
          .note-jump-checks { display: inline-flex !important; }
        }
        @media (max-width: 420px) {
          .note-view-switcher { display: flex !important; width: 100%; }
          .note-view-switcher > button { flex: 1 1 0; justify-content: center; padding-inline: 0.5rem; }
        }
      `}</style>
    </article>
  );
}

function ListenMenu({
  settings,
  voices,
  onChange,
  note,
}: {
  settings: ListenSettings;
  voices: ListenVoice[];
  onChange: (patch: Partial<ListenSettings>) => void;
  note?: string | null;
}) {
  const deviceName = deviceVoiceName(voices);
  return (
    <details className="listen-menu font-ui">
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center rounded-lg px-3 text-[0.8125rem] font-medium text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
        Listen options
      </summary>
      <div
        className="listen-menu-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
          marginTop: "0.35rem",
          padding: "0.75rem",
          borderRadius: "0.7rem",
          background: "var(--color-paper-raised)",
          border: "1px solid var(--color-border)",
          minWidth: "16rem",
        }}
      >
        <label className="flex flex-col gap-1 text-[0.8125rem] text-ink">
          Voice
          <select
            value={settings.voiceURI}
            aria-label="Voice"
            className="min-h-11 rounded-md border border-border bg-paper px-2 text-ink"
            onChange={(event) => onChange({ voiceURI: event.target.value })}
          >
            <option value={LINAW_VOICE_ID}>Linaw</option>
            <option value={DEVICE_VOICE_ID}>
              {deviceName ? `This device · ${deviceName}` : "This device"}
            </option>
            {settings.voiceURI !== LINAW_VOICE_ID
              ? voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))
              : null}
          </select>
          {note ? <span className="text-ink-muted">{note}</span> : null}
        </label>
        <div role="group" aria-label="Pitch" className="flex flex-wrap gap-1">
          {LISTEN_PITCHES.map((pitch) => (
            <button
              key={pitch}
              type="button"
              aria-pressed={settings.pitch === pitch}
              className={cn(
                "min-h-11 rounded-md px-3 text-[0.8125rem]",
                settings.pitch === pitch
                  ? "bg-action-soft text-ink"
                  : "text-ink-muted hover:bg-paper-inset",
              )}
              onClick={() => onChange({ pitch })}
            >
              {PITCH_LABELS[pitch]}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Pace" className="flex flex-wrap gap-1">
          {LISTEN_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              aria-pressed={settings.rate === rate}
              className={cn(
                "min-h-11 rounded-md px-3 text-[0.8125rem]",
                settings.rate === rate
                  ? "bg-action-soft text-ink"
                  : "text-ink-muted hover:bg-paper-inset",
              )}
              onClick={() => onChange({ rate })}
            >
              {rate}×
            </button>
          ))}
        </div>
      </div>
    </details>
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
