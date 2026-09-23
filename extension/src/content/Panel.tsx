import { useEffect, useId, useRef, useState } from "react";
import { adapt } from "@/lib/adapt";
import type {
  AdaptResponse,
  Detail,
  Preferences,
  Wording,
  Delivery,
} from "@/lib/domain";
import { Sindi, type SindiState } from "@/components/sindi";
import {
  isAutoAdaptEnabled,
  savePreferences,
} from "../storage/preferences";

const WEB_APP_READ_URL = "http://localhost:3000/read";

export type PanelProps = {
  source: string;
  preferences: Preferences;
  onPreferencesChange: (next: Preferences) => void;
  onAdaptSelection: () => void;
  onClose: () => void;
  onDisableSite: () => void;
  origin: string;
};

type ViewMode = "adapted" | "original";

function modeSummary(prefs: Preferences): string {
  const detail = prefs.detail === "full" ? "Full text" : "Key points";
  const wording = prefs.wording === "original" ? "Original wording" : "Plain language";
  const delivery = prefs.delivery === "listen" ? "Listen" : "Read";
  return `${detail} • ${wording} • ${delivery}`;
}

function sindiStateFor(opts: {
  working: boolean;
  listening: boolean;
  response: AdaptResponse | null;
}): SindiState {
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
): string | undefined {
  if (state === "working") return "Adapting…";
  if (state === "listening") return "Reading aloud…";
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
    return "Select text or turn on Auto-Adapt.";
  }
  return "";
}

