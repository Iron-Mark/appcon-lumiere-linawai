"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import {
  CircleCheck,
  FileText,
  Headphones,
  ListChecks,
  MessageSquareText,
  Play,
  Square,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

type View = "full" | "key" | "plain" | "listen";
type Lang = "en" | "tl";

/**
 * Self-contained marketing demo with illustrative copy. It never touches
 * lib/adapt or the fixture — the app adapts the user's own content in /read.
 */
const SOURCE =
  "Students may leave campus during the lunch break only with written approval from a parent or guardian. Approval slips must be submitted to the class adviser by Friday. Students without an approved slip must remain in the cafeteria.";

const KEY_POINTS = {
  good: [
    "Leaving campus at lunch needs written approval from a parent or guardian.",
    "Submit the approval slip to your adviser by Friday.",
    "No approved slip? Stay in the cafeteria.",
  ],
  bad: [
    "You can leave campus at lunch.",
    "Submit the approval slip to your adviser by Friday.",
    "No approved slip? Stay in the cafeteria.",
  ],
};

const PLAIN: Record<Lang, { good: string; bad: string }> = {
  en: {
    good: "You can leave school at lunch only if a parent or guardian says yes in writing. Give the signed slip to your adviser by Friday. If you don't have a signed slip, stay in the cafeteria.",
    bad: "You can leave school at lunch. Give the signed slip to your adviser by Friday. If you don't have a signed slip, stay in the cafeteria.",
  },
  tl: {
    good: "Pwede kang lumabas ng campus tuwing lunch, pero kailangan muna ng written approval galing sa parent o guardian mo. I-submit ang signed slip sa adviser mo bago mag-Friday. Kung wala kang approved slip, dito ka lang sa cafeteria.",
    bad: "Pwede kang lumabas ng campus tuwing lunch. I-submit ang signed slip sa adviser mo bago mag-Friday. Kung wala kang approved slip, dito ka lang sa cafeteria.",
  },
};

const CHECKS = [
  { id: "condition", label: "Condition", phrase: "only with written approval" },
  { id: "deadline", label: "Deadline", phrase: "by Friday" },
  { id: "default", label: "Default rule", phrase: "remain in the cafeteria" },
] as const;

const VIEWS: { value: View; label: string; icon: typeof FileText }[] = [
  { value: "full", label: "Full", icon: FileText },
  { value: "key", label: "Key Points", icon: ListChecks },
  { value: "plain", label: "Plain Language", icon: MessageSquareText },
  { value: "listen", label: "Listen", icon: Headphones },
];

const RATES = [0.8, 1, 1.2];

