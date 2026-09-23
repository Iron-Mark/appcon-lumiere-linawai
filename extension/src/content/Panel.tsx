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
  enableOrigin,
  getPreferences,
  isAutoAdaptEnabled,
  savePreferences,
  type ExtensionPreferences,
} from "../storage/preferences";

const WEB_APP_READ_URL = "http://localhost:3000/read";

export type PanelProps = {
  source: string;
  preferences: Preferences;
  onPreferencesChange: (next: Preferences) => void;
  onAdaptSelection?: () => void;
  onClose?: () => void;
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
  isDisabled: boolean,
): { icon: string; text: string; isWarning: boolean } {
  if (isDisabled) {
    return { icon: "⏸", text: "Disabled on this site", isWarning: true };
  }
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

  const disabledOrigins: string[] =
    (preferences as Partial<ExtensionPreferences>).disabledOrigins ?? [];
  const isCurrentOriginDisabled =
    Boolean(origin) && disabledOrigins.includes(origin);

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
    if (!isCurrentOriginDisabled) {
      void runAdapt(preferences, source);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runAdapt handles preference updates via controls
  }, [source, isCurrentOriginDisabled]);

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
    if (!isCurrentOriginDisabled) {
      await runAdapt(saved, sourceRef.current);
    }
  }

  async function handleEnableSite(site: string) {
    await enableOrigin(site);
    const updated = await getPreferences();
    onPreferencesChange(updated);
    if (site === origin) {
      await runAdapt(updated, sourceRef.current);
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
              line={sindiLineFor(sindiState, response, isCurrentOriginDisabled)}
              className="linaw-sindi"
            />
          </div>
          <h1 id={titleId} className="linaw-brand-title">
            Linaw AI
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

      {/* Disabled Origin Recovery State Banner */}
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

      {/* Status Pill: Saved preferences / Meaning checked + summary + Settings gear */}
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
          title="Adjust preferences"
        >
          ⚙
        </button>
      </div>

      {/* Collapsible Settings Drawer with explicit form controls having id and name */}
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
              Auto-Adapt
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
              <option value="auto_adapt">On (auto-adapt)</option>
            </select>
          </div>

          {/* Disabled Sites Management Section */}
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
              href={WEB_APP_READ_URL}
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

      {/* Reading Section: "Simplified version" label, document title, and content */}
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
      )}

      {/* Bottom Action Bar: [Copy] with checkmark feedback and Primary [Listen] with SVG play */}
      {!isCurrentOriginDisabled && (
        <div className="linaw-action-bar">
          <button
            type="button"
            id="linaw-copy-btn"
            name="linaw-copy-btn"
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
      )}

      {origin ? (
        <footer className="linaw-footer-origin" title={origin}>
          Site: {origin}
        </footer>
      ) : null}
    </div>
  );
}
