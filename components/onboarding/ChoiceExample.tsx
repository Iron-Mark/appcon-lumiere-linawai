"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useListen } from "@/components/read/useListen";
import type { ChoiceValue, DraftPreferences, StepId } from "./steps";

const SOURCE = [
  "Members of the Linaw campus pilot must confirm their orientation seat by Thursday at 5 PM.",
  "Mentors should arrive Friday at 8:30 AM. Other members should arrive at 9:00 AM.",
  "Late confirmations are accepted only with written approval from the program coordinator.",
];

const KEY_POINTS = [
  "Confirm your orientation seat by Thursday at 5 PM.",
  "Mentors arrive Friday at 8:30 AM.",
  "Other members arrive at 9:00 AM.",
  "Late confirmations need written approval.",
];

const PLAIN = [
  "Please confirm your orientation seat by Thursday at 5 PM.",
  "Mentors arrive on Friday at 8:30 AM. Other members arrive at 9:00 AM.",
  "If you confirm late, you need written approval from the program coordinator.",
];

const PLAIN_POINTS = [
  "Confirm your seat by Thursday at 5 PM.",
  "Mentors arrive Friday at 8:30 AM.",
  "Everyone else arrives at 9:00 AM.",
  "A late confirmation needs written approval.",
];

type Example = {
  kicker: string;
  blocks: string[];
  list: boolean;
  spoken: boolean;
};

function detailBlocks(draft: DraftPreferences, detail: "full" | "key_points"): Example {
  const plain = draft.wording === "plain";
  if (detail === "key_points") {
    return {
      kicker: plain ? "Key points, in everyday words" : "Key points",
      blocks: plain ? PLAIN_POINTS : KEY_POINTS,
      list: true,
      spoken: false,
    };
  }
  return {
    kicker: plain ? "The full message, in everyday words" : "The full message",
    blocks: plain ? PLAIN : SOURCE,
    list: false,
    spoken: false,
  };
}

export function exampleFor(
  stepId: StepId,
  selected: ChoiceValue | undefined,
  draft: DraftPreferences,
): Example {
  if (!selected) {
    return {
      kicker: "A sample message",
      blocks: SOURCE,
      list: false,
      spoken: false,
    };
  }

  if (stepId === "detail") {
    return detailBlocks(draft, selected === "key_points" ? "key_points" : "full");
  }

  if (stepId === "wording") {
    const next = { ...draft, wording: selected === "plain" ? "plain" : "original" } as DraftPreferences;
    return detailBlocks(next, draft.detail === "key_points" ? "key_points" : "full");
  }

  if (stepId === "delivery") {
    const next = {
      ...draft,
      delivery: selected === "listen" ? "listen" : "read",
    } as DraftPreferences;
    const example = detailBlocks(
      next,
      draft.detail === "key_points" ? "key_points" : "full",
    );
    return {
      ...example,
      kicker: selected === "listen" ? "Linaw would read this aloud" : example.kicker,
      spoken: selected === "listen",
    };
  }

  const sample = detailBlocks(draft, draft.detail === "key_points" ? "key_points" : "full");
  return {
    ...sample,
    kicker:
      selected === "auto_adapt"
        ? "After you opt in, a page you open can look like this"
        : "You choose the message, then it can look like this",
  };
}

export function ChoiceExample({
  stepId,
  selected,
  draft,
}: {
  stepId: StepId;
  selected: ChoiceValue | undefined;
  draft: DraftPreferences;
}) {
  const example = exampleFor(stepId, selected, draft);

  const script = example.blocks.join(" ");

  return (
    <div className="onboarding-example">
      <div className="onboarding-example-stage">
        <ExampleMeasure blocks={SOURCE} list={false} />
        <ExampleMeasure blocks={PLAIN} list={false} />
        <ExampleMeasure blocks={KEY_POINTS} list />
        <ExampleMeasure blocks={PLAIN_POINTS} list />
        <div className="onboarding-example-measure" aria-hidden="true">
          <div className="listen-player">
            <p className="onboarding-example-kicker">Listen</p>
            <p className="listen-player-title">Orientation seat</p>
            <p className="listen-player-script">{SOURCE.join(" ")}</p>
            <div className="listen-player-bar">
              <span className="listen-player-time">0:00</span>
              <span className="listen-player-track" />
              <span className="listen-player-time">0:18</span>
              <span className="listen-player-play" />
            </div>
          </div>
        </div>
        <div className="onboarding-example-live" aria-live="polite">
          {example.spoken ? (
            <ListenPlayer title="Orientation seat" script={script} />
          ) : (
            <>
              <p className="onboarding-example-kicker">{example.kicker}</p>
              {example.list ? (
                <ul className="onboarding-example-list">
                  {example.blocks.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                example.blocks.map((line) => (
                  <p key={line} className="onboarding-example-line">
                    {line}
                  </p>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ExampleMeasure({
  blocks,
  list,
}: {
  blocks: string[];
  list: boolean;
}) {
  return (
    <div className="onboarding-example-measure" aria-hidden="true">
      <p className="onboarding-example-kicker">
        The full message, in everyday words
      </p>
      {list ? (
        <ul className="onboarding-example-list">
          {blocks.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        blocks.map((line) => (
          <p key={line} className="onboarding-example-line">
            {line}
          </p>
        ))
      )}
    </div>
  );
}

function ListenPlayer({ title, script }: { title: string; script: string }) {
  const { listening, toggle, stop } = useListen(script);
  const [progress, setProgress] = useState(0);
  const duration = Math.max(8, Math.round(script.split(/\s+/).filter(Boolean).length / 2.4));

  useEffect(() => {
    if (!listening) {
      setProgress(0);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = (performance.now() - started) / 1000;
      setProgress(Math.min(1, elapsed / duration));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [listening, duration]);

  useEffect(() => () => stop(), [stop]);

  const elapsed = Math.round(progress * duration);

  return (
    <div className="listen-player">
      <p className="onboarding-example-kicker">Listen</p>
      <p className="listen-player-title">{title}</p>
      <p className="listen-player-script">{script}</p>
      <div className="listen-player-bar">
        <span className="listen-player-time">{formatTime(elapsed)}</span>
        <span
          className="listen-player-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={elapsed}
          aria-label="Sample playback"
        >
          <span className="listen-player-fill" style={{ width: `${progress * 100}%` }} />
        </span>
        <span className="listen-player-time">{formatTime(duration)}</span>
        <button
          type="button"
          className="listen-player-play"
          aria-label={listening ? "Pause sample" : "Play sample"}
          aria-pressed={listening}
          onClick={toggle}
        >
          {listening ? (
            <Pause aria-hidden size={18} strokeWidth={2.25} />
          ) : (
            <Play aria-hidden size={18} strokeWidth={2.25} />
          )}
        </button>
      </div>
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
