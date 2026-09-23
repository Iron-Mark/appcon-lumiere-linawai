"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  ONBOARDING_STEPS,
  type ChoiceValue,
  type DraftPreferences,
} from "./steps";

const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function OnboardingFlow() {
  const router = useRouter();
  const headingId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftPreferences>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const step = ONBOARDING_STEPS[stepIndex];
  const selected = draft[step.id];
  const canContinue = selected !== undefined;
  const isLast = stepIndex === TOTAL_STEPS - 1;
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const existing = await preferenceStore.get();
        if (!cancelled && existing) {
          router.replace("/read");
          return;
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
  }, [router]);

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
      router.push("/read");
    } catch {
      setError("Could not save your preferences. Try again.");
      setSaving(false);
    }
  }, [draft, router]);

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
      style={{
        boxSizing: "border-box",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "42rem",
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
            Backend not connected
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

        <div
          role="radiogroup"
          aria-labelledby={headingId}
          onKeyDown={onGroupKeyDown}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
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
    </main>
  );
}

export default OnboardingFlow;