export function Playground() {
  const [view, setView] = useState<View>("key");
  const [lang, setLang] = useState<Lang>("en");
  const [careless, setCareless] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const panelId = useId();

  const variant = careless ? "bad" : "good";
  const isFlagged = careless && view !== "full";
  const plainText = PLAIN[lang][variant];

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopSpeaking() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function handleViewChange(next: View) {
    if (speaking) stopSpeaking();
    setView(next);
  }

  function toggleSpeech() {
    if (!("speechSynthesis" in window)) {
      setSpeechError("Your browser doesn't support read-aloud. Try Chrome, Edge, or Safari.");
      return;
    }
    if (speaking) {
      stopSpeaking();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = rate;
    utterance.lang = lang === "tl" ? "fil-PH" : "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeechError(null);
    setSpeaking(true);
  }

  const showLangToggle = view === "plain" || view === "listen";

  return (
    <section id="try-it" aria-labelledby="try-title" className="landing-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="try-title"
          eyebrow="Try it"
          title="One notice, four ways to read it."
          description="A miniature of the reading workspace using illustrative text. Switch views, try Taglish, then simulate a careless summary to see verification step in."
        />

        <div className="font-ui mt-12 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-xl border border-border bg-paper-raised shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]">
            <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="tablist" aria-label="Reading views" className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-paper-inset/60 p-1 sm:w-fit">
                {VIEWS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    id={`${panelId}-tab-${value}`}
                    type="button"
                    role="tab"
                    aria-selected={view === value}
                    aria-controls={panelId}
                    tabIndex={view === value ? 0 : -1}
                    onClick={() => handleViewChange(value)}
                    className={cn(
                      "inline-flex h-11 min-h-11 cursor-pointer flex-none items-center gap-2 rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                      view === value
                        ? "bg-paper-raised font-medium text-ink shadow-sm"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="Plain language style"
                className={cn(
                  "flex items-center gap-1 self-start rounded-lg border border-border p-1 text-sm sm:self-auto",
                  showLangToggle ? "flex" : "hidden",
                )}
              >
                {(["en", "tl"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={lang === code}
                    tabIndex={showLangToggle ? 0 : -1}
                    onClick={() => {
                      if (speaking) stopSpeaking();
                      setLang(code);
                    }}
                    className={cn(
                      "min-h-11 cursor-pointer rounded-md px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                      lang === code
                        ? "bg-action-soft font-medium text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {code === "en" ? "English" : "Taglish"}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-72 p-6 md:p-8">
              <div
                id={panelId}
                role="tabpanel"
                aria-labelledby={`${panelId}-tab-${view}`}
              >
                {view === "full" ? (
                  <p className="font-reading text-lg leading-relaxed text-ink">{SOURCE}</p>
                ) : null}

                {view === "key" ? (
                  <ul className="flex list-none flex-col gap-3 p-0 text-lg leading-relaxed text-ink">
                    {KEY_POINTS[variant].map((point, i) => (
                      <li key={point} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-3 size-2 shrink-0 rounded-full",
                            isFlagged && i === 0 ? "bg-warning" : "bg-ink/35",
                          )}
                        />
                        <span>
                          {isFlagged && i === 0 ? <span className="sr-only">Flagged: </span> : null}
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {view === "plain" ? (
                  <p lang={lang === "tl" ? "fil" : "en"} className="font-reading text-lg leading-relaxed text-ink">
                    {plainText}
                  </p>
                ) : null}

                {view === "listen" ? (
                  <div className="flex flex-col gap-6">
                    <p lang={lang === "tl" ? "fil" : "en"} className="font-reading text-lg leading-relaxed text-ink-muted">
                      {plainText}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={toggleSpeech}
                        className="inline-flex h-11 min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-action px-5 text-base font-semibold text-paper-raised transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      >
                        {speaking ? (
                          <Square className="size-4" aria-hidden="true" />
                        ) : (
                          <Play className="size-4" aria-hidden="true" />
                        )}
                        {speaking ? "Stop" : "Read aloud"}
                      </button>
                      <div role="group" aria-label="Reading speed" className="flex items-center gap-1 text-sm">
                        {RATES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            aria-pressed={rate === r}
                            onClick={() => setRate(r)}
                            className={cn(
                              "min-h-11 cursor-pointer rounded-md px-2.5 py-2 tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                              rate === r
                                ? "bg-action-soft font-medium text-ink"
                                : "text-ink-muted hover:text-ink",
                            )}
                          >
                            {r}×
                          </button>
                        ))}
                      </div>
                    </div>
                    {speechError ? (
                      <p role="alert" className="m-0 text-sm text-ink-muted">
                        {speechError}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {isFlagged ? (
                  <div className="flag-panel mt-6 flex gap-3 rounded-xl border border-warning-border/50 bg-warning-soft p-4 text-sm leading-relaxed text-ink">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    <p className="m-0">
                      <strong className="font-semibold">Missing: “only with written approval.”</strong>{" "}
                      Without it, leaving campus sounds like a free choice. Turn off the
                      simulation to see Linaw&apos;s verified version.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside
            aria-labelledby="checks-title"
            className="flex flex-col gap-4 rounded-xl border border-border bg-paper-raised p-6 shadow-[0_1px_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)]"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 id="checks-title" className="font-reading m-0 font-semibold text-ink">
                Meaning Check
              </h3>
              <p aria-live="polite" className="m-0 text-sm text-ink-muted">
                {isFlagged ? "1 flagged" : `${CHECKS.length} of ${CHECKS.length} kept`}
              </p>
            </div>

            <ul className="flex list-none flex-col gap-2 p-0">
              {CHECKS.map((check) => {
                const flagged = isFlagged && check.id === "condition";
                return (
                  <li
                    key={check.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                      flagged ? "border-warning-border/50 bg-warning-soft" : "border-border bg-background",
                    )}
                  >
                    {flagged ? (
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Flagged" />
                    ) : (
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-pass" aria-label="Present in adaptation" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{check.label}</span>
                      <span className="text-sm text-ink-muted">“{check.phrase}”</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <label className="mt-auto flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-border p-3 text-sm text-ink">
              <span>Simulate a careless summary</span>
              <span className="relative inline-flex">
                <input
                  type="checkbox"
                  role="switch"
                  checked={careless}
                  onChange={(e) => setCareless(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-6 w-11 rounded-full bg-ink/20 transition-colors peer-checked:bg-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-1 size-4 rounded-full bg-card transition-transform peer-checked:translate-x-5"
                />
              </span>
            </label>
            {careless && view === "full" ? (
              <p className="m-0 text-xs text-ink-muted">
                Full view is the original, so nothing can be lost here.
              </p>
            ) : null}
          </aside>
        </div>

        <p className="font-ui mt-6 text-center text-sm text-ink-muted">
          Demo with illustrative text. To adapt your own content,{" "}
          <Link href="/onboarding" className="landing-inline-link">
            open Linaw
          </Link>{" "}
          or visit the{" "}
          <Link href="/read" className="landing-inline-link">
            reading workspace
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
