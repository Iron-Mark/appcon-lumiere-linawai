import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AdaptRequestError, adapt } from "@/lib/adapt";
import type {
  AdaptResponse,
  Detail,
  Preferences,
  Wording,
  Delivery,
} from "@/lib/domain";
import { Sindi, type SindiState } from "@/components/sindi";
import {
  enableOrigin,
  getPreferences,
  isAutoAdaptEnabled,
  savePreferences,
  type ExtensionPreferences,
} from "../storage/preferences";
import {
  getReadingComfort,
  saveReadingComfort,
} from "../storage/reading-comfort";
import {
  DEFAULT_READING_COMFORT,
  normalizeReadingComfort,
  readingTextStyleVars,
  type ReadingComfort,
  type ReadingFace,
  type ReadingTone,
  type SpacingStep,
  type TypeSize,
} from "../reading-comfort/defaults";
import {
  holdOffPageReading,
  isPageReadingActive,
  onPageFocusIndex,
  pageFocusBlocks,
  releasePageReadingHold,
  setPageFocus,
  shouldReplacePageWords,
  showClarifiedText,
  syncPageReading,
} from "./page-reading";
import { findMainContentRoot } from "./extractor";
import { getListenSettings, saveListenSettings } from "../storage/listen";
import {
  DEVICE_VOICE_ID,
  deviceVoiceName,
  LINAW_VOICE_ID,
  rankListenVoices,
} from "@/lib/listen/rank";
import { speakLinawVoice, stopLinawVoice } from "@/lib/listen/linaw-voice";
import { extensionLinawTts } from "./linaw-sandbox";
import {
  applyListenSettings,
  DEFAULT_LISTEN_SETTINGS,
  LISTEN_PITCHES,
  LISTEN_RATES,
  PITCH_LABELS,
  type ListenSettings,
  type ListenVoice,
} from "@/lib/listen/settings";
import { splitDeadlineMarks } from "../reading-comfort/deadline-marks";
import {
  clampFocusLine,
  splitReadingLines,
} from "../reading-comfort/focus-line";

const LINAW_PROD_READ_URL = "https://appcon-lumiere-linawai.vercel.app/read";

/** Open the Linaw app the companion is actually talking to: local dev stays local. */
function webAppReadUrl(): string {
  try {
    const origin = window.location.origin;
    if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") {
      return `${origin}/read`;
    }
  } catch {
    // Fall through to production.
  }
  return LINAW_PROD_READ_URL;
}

export type PanelProps = {
  source: string;
  preferences: Preferences;
  onPreferencesChange: (next: Preferences) => void;
  onAdaptSelection?: () => void;
  onClose?: () => void;
  onDisableSite: () => void;
  origin: string;
  /** Auto-Clarify, or a selection that sits inside the main article. */
  replaceOnPage?: boolean;
};

type ViewMode = "adapted" | "original";

function modeSummary(prefs: Preferences): string {
  const detail = prefs.detail === "full" ? "Full text" : "Key points";
  const wording =
    prefs.wording === "original"
      ? "Original wording"
      : prefs.wording === "taglish"
        ? "Taglish"
        : "Plain language";
  const delivery = prefs.delivery === "listen" ? "Listen" : "Read";
  return `${detail} • ${wording} • ${delivery}`;
}

function sindiStateFor(opts: {
  working: boolean;
  listening: boolean;
  response: AdaptResponse | null;
  isDisabled: boolean;
}): SindiState {
  if (opts.isDisabled) return "empty";
  if (opts.working) return "working";
  if (opts.listening) return "listening";
  if (!opts.response) return "empty";
  if (opts.response.overallStatus === "pass") return "pass";
  if (
    opts.response.overallStatus === "warning" ||
    opts.response.overallStatus === "repair_required"
  ) {
    return "warning";
  }
  return "reading";
}

