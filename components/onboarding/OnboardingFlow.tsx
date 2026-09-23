"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Sindi } from "@/components/sindi";
import { Button } from "@/components/ui/button";
import { ToggleGroup } from "@/components/ui/toggle-group";
import type { Preferences } from "@/lib/domain";
import { preferenceStore } from "@/lib/storage/preferences";
import { cn } from "@/lib/utils";
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
      router.replace("/read");
    } catch {
      setError("Could not save your preferences. Try again.");
    } finally {
      // Soft nav can leave this screen mounted; never leave the CTA stuck on Saving…
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

  const sindiLine =
    selected !== undefined ? step.lineFor(selected) : step.promptIdle;

  if (checkingExisting) {
    return (
      <main
        className="flex min-h-screen items-center justify-center p-8 font-ui text-base text-ink-muted"
        aria-busy="true"
      >
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto box-border flex min-h-screen w-full max-w-2xl flex-col px-6 pt-5 font-ui text-base text-ink">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="font-reading m-0 text-2xl font-semibold tracking-[0.02em] text-ink">
            Linaw
          </p>
          <Link
            href="/todo"
            className="text-[0.9375rem] text-ink-muted underline underline-offset-4"
          >
            Backend not connected
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={goBack}
            disabled={stepIndex === 0}
            aria-label="Go back to previous step"
            className={cn(
              "size-11 shrink-0 rounded-full",
              stepIndex === 0 && "opacity-45",
            )}
          >
            <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
          </Button>

          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={stepIndex + 1}
            aria-label={`Step ${stepIndex + 1} of ${TOTAL_STEPS}`}
            className="h-2 flex-1 overflow-hidden rounded-full bg-paper-inset"
          >
            <div
              className="h-full rounded-full bg-action transition-[width] duration-[var(--motion-base)] motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 pb-4">
        <div className="flex items-start gap-3">
          <Sindi state="prompt" line={sindiLine} />
        </div>

        <h1
          id={headingId}
          className="font-reading m-0 text-[1.75rem] leading-tight font-semibold tracking-[0.01em]"
        >
          {step.question}
        </h1>

        <ToggleGroup
          key={step.id}
          type="single"
          orientation="vertical"
          variant="outline"
          spacing={3}
          value={selected ?? ""}
          onValueChange={(next) => {
            if (next) selectValue(next as ChoiceValue);
          }}
          aria-labelledby={headingId}
          className="flex w-full flex-col items-stretch"
        >
          {step.options.map((option) => (
            <ChoiceCard key={option.value} option={option} name={step.id} />
          ))}
        </ToggleGroup>

        {error ? (
          <p
            role="alert"
            className="m-0 rounded-lg border border-warning-border bg-warning-soft px-4 py-3 text-base text-warning"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 bg-[linear-gradient(to_top,var(--color-paper)_70%,transparent)] py-4 pb-6">
        <Button
          type="button"
          variant="default"
          onClick={goNext}
          disabled={!canContinue || saving}
          aria-disabled={!canContinue || saving}
          className="min-h-11 w-full rounded-xl px-5 py-4 font-ui text-[1.0625rem] font-semibold tracking-[0.02em]"
        >
          {saving ? "Saving…" : isLast ? "Continue to reading" : "Continue"}
        </Button>
      </div>
    </main>
  );
}

export default OnboardingFlow;