function statusPillInfo(
  overall: AdaptResponse["overallStatus"] | null,
  working: boolean,
): { icon: string; text: string; isWarning: boolean } {
  if (working) {
    return { icon: "⏳", text: "Adapting content…", isWarning: false };
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

export function Panel({
  source,
  preferences,
  onPreferencesChange,
  onAdaptSelection: _onAdaptSelection,
  onClose,
  onDisableSite,
  origin,
}: PanelProps) {
  const titleId = useId();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AdaptResponse | null>(null);
  const [view, setView] = useState<ViewMode>("adapted");
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sourceRef = useRef(source);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  sourceRef.current = source;

  const runAdapt = async (nextPrefs: Preferences, nextSource: string) => {
    const trimmed = nextSource.trim();
    if (!trimmed) {
      setError("Nothing to adapt yet. Select text on the page first.");
      setResponse(null);
      return;
    }
    setWorking(true);
    setError(null);
    setView("adapted");
    stopSpeech();
    try {
      const result = await adapt({
        source: trimmed,
        preferences: nextPrefs,
      });
      setResponse(result);
    } catch {
      setError("Adaptation could not finish. Try again.");
      setResponse(null);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    void runAdapt(preferences, source);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runAdapt handles preference updates via controls
  }, [source]);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  function stopSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setListening(false);
  }

  function listenDisplayed() {
    const textToSpeak =
      view === "original" ? source : (response?.adaptedText ?? source);
    if (!textToSpeak.trim()) return;
    stopSpeech();
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Speech is not available in this browser.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(textToSpeak);
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

  async function updatePrefs(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    const saved = await savePreferences(next);
    onPreferencesChange(saved);
    await runAdapt(saved, sourceRef.current);
  }

  const sindiState = sindiStateFor({ working, listening, response });
  const pillInfo = statusPillInfo(response?.overallStatus ?? null, working);

  // Extract structured bullet points if in key_points mode or when content has line breaks
  const rawDisplayedText =
    view === "original" ? source : (response?.adaptedText ?? source);
  const bulletItems = rawDisplayedText
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const showAsBullets =
    view === "adapted" &&
    (preferences.detail === "key_points" || bulletItems.length > 1);

  const docTitle =
    response?.meaningMap?.sourceIntent ||
    (typeof document !== "undefined" && document.title
      ? document.title
      : "Selected content");

  return (
    <div
      className="linaw-panel"
      role="dialog"
      aria-labelledby={titleId}
    >
      {/* Header with Linaw AI title, brand icon, and close button */}
      <header className="linaw-header">
        <div className="linaw-header-left">
          <div className="linaw-sindi-wrap">
            <Sindi
              state={sindiState}
              line={sindiLineFor(sindiState, response)}
              className="linaw-sindi"
            />
          </div>
          <h1 id={titleId} className="linaw-brand-title">
            Linaw AI
          </h1>
        </div>
        <button
          type="button"
          className="linaw-close-btn"
          onClick={onClose}
          aria-label="Close Linaw panel"
          title="Close panel"
        >
          ✕
        </button>
      </header>

      {/* Status Pill: Saved preferences / Meaning checked + summary + Settings gear */}
      <div className="linaw-status-pill">
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
          className={`linaw-gear-btn ${settingsOpen ? "is-active" : ""}`}
          onClick={() => setSettingsOpen((open) => !open)}
          aria-label="Toggle settings"
          title="Adjust preferences"
        >
          ⚙
        </button>
      </div>

      {/* Collapsible Settings Drawer */}
      {settingsOpen && (
        <div
          className="linaw-settings-drawer"
          role="region"
          aria-label="Preferences configuration"
        >
          <div className="linaw-settings-row">
            <span className="linaw-settings-label">Detail</span>
            <div className="linaw-btn-group">
              <button
                type="button"
                className={preferences.detail === "key_points" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ detail: "key_points" satisfies Detail })
                }
              >
                Key points
              </button>
              <button
                type="button"
                className={preferences.detail === "full" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ detail: "full" satisfies Detail })
                }
              >
                Full
              </button>
            </div>
          </div>

          <div className="linaw-settings-row">
            <span className="linaw-settings-label">Wording</span>
            <div className="linaw-btn-group">
              <button
                type="button"
                className={preferences.wording === "plain" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ wording: "plain" satisfies Wording })
                }
              >
                Plain
              </button>
              <button
                type="button"
                className={preferences.wording === "original" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ wording: "original" satisfies Wording })
                }
              >
                Original
              </button>
            </div>
          </div>

          <div className="linaw-settings-row">
            <span className="linaw-settings-label">Delivery</span>
            <div className="linaw-btn-group">
              <button
                type="button"
                className={preferences.delivery === "read" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ delivery: "read" satisfies Delivery })
                }
              >
                Read
              </button>
              <button
                type="button"
                className={preferences.delivery === "listen" ? "is-active" : ""}
                onClick={() =>
                  void updatePrefs({ delivery: "listen" satisfies Delivery })
                }
              >
                Listen
              </button>
            </div>
          </div>

          <div className="linaw-settings-row">
            <span className="linaw-settings-label">Auto-Adapt</span>
            <div className="linaw-btn-group">
              <button
                type="button"
                className={!isAutoAdaptEnabled(preferences) ? "is-active" : ""}
                onClick={() => void updatePrefs({ browserBehavior: "manual" })}
              >
                Off
              </button>
              <button
                type="button"
                className={isAutoAdaptEnabled(preferences) ? "is-active" : ""}
                onClick={() => void updatePrefs({ browserBehavior: "auto_adapt" })}
              >
                On
              </button>
            </div>
          </div>

          <div className="linaw-settings-links">
            <a
              className="linaw-text-link"
              href={WEB_APP_READ_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in web app ↗
            </a>
            <button
              type="button"
              className="linaw-text-link"
              onClick={onDisableSite}
            >
              Disable on this site
            </button>
          </div>
        </div>
      )}

      {/* Reading Section: "Simplified version" label, document title, and content */}
      <section className="linaw-reading-section" aria-live="polite">
        <div className="linaw-reading-header">
          <span className="linaw-reading-badge">
            {view === "adapted" ? "Simplified version" : "Original source"}
          </span>
          <button
            type="button"
            className="linaw-toggle-original-btn"
            onClick={() =>
              setView((v) => (v === "adapted" ? "original" : "adapted"))
            }
          >
            {view === "adapted" ? "View original" : "Back to simplified"}
          </button>
        </div>

        <h2 className="linaw-doc-title">{docTitle}</h2>

        <div className="linaw-content-card">
          {error ? (
            <p className="linaw-error">{error}</p>
          ) : working && !response ? (
            <p className="linaw-loading">Adapting content…</p>
          ) : view === "original" ? (
            <p className="linaw-paragraph">{source || "—"}</p>
          ) : showAsBullets && bulletItems.length > 0 ? (
            <ul className="linaw-bullet-list">
              {bulletItems.map((item, idx) => (
                <li key={idx} className="linaw-bullet-item">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="linaw-paragraph">
              {response?.adaptedText || source || "—"}
            </p>
          )}

          {response?.overallStatus === "warning" && (
            <p className="linaw-check-warning">
              ⚠ Important condition may have changed. Review source above.
            </p>
          )}
        </div>
      </section>

      {/* Bottom Action Bar: Outlined [📄 Copy] and Solid accent [▶ Listen] */}
      <div className="linaw-action-bar">
        <button
          type="button"
          className="linaw-copy-btn"
          onClick={() => {
            const textToCopy =
              view === "adapted"
                ? (response?.adaptedText ?? source)
                : source;
            if (!textToCopy) return;
            void navigator.clipboard.writeText(textToCopy).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          <span className="linaw-btn-icon">📄</span>
          <span>{copied ? "Copied! ✓" : "Copy"}</span>
        </button>

        <button
          type="button"
          className={`linaw-listen-btn ${listening ? "is-listening" : ""}`}
          onClick={() => {
            if (listening) {
              stopSpeech();
            } else {
              listenDisplayed();
            }
          }}
        >
          <span className="linaw-btn-icon">{listening ? "⏹" : "▶"}</span>
          <span>{listening ? "Stop" : "Listen"}</span>
        </button>
      </div>

      <footer className="linaw-footer-origin" title={origin}>
        Site: {origin}
      </footer>
    </div>
  );
}