function sindiLineFor(
  state: SindiState,
  response: AdaptResponse | null,
  isDisabled: boolean,
): string | undefined {
  if (isDisabled) return "Linaw disabled on this site.";
  if (state === "working") return "Clarifying…";
  if (state === "listening") return "Reading aloud…";
  if (state === "pass" && response?.adapter === "model") {
    return "Clarified by the model, then checked.";
  }
  if (state === "pass" && response?.adapter === "fixture") {
    return "Offline example. Start Linaw on this computer for Gemini, then Pandev.";
  }
  if (state === "pass") return "No issue found in these checks.";
  if (state === "warning") {
    const warn = response?.checks.find(
      (c) => c.status === "warning" || c.status === "repair_required",
    );
    return (
      warn?.reason ||
      "Important condition may have changed. Review source."
    );
  }
  if (state === "empty" || state === "prompt") {
    return "Select text or turn on Auto-Clarify.";
  }
  return "";
}

function statusPillInfo(
  overall: AdaptResponse["overallStatus"] | null,
  working: boolean,
  isDisabled: boolean,
): { icon: string; text: string; isWarning: boolean } {
  if (isDisabled) {
    return { icon: "⏸", text: "Disabled on this site", isWarning: true };
  }
  if (working) {
    return { icon: "⏳", text: "Clarifying…", isWarning: false };
  }
  if (!overall) {
    return { icon: "✔", text: "Using your saved preferences", isWarning: false };
  }
  if (overall === "pass") {
    return { icon: "✔", text: "Meaning checked", isWarning: false };
  }
  if (overall === "warning" || overall === "repair_required") {
    return { icon: "⚠", text: "Important condition changed", isWarning: true };
  }
  return { icon: "✔", text: "Using your saved preferences", isWarning: false };
}

