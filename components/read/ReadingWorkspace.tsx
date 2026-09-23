"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { Button } from "@/components/ui/button";
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
      <main className="font-ui min-h-screen overflow-x-hidden px-5 py-8 text-ink-muted">
        Loading preferences…
      </main>
    );
  }

  return (
    <main className="font-ui mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 overflow-x-hidden px-4 py-5 text-ink sm:px-6 sm:py-7 lg:gap-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
          Linaw AI
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ModeBar
            detail={preferences.detail}
            wording={preferences.wording}
            delivery={preferences.delivery}
            disabled={working}
            onDetail={onDetail}
            onWording={onWording}
            onDelivery={onDelivery}
          />
          <Link
            href="/todo"
            className="min-h-11 inline-flex items-center text-sm text-ink-muted underline underline-offset-[0.2em] transition-colors duration-[var(--motion-base)] hover:text-ink motion-reduce:transition-none"
          >
            Backend not connected
          </Link>
        </div>
      </div>

      {!hasStoredPrefs ? (
        <p className="m-0 rounded-lg bg-paper-inset px-4 py-3 text-[0.9375rem] text-ink-muted">
          Preferences are not saved yet.{" "}
          <Link
            href="/onboarding"
            className="font-semibold text-action underline-offset-2 hover:underline"
          >
            Set your defaults
          </Link>
          , or continue with Key Points · Plain Language · Read.
        </p>
      ) : null}

      <section
        aria-label="Source"
        className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-paper-inset/80 bg-paper-raised/70 p-4 sm:p-5"
      >
        <label
          htmlFor="source-input"
          className="text-xs font-semibold tracking-[0.04em] text-ink-subtle uppercase"
        >
          Source text
        </label>
        <textarea
          id="source-input"
          value={draftSource}
          onChange={(event) => setDraftSource(event.target.value)}
          rows={4}
          placeholder="Paste or enter the message to adapt…"
          className="font-ui w-full min-w-0 resize-y rounded-lg border-[1.5px] border-paper-inset bg-paper-raised px-4 py-3 text-[0.9375rem] leading-normal text-ink outline-none placeholder:text-ink-subtle focus-visible:border-action-border focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onAdaptDraft}
            disabled={working}
            className="min-h-11 px-5 font-ui text-[0.9375rem] font-semibold"
          >
            Adapt
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onLoadSample}
            disabled={working}
            className="min-h-11 px-5 font-ui text-[0.9375rem] font-semibold"
          >
            Load development sample
          </Button>
        </div>
        {error ? (
          <p role="alert" className="m-0 text-[0.9375rem] text-warning">
            {error}
          </p>
        ) : null}
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:gap-7">
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

        <div className="min-w-0 rounded-xl border border-paper-inset bg-paper-raised/90 p-4 sm:p-5 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
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
    </main>
  );
}
