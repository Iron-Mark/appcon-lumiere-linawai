"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { adapt } from "@/lib/adapt";
import {
  DEFAULT_PREFERENCES,
  type AdaptResponse,
  type Detail,
  type Delivery,
  type Preferences,
  type Wording,
} from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import type { SindiState } from "@/components/sindi";
import { ModeBar } from "./ModeBar";
import { MeaningCheckRail } from "./MeaningCheckRail";
import { NoteCard } from "./NoteCard";
import { buildMarks, warningLineForChecks } from "./marks";
import { statusLabel } from "./AdaptedText";
import { useListen } from "./useListen";

/**
 * Empty source asks the adapt fixture for its development sample.
 * Do not hardcode campus-pilot copy here — the sample lives in the fixture.
 */
const FIXTURE_SAMPLE_REQUEST = "";

export function ReadingWorkspace() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [prefsReady, setPrefsReady] = useState(false);
  const [hasStoredPrefs, setHasStoredPrefs] = useState(false);

  const [draftSource, setDraftSource] = useState("");
  /** Source last sent to adapt(); empty string means fixture sample. */
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [usingFixtureSample, setUsingFixtureSample] = useState(false);

  const [result, setResult] = useState<AdaptResponse | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showingOriginal, setShowingOriginal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const adaptGeneration = useRef(0);
  const displayedText = result?.adaptedText ?? "";
  const { listening, start: startListen, stop: stopListen, toggle: toggleListen } =
    useListen(displayedText);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await preferenceStore.get();
      if (cancelled) return;
      if (stored) {
        setPreferences(stored);
        setHasStoredPrefs(true);
      }
      setPrefsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runAdapt = useCallback(
    async (
      source: string,
      prefs: Preferences,
      options?: { fixtureSample?: boolean; autoListen?: boolean },
    ) => {
      const generation = ++adaptGeneration.current;
      setWorking(true);
      setError(null);
      setShowingOriginal(false);
      setSelectedIndex(null);
      stopListen();

      try {
        const response = await adapt({ source, preferences: prefs });
        if (generation !== adaptGeneration.current) return;
        setResult(response);
        setActiveSource(source);
        setUsingFixtureSample(Boolean(options?.fixtureSample));
        setWorking(false);

        const shouldListen =
          options?.autoListen ?? prefs.delivery === "listen";
        if (shouldListen && response.adaptedText.trim()) {
          startListen(response.adaptedText);
        }
      } catch {
        if (generation !== adaptGeneration.current) return;
        setWorking(false);
        setError("Could not adapt this note. Try again.");
      }
    },
    [startListen, stopListen],
  );

  const persistAndAdapt = useCallback(
    async (next: Preferences) => {
      setPreferences(next);
      try {
        await preferenceStore.set(next);
        setHasStoredPrefs(true);
      } catch {
        // Local write failed — still adapt with in-memory prefs.
      }
      if (activeSource !== null) {
        await runAdapt(activeSource, next, {
          fixtureSample: usingFixtureSample,
          autoListen: next.delivery === "listen",
        });
      }
    },
    [activeSource, runAdapt, usingFixtureSample],
  );

  const onDetail = (detail: Detail) => {
    void persistAndAdapt({ ...preferences, detail });
  };
  const onWording = (wording: Wording) => {
    void persistAndAdapt({ ...preferences, wording });
  };
  const onDelivery = (delivery: Delivery) => {
    void persistAndAdapt({ ...preferences, delivery });
  };

  const onAdaptDraft = () => {
    const source = draftSource.trim();
    if (!source) {
      setError("Enter or paste source text first.");
      return;
    }
    void runAdapt(source, preferences, {
      fixtureSample: false,
      autoListen: preferences.delivery === "listen",
    });
  };

  const onLoadSample = () => {
    setDraftSource("");
    void runAdapt(FIXTURE_SAMPLE_REQUEST, preferences, {
      fixtureSample: true,
      autoListen: preferences.delivery === "listen",
    });
  };

  const marks = useMemo(() => {
    if (!result) return [];
    return buildMarks(
      result.adaptedText,
      result.checks,
      result.meaningMap.criticalFacts,
    );
  }, [result]);

  const originalForDisplay = useMemo(() => {
    if (activeSource && activeSource.trim()) return activeSource;
    if (!result) return "";
    // Fixture sample: reconstruct source from Meaning Map evidence (never hardcode it).
    const fromFacts = result.meaningMap.criticalFacts
      .map((f) => f.evidence.trim())
      .filter(Boolean);
    if (fromFacts.length > 0) {
      return [...new Set(fromFacts)].join(" ");
    }
    const fromChecks = result.checks
      .map((c) => c.evidence.trim())
      .filter(Boolean);
    return [...new Set(fromChecks)].join(" ");
  }, [activeSource, result]);

  const sindiState: SindiState = (() => {
    if (working) return "working";
    if (listening) return "listening";
    if (!result) return "empty";
    if (
      result.overallStatus === "warning" ||
      result.overallStatus === "repair_required"
    ) {
      return "warning";
    }
    if (result.overallStatus === "pass") return "pass";
    return "reading";
  })();

  const sindiLine =
    sindiState === "warning" && result
      ? warningLineForChecks(result.checks)
      : undefined;

  const detailLabel =
    preferences.detail === "full" ? "Full" : "Key Points";
  const wordingLabel =
    preferences.wording === "original" ? "Original" : "Plain Language";

  const statusLine = statusLabel(
    result?.overallStatus ?? null,
    working,
    listening,
    detailLabel,
    wordingLabel,
  );

  const onSelectCheck = (index: number | null) => {
    setSelectedIndex(index);
    if (index == null) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollOpts: ScrollIntoViewOptions = {
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    };
    const markEl = document.getElementById(`adapted-mark-${index}`);
    const cardEl = document.getElementById(`meaning-check-card-${index}`);
    markEl?.scrollIntoView(scrollOpts);
    cardEl?.scrollIntoView(scrollOpts);
    markEl?.focus({ preventScroll: true });
  };

  if (!prefsReady) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "2rem 1.25rem",
          fontFamily: "var(--font-ui)",
          color: "var(--color-ink-muted)",
        }}
      >
        Loading preferences…
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.25rem 1.25rem 2.5rem",
        maxWidth: "72rem",
        margin: "0 auto",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
          }}
        >
          Linaw AI
        </p>
        <Link
          href="/todo"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-ink-muted)",
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
          }}
        >
          Backend not connected
        </Link>
      </div>

      {!hasStoredPrefs ? (
        <p
          style={{
            margin: 0,
            padding: "0.75rem 1rem",
            background: "var(--color-paper-inset)",
            borderRadius: "0.45rem",
            fontSize: "0.9375rem",
            color: "var(--color-ink-muted)",
          }}
        >
          Preferences are not saved yet.{" "}
          <Link href="/" style={{ color: "var(--color-action)" }}>
            Set your defaults
          </Link>
          , or continue with Key Points · Plain Language · Read.
        </p>
      ) : null}

      <ModeBar
        detail={preferences.detail}
        wording={preferences.wording}
        delivery={preferences.delivery}
        disabled={working}
        onDetail={onDetail}
        onWording={onWording}
        onDelivery={onDelivery}
      />

      <section
        aria-label="Source"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
        }}
      >
        <label
          htmlFor="source-input"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--color-ink-subtle)",
          }}
        >
          Source text
        </label>
        <textarea
          id="source-input"
          value={draftSource}
          onChange={(event) => setDraftSource(event.target.value)}
          rows={4}
          placeholder="Paste or enter the message to adapt…"
          style={{
            width: "100%",
            resize: "vertical",
            padding: "0.85rem 1rem",
            borderRadius: "0.5rem",
            border: "1.5px solid var(--color-paper-inset)",
            background: "var(--color-paper-raised)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.9375rem",
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onAdaptDraft}
            disabled={working}
            style={primaryButtonStyle}
          >
            Adapt
          </button>
          <button
            type="button"
            onClick={onLoadSample}
            disabled={working}
            style={secondaryButtonStyle}
          >
            Load development sample
          </button>
        </div>
        {error ? (
          <p
            role="alert"
            style={{ margin: 0, color: "var(--color-warning)", fontSize: "0.9375rem" }}
          >
            {error}
          </p>
        ) : null}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(16rem, 0.85fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="read-workspace-grid"
      >
        <NoteCard
          title="Adapted note"
          statusLine={statusLine}
          adaptedText={displayedText}
          originalText={originalForDisplay}
          showingOriginal={showingOriginal}
          onToggleOriginal={() => setShowingOriginal((v) => !v)}
          listening={listening}
          onToggleListen={toggleListen}
          canListen={Boolean(displayedText.trim()) && !working}
          marks={showingOriginal ? [] : marks}
          selectedIndex={selectedIndex}
          onSelectMark={(index) => onSelectCheck(index)}
          overallStatus={result?.overallStatus ?? null}
        />

        <div
          style={{
            padding: "1.15rem 1.1rem",
            background: "var(--color-paper-raised)",
            border: "1px solid var(--color-paper-inset)",
            borderRadius: "0.65rem",
            minHeight: "12rem",
          }}
        >
          <MeaningCheckRail
            checks={result?.checks ?? null}
            overallStatus={result?.overallStatus ?? null}
            selectedIndex={selectedIndex}
            onSelect={onSelectCheck}
            sindiState={sindiState}
            sindiLine={sindiLine}
            loading={working}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .read-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const primaryButtonStyle: CSSProperties = {
  padding: "0.55rem 1.1rem",
  borderRadius: "0.45rem",
  border: "none",
  background: "var(--color-action)",
  color: "var(--color-paper-raised)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.9375rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "0.55rem 1.1rem",
  borderRadius: "0.45rem",
  border: "1.5px solid var(--color-action-border)",
  background: "var(--color-action-soft)",
  color: "var(--color-action)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.9375rem",
  fontWeight: 600,
  cursor: "pointer",
};
