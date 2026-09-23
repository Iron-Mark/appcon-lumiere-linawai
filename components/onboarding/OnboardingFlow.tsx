"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronLeft } from "lucide-react";
import { Sindi } from "@/components/sindi";
import type { Preferences } from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import { ChoiceCard } from "./ChoiceCard";
import { ChoiceExample } from "./ChoiceExample";
import {
  TOTAL_ONBOARDING_STEPS,
  choiceForStep,
  resolveOnboardingStep,
  type ChoiceValue,
  type DraftPreferences,
} from "./steps";

const TOTAL_STEPS = TOTAL_ONBOARDING_STEPS;

export function OnboardingFlow({ editing = false }: { editing?: boolean }) {
  const headingId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftPreferences>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const step = resolveOnboardingStep(stepIndex, draft);
  const selected = choiceForStep(step, draft);
  const canContinue = selected !== undefined;
  const isLast = stepIndex === TOTAL_STEPS - 1;
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const existing = await preferenceStore.get();
        if (!cancelled && existing) {
          if (editing) {
            const { wording, ...rest } = existing;
            setDraft({
              ...rest,
              ...(wording === "original" ||
              wording === "plain" ||
              wording === "taglish"
                ? { wording }
                : {}),
            });
          } else {
            window.location.replace("/read");
            return;
          }
        }
      } catch {
        // Stay on onboarding if the store cannot be read.
      } finally {
        if (!cancelled) setCheckingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editing]);

  const selectValue = useCallback(
    (value: ChoiceValue) => {
      setError(null);
      setDraft((prev) => ({ ...prev, [step.id]: value }));
    },
    [step.id],
  );

  const goBack = useCallback(() => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const persistAndLeave = useCallback(async () => {
    const { detail, wording, delivery, browserBehavior } = draft;
    if (!detail || !wording || !delivery || !browserBehavior) {
      setError("Choose an option for each step before continuing.");
      return;
    }

    const preferences: Preferences = {
      detail,
      wording,
      delivery,
      browserBehavior,
    };

    setSaving(true);
    setError(null);
    try {
      await preferenceStore.set(preferences);
      // Seed the note layout for first arrival: Key Points → glance, Full → text.
      try {
        window.localStorage.setItem(
          "linaw.read.view",
          detail === "key_points" ? "glance" : "text",
        );
      } catch {
        // Best effort; /read can still seed from preferences.
      }
      // Hard navigate so we never sit on "Saving…" if soft push stalls.
      window.location.assign("/read");
    } catch {
      setError("Could not save your preferences. Try again.");
      setSaving(false);
    }
  }, [draft]);

  const goNext = useCallback(() => {
    if (!canContinue || saving) return;
    if (isLast) {
      void persistAndLeave();
      return;
    }
    setStepIndex((i) => Math.min(TOTAL_STEPS - 1, i + 1));
  }, [canContinue, isLast, persistAndLeave, saving]);

  function onGroupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const options = step.options;
    const currentIndex = options.findIndex((o) => o.value === selected);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = options[(currentIndex + 1 + options.length) % options.length];
      selectValue(next.value);
      document.getElementById(`${step.id}-${next.value}`)?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const prev =
        options[(currentIndex - 1 + options.length) % options.length];
      selectValue(prev.value);
      document.getElementById(`${step.id}-${prev.value}`)?.focus();
    }
  }

  const sindiLine =
    selected !== undefined ? step.lineFor(selected) : step.promptIdle;

  if (checkingExisting) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "var(--font-ui)",
          color: "var(--color-ink-muted)",
          fontSize: "1rem",
        }}
        aria-busy="true"
      >
        Loading…
      </main>
    );
  }

  return (
    <main
      className="onboarding-shell"
      style={{
        boxSizing: "border-box",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        margin: "0 auto",
        padding: "1.25rem 1.5rem 0",
        fontFamily: "var(--font-ui)",
        color: "var(--color-ink)",
        fontSize: "1rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-reading)",
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "var(--color-ink)",
            }}
          >
            Linaw
          </p>
          <Link
            href="/todo"
            style={{
              fontSize: "0.9375rem",
              color: "var(--color-ink-muted)",
              textDecoration: "underline",
              textUnderlineOffset: "0.2em",
            }}
          >
            What is connected
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            aria-label="Go back to previous step"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "999px",
              border: "none",
              background:
                stepIndex === 0 ? "transparent" : "var(--color-paper-inset)",
              color:
                stepIndex === 0
                  ? "var(--color-ink-subtle)"
                  : "var(--color-ink)",
              cursor: stepIndex === 0 ? "default" : "pointer",
              opacity: stepIndex === 0 ? 0.45 : 1,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
          </button>

          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={stepIndex + 1}
            aria-label={`Step ${stepIndex + 1} of ${TOTAL_STEPS}`}
            style={{
              flex: 1,
              height: "0.5rem",
              borderRadius: "999px",
              background: "var(--color-paper-inset)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--color-action)",
                borderRadius: "999px",
                transition: "width var(--motion-base) ease",
              }}
            />
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.85rem",
          }}
        >
          <Sindi state="prompt" line={sindiLine} />
        </div>

        <h1
          id={headingId}
          style={{
            margin: 0,
            fontFamily: "var(--font-reading)",
            fontSize: "1.75rem",
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "0.01em",
          }}
        >
          {step.question}
        </h1>

        <ChoiceExample stepId={step.id} selected={selected} draft={draft} />

        <div
          role="radiogroup"
          aria-labelledby={headingId}
          onKeyDown={onGroupKeyDown}
          className="onboarding-choices"
        >
          {step.options.map((option) => (
            <ChoiceCard
              key={option.value}
              option={option}
              name={step.id}
              selected={selected === option.value}
              onSelect={selectValue}
            />
          ))}
        </div>

        {error ? (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              background: "var(--color-warning-soft)",
              border: "1px solid var(--color-warning-border)",
              color: "var(--color-warning)",
              fontSize: "1rem",
            }}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "1rem 0 1.5rem",
          background:
            "linear-gradient(to top, var(--color-paper) 70%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={goNext}
          disabled={!canContinue || saving}
          aria-disabled={!canContinue || saving}
          style={{
            display: "block",
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            border: "none",
            fontFamily: "var(--font-ui)",
            fontSize: "1.0625rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: canContinue && !saving ? "pointer" : "not-allowed",
            background:
              canContinue && !saving
                ? "var(--color-action)"
                : "var(--color-paper-inset)",
            color:
              canContinue && !saving
                ? "var(--color-paper-raised)"
                : "var(--color-ink-subtle)",
            transition:
              "background var(--motion-base) ease, color var(--motion-base) ease",
          }}
        >
          {saving ? "Saving…" : isLast ? "Continue to reading" : "Continue"}
        </button>
      </div>
      <style>{`
        .onboarding-shell {
          max-width: min(42rem, 100%);
        }
        .onboarding-choices {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .onboarding-choice {
          display: flex;
          width: 100%;
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
          padding: 0.85rem;
          text-align: left;
          cursor: pointer;
          border-radius: 1.15rem;
          border: 2px solid var(--color-paper-inset);
          background: var(--color-paper-raised);
          color: var(--color-ink);
          font-family: var(--font-ui);
          font-size: 1rem;
          line-height: 1.45;
          box-sizing: border-box;
          box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 6%, transparent);
          transition:
            background var(--motion-base) ease,
            border-color var(--motion-base) ease,
            box-shadow var(--motion-base) ease;
        }
        .onboarding-choice:hover {
          border-color: color-mix(in srgb, var(--color-action-border) 45%, var(--color-paper-inset));
          box-shadow: 0 10px 24px color-mix(in srgb, var(--color-ink) 6%, transparent);
        }
        .onboarding-choice:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 3px;
        }
        .onboarding-choice.is-selected {
          border-color: var(--color-action-border);
          background: color-mix(in srgb, var(--color-action-soft) 72%, var(--color-paper-raised));
          box-shadow: none;
        }
        .onboarding-example {
          border-radius: 1.15rem;
          border: 1px solid var(--color-paper-inset);
          background: var(--color-paper-raised);
          padding: 1.15rem 1.35rem 1.25rem;
        }
        .onboarding-example-kicker {
          margin: 0 0 0.7rem;
          font-size: 0.75rem;
          font-weight: 650;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-subtle);
        }
        .onboarding-example-line {
          margin: 0 0 0.65rem;
          font-family: var(--font-reading);
          font-size: 1.125rem;
          line-height: 1.55;
          color: var(--color-ink);
        }
        .onboarding-example-line:last-child {
          margin-bottom: 0;
        }
        .onboarding-example-stage {
          display: grid;
        }
        .onboarding-example-stage > * {
          grid-area: 1 / 1;
        }
        .onboarding-example-measure {
          visibility: hidden;
        }
        .listen-player-title {
          margin: 0;
          font-family: var(--font-reading);
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--color-ink);
        }
        .listen-player-script {
          margin: 0.45rem 0 0.9rem;
          font-size: 0.95rem;
          line-height: 1.45;
          color: var(--color-ink-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .listen-player-bar {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .listen-player-time {
          font-variant-numeric: tabular-nums;
          font-size: 0.8125rem;
          color: var(--color-ink-muted);
          min-width: 2.2rem;
        }
        .listen-player-track {
          position: relative;
          flex: 1;
          height: 0.28rem;
          border-radius: 999px;
          background: var(--color-paper-inset);
        }
        .listen-player-fill {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: var(--color-ink);
        }
        .listen-player-play {
          display: inline-flex;
          width: 2.75rem;
          height: 2.75rem;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          background: var(--color-action);
          color: var(--color-paper-raised);
          cursor: pointer;
        }
        .listen-player-play:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 3px;
        }
        .onboarding-example-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .onboarding-example-list li {
          position: relative;
          padding-left: 1rem;
          font-family: var(--font-reading);
          font-size: 1.125rem;
          line-height: 1.45;
          color: var(--color-ink);
        }
        .onboarding-example-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55rem;
          width: 0.4rem;
          height: 0.4rem;
          border-radius: 999px;
          background: var(--color-action);
        }
        .onboarding-choice-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
          padding: 0.35rem 0.5rem 0.55rem;
        }
        .onboarding-choice-title {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-weight: 650;
          font-size: 1.2rem;
          letter-spacing: -0.01em;
        }
        .onboarding-choice-check {
          margin-left: auto;
          flex-shrink: 0;
          color: transparent;
        }
        .onboarding-choice.is-selected .onboarding-choice-check {
          color: var(--color-action);
        }
        .onboarding-choice-hint {
          color: var(--color-ink-muted);
          font-size: 0.975rem;
          line-height: 1.45;
          padding-left: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-choice { transition: none; }
        }
        @media (min-width: 900px) {
          .onboarding-shell {
            max-width: min(58rem, calc(100% - 2rem));
            padding-left: 2rem;
            padding-right: 2rem;
          }
          .onboarding-choices {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.15rem;
            align-items: stretch;
          }
        }
        @media (min-width: 1280px) {
          .onboarding-shell {
            max-width: min(64rem, calc(100% - 3rem));
          }
        }
      `}</style>
    </main>
  );
}

export default OnboardingFlow;