function MarkedLine({ text }: { text: string }) {
  const segments = splitDeadlineMarks(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.marked ? (
          <mark key={i} className="linaw-deadline-mark">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

function ReadingBody({
  text,
  asBullets,
  focusLine,
  focusIndex,
  onFocusLine,
}: {
  text: string;
  asBullets: boolean;
  focusLine: boolean;
  focusIndex: number;
  onFocusLine: (index: number) => void;
}) {
  const lines = splitReadingLines(text);
  if (lines.length === 0) {
    return <p className="linaw-paragraph">—</p>;
  }

  if (asBullets || (focusLine && lines.length > 1)) {
    const ListTag = asBullets ? "ul" : "div";
    const ItemTag = asBullets ? "li" : "p";
    return (
      <ListTag
        className={asBullets ? "linaw-bullet-list" : "linaw-focus-lines"}
      >
        {lines.map((line, idx) => (
          <ItemTag
            key={idx}
            className={[
              asBullets ? "linaw-bullet-item" : "linaw-paragraph",
              focusLine && idx === focusIndex ? "linaw-focus-line" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={
              focusLine
                ? () => {
                    onFocusLine(idx);
                  }
                : undefined
            }
            role={focusLine ? "button" : undefined}
            tabIndex={focusLine ? 0 : undefined}
            onKeyDown={
              focusLine
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onFocusLine(idx);
                    }
                  }
                : undefined
            }
            aria-current={focusLine && idx === focusIndex ? "true" : undefined}
          >
            <MarkedLine text={line} />
          </ItemTag>
        ))}
      </ListTag>
    );
  }

  return (
    <p
      className={[
        "linaw-paragraph",
        focusLine ? "linaw-focus-line" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MarkedLine text={text} />
    </p>
  );
}

function Segmented<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  const groupId = `linaw-${name}`;
  return (
    <div className="linaw-comfort-row" role="group" aria-labelledby={`${groupId}-label`}>
      <span id={`${groupId}-label`} className="linaw-settings-label">
        {label}
      </span>
      <div className="linaw-segment">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            id={`${groupId}-${opt.value}`}
            name={name}
            className={`linaw-segment-btn ${value === opt.value ? "is-active" : ""}`}
            aria-pressed={value === opt.value}
            aria-label={`${label}: ${opt.label}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Panel({
  source,
  preferences,
  onPreferencesChange,
  onAdaptSelection: _onAdaptSelection,
  onClose,
  onDisableSite,
  origin,
  replaceOnPage = false,
}: PanelProps) {
  const titleId = useId();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AdaptResponse | null>(null);
  const [view, setView] = useState<ViewMode>("adapted");
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [comfort, setComfort] = useState<ReadingComfort>(DEFAULT_READING_COMFORT);
  const [focusIndex, setFocusIndex] = useState(0);
  const [pageOn, setPageOn] = useState(false);
  const [listenSettings, setListenSettings] = useState<ListenSettings>(
    DEFAULT_LISTEN_SETTINGS,
  );
  const [listenVoices, setListenVoices] = useState<ListenVoice[]>([]);
  const [listenNote, setListenNote] = useState<string | null>(null);
  const [pageFeedback, setPageFeedback] = useState<string | null>(null);

  const sourceRef = useRef(source);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const comfortRef = useRef(comfort);
  const listenRef = useRef(listenSettings);
  const voicesRef = useRef(listenVoices);
  const listenGen = useRef(0);
  const adaptGen = useRef(0);

  sourceRef.current = source;
  comfortRef.current = comfort;
  listenRef.current = listenSettings;
  voicesRef.current = listenVoices;

  const disabledOrigins: string[] =
    (preferences as Partial<ExtensionPreferences>).disabledOrigins ?? [];
  const isCurrentOriginDisabled =
    Boolean(origin) && disabledOrigins.includes(origin);

  useEffect(() => {
    // Storage rejects when the extension was just reloaded (old tab).
    // Swallow it: the panel still renders, just with defaults.
    void getReadingComfort().then((saved) => {
      comfortRef.current = saved;
      setComfort(saved);
      if (isCurrentOriginDisabled) {
        syncPageReading(saved, { disabled: true });
        setPageOn(false);
        return;
      }
      syncPageReading(saved);
      setPageOn(isPageReadingActive());
    }).catch(() => {
      // Extension reloaded under this tab — refresh the page for full function.
    });
  }, [isCurrentOriginDisabled]);

  useEffect(() => {
    void getListenSettings().then(setListenSettings).catch(() => {
      // Extension reloaded under this tab — voices stay default.
    });
    const refresh = () => {
      const listed = rankListenVoices(
        window.speechSynthesis
          .getVoices()
          .filter((voice) => voice.voiceURI)
          .map((voice) => ({
            voiceURI: voice.voiceURI,
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
          })),
      );
      setListenVoices(listed);
    };
    if (typeof window !== "undefined" && window.speechSynthesis) {
      refresh();
      window.speechSynthesis.addEventListener("voiceschanged", refresh);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
    }
    return undefined;
  }, []);

  useEffect(() => onPageFocusIndex(setFocusIndex), []);

  useEffect(() => {
    if (!comfort.focusLine || !isPageReadingActive()) return;
    setPageFocus(focusIndex);
  }, [focusIndex, comfort.focusLine]);

  const runAdapt = async (nextPrefs: Preferences, nextSource: string) => {
    const trimmed = nextSource.trim();
    if (!trimmed) {
      adaptGen.current += 1;
      setError("Nothing to clarify yet. Select text on the page first.");
      setResponse(null);
      setWorking(false);
      return;
    }
    const gen = adaptGen.current + 1;
    adaptGen.current = gen;
    setWorking(true);
    setError(null);
    setView("adapted");
    setFocusIndex(0);
    stopSpeech();
    try {
      const result = await adapt({
        source: trimmed,
        preferences: nextPrefs,
      });
      if (gen !== adaptGen.current) return;
      setResponse(result);
      if (shouldReplacePageWords(result.adapter, replaceOnPage)) {
        const root = findMainContentRoot(document);
        if (root) showClarifiedText(root, result.adaptedText);
      }
    } catch (err) {
      if (gen !== adaptGen.current) return;
      const message =
        err instanceof AdaptRequestError && err.message.trim()
          ? err.message.trim()
          : "Clarification could not finish. Try again.";
      setError(message);
      setResponse(null);
    } finally {
      if (gen === adaptGen.current) setWorking(false);
    }
  };

  useEffect(() => {
    if (!isCurrentOriginDisabled) {
      void runAdapt(preferences, source);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runAdapt handles preference updates via controls
  }, [source, isCurrentOriginDisabled]);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  function spokenUtterance(text: string): SpeechSynthesisUtterance {
    const utter = new SpeechSynthesisUtterance(text);
    const applied = { rate: 1, pitch: 1, voice: null as ListenVoice | null };
    applyListenSettings(applied, listenRef.current, voicesRef.current);
    utter.rate = applied.rate;
    utter.pitch = applied.pitch;
    if (applied.voice && typeof window !== "undefined" && window.speechSynthesis) {
      const match = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.voiceURI === applied.voice?.voiceURI);
      if (match) utter.voice = match;
    }
    return utter;
  }

  function stopSpeech() {
    listenGen.current += 1;
    stopLinawVoice();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setListening(false);
  }

  function listenDisplayed() {
    const plainText =
      view === "original" ? source : (response?.adaptedText ?? source);
    const useFocus = comfortRef.current.focusLine;
    const pageBlocks =
      useFocus && isPageReadingActive() ? pageFocusBlocks() : [];
    if (!plainText.trim() && pageBlocks.length === 0) return;
    stopSpeech();
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Speech is not available in this browser.");
      return;
    }

    if (listenRef.current.voiceURI === LINAW_VOICE_ID) {
      const gen = listenGen.current;
      setListening(true);
      setListenNote(null);
      void speakLinawVoice(plainText, listenRef.current.rate, listenRef.current.pitch, {
        onNote: setListenNote,
        load: async () => extensionLinawTts(),
      }).then((ok) => {
        if (gen !== listenGen.current) return;
        if (!ok) {
          listenWithDevice();
          return;
        }
        setListening(false);
      }).catch(() => {
        if (gen !== listenGen.current) return;
        setListenNote("Linaw voice was blocked — using device voice.");
        listenWithDevice();
      });
      return;
    }

    listenWithDevice();

    function listenWithDevice() {
    if (useFocus && pageBlocks.length > 0) {
      const index = clampFocusLine(focusIndex, pageBlocks.length);
      setListening(true);
      const speakAt = (i: number) => {
        if (i >= pageBlocks.length) {
          setListening(false);
          utteranceRef.current = null;
          return;
        }
        const next = setPageFocus(i);
        setFocusIndex(next);
        const line = (pageBlocks[next]?.textContent ?? "").replace(/\s+/g, " ").trim();
        const utter = spokenUtterance(line);
        utter.onend = () => {
          speakAt(next + 1);
        };
        utter.onerror = () => {
          setListening(false);
          utteranceRef.current = null;
        };
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
      };
      speakAt(index);
      return;
    }
    const lines = splitReadingLines(plainText);

    if (useFocus && lines.length > 1) {
      let index = clampFocusLine(focusIndex, lines.length);
      setListening(true);

      const speakAt = (i: number) => {
        if (i >= lines.length) {
          setListening(false);
          utteranceRef.current = null;
          return;
        }
        setFocusIndex(i);
        const utter = spokenUtterance(lines[i] ?? "");
        utter.onend = () => {
          speakAt(i + 1);
        };
        utter.onerror = () => {
          setListening(false);
          utteranceRef.current = null;
        };
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
      };

      speakAt(index);
      return;
    }

    const utter = spokenUtterance(plainText);
    utter.onend = () => {
      setListening(false);
      utteranceRef.current = null;
    };
    utter.onerror = () => {
      setListening(false);
      utteranceRef.current = null;
    };
    utteranceRef.current = utter;
    setListening(true);
    window.speechSynthesis.speak(utter);
    }
  }

  async function updatePrefs(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    let saved: Preferences = next;
    try {
      saved = await savePreferences(next);
    } catch {
      // Storage dead (extension reloaded) — clarify with in-memory prefs.
    }
    try {
      onPreferencesChange(saved);
    } catch {
      // Host torn down.
    }
    if (!isCurrentOriginDisabled) {
      await runAdapt(saved, sourceRef.current);
    }
  }

  async function updateComfort(patch: Partial<ReadingComfort>) {
    const next = normalizeReadingComfort({ ...comfortRef.current, ...patch });
    comfortRef.current = next;
    setComfort(next);
    setPageFeedback(null);
    let saved = next;
    try {
      saved = await saveReadingComfort(patch, next);
    } catch {
      // Storage dead (extension reloaded) — apply in-memory only.
    }
    comfortRef.current = saved;
    setComfort(saved);
    const touchesPage = Object.keys(patch).some((key) => key !== "listenPace");
    if (!touchesPage || isCurrentOriginDisabled) return;
    releasePageReadingHold();
    try {
      syncPageReading(saved);
    } catch {
      // Page DOM not styleable here.
    }
    try {
      setPageOn(isPageReadingActive());
    } catch {
      // Host torn down.
    }
  }

  async function handleEnableSite(site: string) {
    try {
      await enableOrigin(site);
      const updated = await getPreferences();
      onPreferencesChange(updated);
      if (site === origin) {
        await runAdapt(updated, sourceRef.current);
      }
    } catch {
      // Storage dead (extension reloaded) — refresh the page and retry.
    }
  }

  const sindiState = sindiStateFor({
    working,
    listening,
    response,
    isDisabled: isCurrentOriginDisabled,
  });
  const pillInfo = statusPillInfo(
    response?.overallStatus ?? null,
    working,
    isCurrentOriginDisabled,
  );

  // Plain string for Copy / Meaning Check — never HTML from deadline marks.
  const plainDisplayedText =
    view === "original" ? source : (response?.adaptedText ?? source);
  const bulletItems = plainDisplayedText
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const showAsBullets =
    view === "adapted" &&
    (preferences.detail === "key_points" || bulletItems.length > 1);

  const rawTitle =
    response?.meaningMap?.sourceIntent ||
    (typeof document !== "undefined" && document.title
      ? document.title
      : "Selected content");
  // Site chrome titles (e.g. "YouTube") are not content titles — cap length.
  const docTitle =
    rawTitle.length > 120 ? `${rawTitle.slice(0, 117).trimEnd()}…` : rawTitle;

  const readingStyle = readingTextStyleVars(comfort) as CSSProperties;

  return (
    <div
      className="linaw-panel"
      role="dialog"
      aria-labelledby={titleId}
    >
      <header className="linaw-header">
        <div className="linaw-header-left">
          <div className="linaw-sindi-wrap">
            <Sindi
              state={sindiState}
              line={sindiLineFor(sindiState, response, isCurrentOriginDisabled)}
              className="linaw-sindi"
            />
          </div>
          <h1 id={titleId} className="linaw-brand-title">
            Linaw
          </h1>
        </div>
        {onClose && (
          <button
            type="button"
            id="linaw-close-btn"
            name="linaw-close-btn"
            className="linaw-close-btn"
            onClick={onClose}
            aria-label="Close Linaw panel"
            title="Close panel"
          >
            ✕
          </button>
        )}
      </header>

      {isCurrentOriginDisabled && (
        <div className="linaw-disabled-banner" role="alert">
          <p className="linaw-disabled-banner-text">
            Linaw is currently disabled on this site ({origin}).
          </p>
          <button
            type="button"
            id="linaw-enable-site-primary-btn"
            name="linaw-enable-site-primary-btn"
            className="linaw-enable-primary-btn"
            onClick={() => void handleEnableSite(origin)}
          >
            Enable Linaw on this site
          </button>
        </div>
      )}

      <div
        className={`linaw-status-pill ${
          pillInfo.isWarning ? "is-warning" : "is-pass"
        }`}
      >
        <div className="linaw-status-pill-left">
          <span
            className={`linaw-status-pill-badge ${
              pillInfo.isWarning ? "is-warning" : "is-pass"
            }`}
          >
            {pillInfo.icon}
          </span>
          <div className="linaw-status-pill-text">
            <span className="linaw-status-pill-title">{pillInfo.text}</span>
            <span className="linaw-status-pill-subtitle">
              {modeSummary(preferences)}
            </span>
          </div>
        </div>
        <button
          type="button"
          id="linaw-gear-btn"
          name="linaw-gear-btn"
          className={`linaw-gear-btn ${settingsOpen ? "is-active" : ""}`}
          onClick={() => setSettingsOpen((open) => !open)}
          aria-label="Toggle settings"
          aria-expanded={settingsOpen}
          title="Adjust preferences"
        >
          ⚙
        </button>
      </div>

      {settingsOpen && (
        <div
          className="linaw-settings-drawer"
          role="region"
          aria-label="Preferences configuration"
        >
          <div className="linaw-settings-row">
            <label htmlFor="linaw-detail-select" className="linaw-settings-label">
              Detail
            </label>
            <select
              id="linaw-detail-select"
              name="detail"
              className="linaw-select"
              value={preferences.detail}
              onChange={(e) =>
                void updatePrefs({ detail: e.target.value as Detail })
              }
            >
              <option value="key_points">Key points</option>
              <option value="full">Full text</option>
            </select>
          </div>

          <div className="linaw-settings-row">
            <label htmlFor="linaw-wording-select" className="linaw-settings-label">
              Wording
            </label>
            <select
              id="linaw-wording-select"
              name="wording"
              className="linaw-select"
              value={preferences.wording}
              onChange={(e) =>
                void updatePrefs({ wording: e.target.value as Wording })
              }
            >
              <option value="plain">Plain language</option>
              <option value="taglish">Taglish</option>
              <option value="original">Original wording</option>
            </select>
          </div>

          <div className="linaw-settings-row">
            <label htmlFor="linaw-delivery-select" className="linaw-settings-label">
              Delivery
            </label>
            <select
              id="linaw-delivery-select"
              name="delivery"
              className="linaw-select"
              value={preferences.delivery}
              onChange={(e) =>
                void updatePrefs({ delivery: e.target.value as Delivery })
              }
            >
              <option value="read">Read</option>
              <option value="listen">Listen</option>
            </select>
          </div>

          <div className="linaw-settings-row">
            <label htmlFor="linaw-autoadapt-select" className="linaw-settings-label">
              Auto-Clarify
            </label>
            <select
              id="linaw-autoadapt-select"
              name="browserBehavior"
              className="linaw-select"
              value={isAutoAdaptEnabled(preferences) ? "auto_adapt" : "manual"}
              onChange={(e) =>
                void updatePrefs({
                  browserBehavior:
                    e.target.value === "auto_adapt" ? "auto_adapt" : "manual",
                })
              }
            >
              <option value="manual">Off (manual only)</option>
              <option value="auto_adapt">On (auto-clarify)</option>
            </select>
          </div>

          <div className="linaw-disabled-sites-section">
            <span className="linaw-settings-label">Disabled Sites</span>
            {disabledOrigins.length === 0 ? (
              <p className="linaw-empty-text">No sites currently disabled.</p>
            ) : (
              <ul className="linaw-disabled-list">
                {disabledOrigins.map((site) => (
                  <li key={site} className="linaw-disabled-item">
                    <span className="linaw-disabled-origin" title={site}>
                      {site}
                    </span>
                    <button
                      type="button"
                      id={`linaw-remove-${site.replace(/[^a-zA-Z0-9]/g, "-")}`}
                      name="linaw-remove-disabled"
                      className="linaw-remove-btn"
                      onClick={() => void handleEnableSite(site)}
                      aria-label={`Enable Linaw on ${site}`}
                    >
                      ✕ Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="linaw-settings-links">
            <a
              id="linaw-webapp-link"
              className="linaw-text-link"
              href={webAppReadUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in web app ↗
            </a>
            {isCurrentOriginDisabled ? (
              <button
                type="button"
                id="linaw-enable-site-btn"
                name="linaw-enable-site-btn"
                className="linaw-text-link"
                onClick={() => void handleEnableSite(origin)}
              >
                Enable on this site
              </button>
            ) : (
              <button
                type="button"
                id="linaw-disable-site-btn"
                name="linaw-disable-site-btn"
                className="linaw-text-link"
                onClick={onDisableSite}
              >
                Disable on this site
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reading comfort — extension-only; under mode controls */}
      {!isCurrentOriginDisabled && (
        <details className="linaw-reading-disclosure">
          <summary className="linaw-reading-summary">Reading</summary>
          <div className="linaw-reading-controls">
            <div className="linaw-page-actions">
              <button
                type="button"
                id="linaw-on-this-page"
                name="on-this-page"
                className={`linaw-segment-btn ${pageOn ? "is-active" : ""}`}
                aria-pressed={pageOn}
                onClick={() => {
                  try {
                    syncPageReading(comfortRef.current, { force: true });
                    const on = isPageReadingActive();
                    setPageOn(on);
                    setPageFeedback(
                      on
                        ? "✓ Reading look applied to this page."
                        : "No article found on this page to style.",
                    );
                  } catch {
                    setPageFeedback("Could not style this page.");
                  }
                }}
              >
                {pageOn ? "✓ On this page" : "On this page"}
              </button>
              <button
                type="button"
                id="linaw-page-as-it-was"
                name="page-as-it-was"
                className="linaw-segment-btn"
                onClick={() => {
                  try {
                    holdOffPageReading();
                  } catch {
                    // Page already plain.
                  }
                  setPageOn(false);
                  setPageFeedback("Page restored to its original look.");
                }}
              >
                Page as it was
              </button>
            </div>
            {pageFeedback ? (
              <p className="linaw-page-feedback" role="status">
                {pageFeedback}
              </p>
            ) : null}
            <Segmented<TypeSize>
              name="type-size"
              label="Type size"
              value={comfort.typeSize}
              options={[
                { value: "smaller", label: "Smaller" },
                { value: "default", label: "Default" },
                { value: "larger", label: "Larger" },
              ]}
              onChange={(typeSize) => void updateComfort({ typeSize })}
            />
            <Segmented<SpacingStep>
              name="line-spacing"
              label="Line spacing"
              value={comfort.lineSpacing}
              options={[
                { value: "tighter", label: "Tighter" },
                { value: "default", label: "Default" },
                { value: "roomier", label: "Roomier" },
              ]}
              onChange={(lineSpacing) => void updateComfort({ lineSpacing })}
            />
            <Segmented<SpacingStep>
              name="letter-spacing"
              label="Letter spacing"
              value={comfort.letterSpacing}
              options={[
                { value: "tighter", label: "Tighter" },
                { value: "default", label: "Default" },
                { value: "roomier", label: "Roomier" },
              ]}
              onChange={(letterSpacing) => void updateComfort({ letterSpacing })}
            />
            <Segmented<SpacingStep>
              name="word-spacing"
              label="Word spacing"
              value={comfort.wordSpacing}
              options={[
                { value: "tighter", label: "Tighter" },
                { value: "default", label: "Default" },
                { value: "roomier", label: "Roomier" },
              ]}
              onChange={(wordSpacing) => void updateComfort({ wordSpacing })}
            />
            <Segmented<ReadingFace>
              name="reading-face"
              label="Reading face"
              value={comfort.face}
              options={[
                { value: "default", label: "Default" },
                { value: "clear", label: "Clear" },
              ]}
              onChange={(face) => void updateComfort({ face })}
            />
            <Segmented<ReadingTone>
              name="reading-tone"
              label="Tone"
              value={comfort.tone}
              options={[
                { value: "paper", label: "Paper" },
                { value: "soft", label: "Soft" },
                { value: "strong", label: "Strong" },
              ]}
              onChange={(tone) => void updateComfort({ tone })}
            />
            <div className="linaw-comfort-row">
              <span className="linaw-settings-label" id="linaw-focus-line-label">
                Focus line
              </span>
              <button
                type="button"
                id="linaw-focus-line-toggle"
                name="focus-line"
                className={`linaw-segment-btn linaw-toggle-btn ${comfort.focusLine ? "is-active" : ""}`}
                aria-pressed={comfort.focusLine}
                aria-labelledby="linaw-focus-line-label"
                onClick={() => {
                  void updateComfort({ focusLine: !comfort.focusLine });
                  setFocusIndex(0);
                }}
              >
                {comfort.focusLine ? "On" : "Off"}
              </button>
            </div>
          </div>
        </details>
      )}

      {!isCurrentOriginDisabled && (
        <section className="linaw-reading-section" aria-live="polite">
          <div className="linaw-reading-header">
            <span className="linaw-reading-badge">
              {view === "adapted" ? "Simplified version" : "Original source"}
            </span>
            <button
              type="button"
              id="linaw-toggle-original-btn"
              name="linaw-toggle-original-btn"
              className="linaw-toggle-original-btn"
              onClick={() => {
                setView((v) => (v === "adapted" ? "original" : "adapted"));
                setFocusIndex(0);
              }}
            >
              {view === "adapted" ? "Show original" : "Show clarified"}
            </button>
          </div>

          <h2 className="linaw-doc-title">{docTitle}</h2>

          <div className={`linaw-content-card linaw-reading-text${working ? " is-working" : ""}`} style={readingStyle} aria-busy={working}>
            {error ? (
              <p className="linaw-error">{error}</p>
            ) : working && !response ? (
              <p className="linaw-loading">Clarifying…</p>
            ) : (
              <ReadingBody
                text={plainDisplayedText || "—"}
                asBullets={showAsBullets && view === "adapted"}
                focusLine={comfort.focusLine}
                focusIndex={focusIndex}
                onFocusLine={setFocusIndex}
              />
            )}

            {working && response && !error ? (
              <p className="linaw-loading" role="status">Clarifying with your new settings…</p>
            ) : null}

            {response?.overallStatus === "warning" && (
              <p className="linaw-check-warning">
                ⚠ Important condition may have changed. Review source above.
              </p>
            )}

            {replaceOnPage && response?.adapter === "fixture" && !error ? (
              <p className="linaw-check-warning">
                Offline example — the page was not replaced. Start Linaw on this computer for live replacement.
              </p>
            ) : null}
          </div>
        </section>
      )}

      {!isCurrentOriginDisabled && (
        <div className="linaw-action-bar">
          <button
            type="button"
            id="linaw-copy-btn"
            name="linaw-copy-btn"
            className="linaw-copy-btn"
            onClick={() => {
              const textToCopy = plainDisplayedText;
              if (!textToCopy) return;
              void navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }).catch(() => {
                setError("Copy was blocked by the browser — select the text manually.");
              });
            }}
          >
            {copied ? (
              <>
                <svg
                  className="linaw-btn-svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="linaw-btn-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>

          <div className="linaw-listen-group">
            <details className="linaw-voice-disclosure">
              <summary className="linaw-voice-summary">Voice & pace</summary>
              <div className="linaw-voice-controls">
            <label className="linaw-settings-label" htmlFor="linaw-listen-voice">
              Voice
            </label>
            <select
              id="linaw-listen-voice"
              className="linaw-segment-btn"
              aria-label="Voice"
              value={listenSettings.voiceURI}
              onChange={(event) => {
                void saveListenSettings({ voiceURI: event.target.value }).then(
                  setListenSettings,
                );
              }}
            >
              <option value={LINAW_VOICE_ID}>Linaw</option>
              <option value={DEVICE_VOICE_ID}>
                {deviceVoiceName(listenVoices)
                  ? `This device · ${deviceVoiceName(listenVoices)}`
                  : "This device"}
              </option>
              {listenSettings.voiceURI !== LINAW_VOICE_ID
                ? listenVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} · {voice.lang}
                    </option>
                  ))
                : null}
            </select>
            {listenNote ? <p className="linaw-settings-label">{listenNote}</p> : null}
            <div className="linaw-segment" role="group" aria-label="Pitch">
              {LISTEN_PITCHES.map((pitch) => (
                <button
                  key={pitch}
                  type="button"
                  className={`linaw-segment-btn ${listenSettings.pitch === pitch ? "is-active" : ""}`}
                  aria-pressed={listenSettings.pitch === pitch}
                  onClick={() => {
                    void saveListenSettings({ pitch }).then(setListenSettings);
                  }}
                >
                  {PITCH_LABELS[pitch]}
                </button>
              ))}
            </div>
            <div className="linaw-segment linaw-pace-segment" role="group" aria-label="Pace">
              {LISTEN_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`linaw-segment-btn linaw-pace-btn ${listenSettings.rate === rate ? "is-active" : ""}`}
                  aria-pressed={listenSettings.rate === rate}
                  onClick={() => {
                    void saveListenSettings({ rate }).then(setListenSettings);
                  }}
                >
                  {rate}×
                </button>
              ))}
            </div>
              </div>
            </details>
            <button
              type="button"
              id="linaw-listen-btn"
              name="linaw-listen-btn"
              className={`linaw-listen-btn ${listening ? "is-listening" : ""}`}
              onClick={() => {
                if (listening) {
                  stopSpeech();
                } else {
                  listenDisplayed();
                }
              }}
            >
              {listening ? (
                <>
                  <svg
                    className="linaw-btn-svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="5" y="5" width="14" height="14" rx="2" />
                  </svg>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <svg
                    className="linaw-btn-svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {origin ? (
        <footer className="linaw-footer-origin" title={origin}>
          Site: {origin}
        </footer>
      ) : null}
    </div>
  );
}
