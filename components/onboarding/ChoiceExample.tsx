"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useListen } from "@/components/read/useListen";
import { EXAMPLE_MEASURE_SETS, exampleFor } from "./example";
import type { ChoiceValue, DraftPreferences, StepId } from "./steps";

export { exampleFor } from "./example";

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
        <ExampleMeasure blocks={EXAMPLE_MEASURE_SETS.source} list={false} />
        <ExampleMeasure blocks={EXAMPLE_MEASURE_SETS.plain} list={false} />
        <ExampleMeasure blocks={EXAMPLE_MEASURE_SETS.keyPoints} list />
        <ExampleMeasure blocks={EXAMPLE_MEASURE_SETS.plainPoints} list />
        <div className="onboarding-example-measure" aria-hidden="true">
          <div className="listen-player">
            <p className="onboarding-example-kicker">Listen</p>
            <p className="listen-player-title">Orientation seat</p>
            <p className="listen-player-script">
              {EXAMPLE_MEASURE_SETS.source.join(" ")}
            </p>
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
  blocks: readonly string[];
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
  const duration = Math.max(
    8,
    Math.round(script.split(/\s+/).filter(Boolean).length / 2.4),
  );

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
          <span
            className="listen-player-fill"
            style={{ width: `${progress * 100}%` }}
          />
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
