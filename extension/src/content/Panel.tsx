import { useEffect, useId, useRef, useState } from "react";
import { adapt } from "@/lib/adapt";
import type { AdaptResponse, Detail, Preferences, Wording } from "@/lib/domain";
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

function statusLabel(overall: AdaptResponse["overallStatus"] | null): string {
  if (!overall) return "Not checked yet";
  if (overall === "pass") return "No issue found in these checks.";
  if (overall === "warning") {
    return "Important condition may have changed. Review source.";
  }
  return "Review source before relying on this adaptation.";
}

function modeSummary(prefs: Preferences): string {
  const detail = prefs.detail === "full" ? "Full" : "Key Points";
  const wording = prefs.wording === "original" ? "Original" : "Plain";
  const delivery = prefs.delivery === "listen" ? "Listen" : "Read";
  return `${detail} · ${wording} · ${delivery}`;
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

export function Panel({
  source,
  preferences,
  onPreferencesChange,
  onAdaptSelection,
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
      if (nextPrefs.delivery === "listen") {
        // Prefer showing the note first; user can press Listen.
      }
    } catch {
      setError("Adaptation could not finish. Try again.");
      setResponse(null);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    void runAdapt(preferences, source);
    // Re-adapt when the injected source string changes (selection / auto).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preferences handled via controls
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
    // Web Speech API on the displayed adaptation only (not the original source).
    const spoken = response?.adaptedText ?? "";
    if (!spoken.trim()) return;
    stopSpeech();
    if (!window.speechSynthesis) {
      setError("Speech is not available in this browser.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(spoken);
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
  const displayed =
    view === "original" ? source : (response?.adaptedText ?? "");

  return (
    <div className="linaw-panel" role="dialog" aria-labelledby={titleId}>
      <header className="linaw-header">
        <div className="linaw-brand-row">
          <div className="linaw-sindi-wrap">
            <Sindi
              state={sindiState}
              line={sindiLineFor(sindiState, response)}
              className="linaw-sindi"
            />
          </div>
          <button
            type="button"
            className="linaw-icon-btn"
            onClick={onClose}
            aria-label="Close Linaw panel"
          >
            ×
          </button>
        </div>
        <h1 id={titleId} className="linaw-title">
          Adapted by Linaw
        </h1>
        <p className="linaw-mode-line">Current mode: {modeSummary(preferences)}</p>
      </header>

      <div className="linaw-controls" role="group" aria-label="Preference modes">
        <div className="linaw-toggle-row">
          <span className="linaw-label">Detail</span>
          <button
            type="button"
            className={preferences.detail === "full" ? "is-active" : ""}
            aria-pressed={preferences.detail === "full"}
            onClick={() => void updatePrefs({ detail: "full" satisfies Detail })}
          >
            Full
          </button>
          <button
            type="button"
            className={preferences.detail === "key_points" ? "is-active" : ""}
            aria-pressed={preferences.detail === "key_points"}
            onClick={() =>
              void updatePrefs({ detail: "key_points" satisfies Detail })
            }
          >
            Key Points
          </button>
        </div>
        <div className="linaw-toggle-row">
          <span className="linaw-label">Wording</span>
          <button
            type="button"
            className={preferences.wording === "original" ? "is-active" : ""}
            aria-pressed={preferences.wording === "original"}
            onClick={() =>
              void updatePrefs({ wording: "original" satisfies Wording })
            }
          >
            Original
          </button>
          <button
            type="button"
            className={preferences.wording === "plain" ? "is-active" : ""}
            aria-pressed={preferences.wording === "plain"}
            onClick={() =>
              void updatePrefs({ wording: "plain" satisfies Wording })
            }
          >
            Plain
          </button>
        </div>
        <div className="linaw-toggle-row">
          <span className="linaw-label">Auto-Adapt</span>
          <button
            type="button"
            className={isAutoAdaptEnabled(preferences) ? "is-active" : ""}
            aria-pressed={isAutoAdaptEnabled(preferences)}
            onClick={() =>
              void updatePrefs({
                browserBehavior: isAutoAdaptEnabled(preferences)
                  ? "manual"
                  : "auto_adapt",
              })
            }
          >
            {isAutoAdaptEnabled(preferences) ? "On" : "Off"}
          </button>
        </div>
      </div>

      <section className="linaw-body" aria-live="polite">
        {error ? <p className="linaw-error">{error}</p> : null}
        {working && !response ? (
          <p className="linaw-muted">Adapting…</p>
        ) : (
          <div className="linaw-note">{displayed || "—"}</div>
        )}
        <p className="linaw-check-status">
          Meaning Check:{" "}
          {working
            ? "Working…"
            : statusLabel(response?.overallStatus ?? null)}
        </p>
      </section>

      <div className="linaw-actions">
        <button type="button" onClick={onAdaptSelection}>
          Adapt selection
        </button>
        <button
          type="button"
          onClick={() => {
            if (listening) stopSpeech();
            else listenDisplayed();
          }}
        >
          {listening ? "Stop" : "Listen"}
        </button>
        <button
          type="button"
          onClick={() =>
            setView((v) => (v === "adapted" ? "original" : "adapted"))
          }
        >
          {view === "adapted" ? "Show original" : "Show adapted"}
        </button>
        <a
          className="linaw-link-btn"
          href={WEB_APP_READ_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Linaw web app
        </a>
        <button type="button" onClick={onDisableSite}>
          Disable on this site
        </button>
      </div>

      <p className="linaw-footer-meta" title={origin}>
        Site: {origin}
      </p>
    </div>
  );
}
