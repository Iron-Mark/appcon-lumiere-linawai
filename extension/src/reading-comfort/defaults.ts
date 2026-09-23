/**
 * Extension-only reading display options. Not part of domain Preferences sync.
 */

export type TypeSize = "smaller" | "default" | "larger";
export type SpacingStep = "tighter" | "default" | "roomier";
export type ReadingFace = "default" | "clear";
export type ReadingTone = "paper" | "soft" | "strong";
export type ListenPace = "slower" | "steady" | "faster";

export type ReadingComfort = {
  typeSize: TypeSize;
  lineSpacing: SpacingStep;
  letterSpacing: SpacingStep;
  wordSpacing: SpacingStep;
  face: ReadingFace;
  tone: ReadingTone;
  /** When true, one line of clarified text is marked; click or Listen moves it. */
  focusLine: boolean;
  listenPace: ListenPace;
};

export const DEFAULT_READING_COMFORT: ReadingComfort = {
  typeSize: "default",
  lineSpacing: "default",
  letterSpacing: "default",
  wordSpacing: "default",
  face: "default",
  tone: "paper",
  focusLine: false,
  listenPace: "steady",
};

export const READING_COMFORT_KEY = "linaw.readingComfort.v1";

const TYPE_SIZES: TypeSize[] = ["smaller", "default", "larger"];
const SPACING: SpacingStep[] = ["tighter", "default", "roomier"];
const FACES: ReadingFace[] = ["default", "clear"];
const TONES: ReadingTone[] = ["paper", "soft", "strong"];
const PACES: ListenPace[] = ["slower", "steady", "faster"];

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Normalize a partial store payload into a full ReadingComfort object. */
export function normalizeReadingComfort(
  raw: Partial<ReadingComfort> | undefined | null,
): ReadingComfort {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_READING_COMFORT };
  }
  return {
    typeSize: pick(raw.typeSize, TYPE_SIZES, DEFAULT_READING_COMFORT.typeSize),
    lineSpacing: pick(raw.lineSpacing, SPACING, DEFAULT_READING_COMFORT.lineSpacing),
    letterSpacing: pick(
      raw.letterSpacing,
      SPACING,
      DEFAULT_READING_COMFORT.letterSpacing,
    ),
    wordSpacing: pick(raw.wordSpacing, SPACING, DEFAULT_READING_COMFORT.wordSpacing),
    face: pick(raw.face, FACES, DEFAULT_READING_COMFORT.face),
    tone: pick(raw.tone, TONES, DEFAULT_READING_COMFORT.tone),
    focusLine:
      typeof raw.focusLine === "boolean"
        ? raw.focusLine
        : DEFAULT_READING_COMFORT.focusLine,
    listenPace: pick(raw.listenPace, PACES, DEFAULT_READING_COMFORT.listenPace),
  };
}

/**
 * True when nothing on the page should change.
 * Listen pace is excluded: it only affects speech.
 */
export function isDisplayComfortDefault(comfort: ReadingComfort): boolean {
  const defaults = DEFAULT_READING_COMFORT;
  return (
    comfort.typeSize === defaults.typeSize &&
    comfort.lineSpacing === defaults.lineSpacing &&
    comfort.letterSpacing === defaults.letterSpacing &&
    comfort.wordSpacing === defaults.wordSpacing &&
    comfort.face === defaults.face &&
    comfort.tone === defaults.tone &&
    comfort.focusLine === defaults.focusLine
  );
}

/** speechSynthesis.rate for Listen pace. Steady matches the previous default (1). */
export function speechRateForPace(pace: ListenPace): number {
  if (pace === "slower") return 0.75;
  if (pace === "faster") return 1.25;
  return 1;
}

/** CSS custom properties applied only to clarified/original reading text. */
export function readingTextStyleVars(
  comfort: ReadingComfort,
): Record<string, string> {
  const typeSize =
    comfort.typeSize === "smaller"
      ? "0.8rem"
      : comfort.typeSize === "larger"
        ? "1.05rem"
        : "0.875rem";

  const lineHeight =
    comfort.lineSpacing === "tighter"
      ? "1.35"
      : comfort.lineSpacing === "roomier"
        ? "1.9"
        : "1.6";

  const letterSpacing =
    comfort.letterSpacing === "tighter"
      ? "-0.02em"
      : comfort.letterSpacing === "roomier"
        ? "0.06em"
        : "normal";

  const wordSpacing =
    comfort.wordSpacing === "tighter"
      ? "-0.05em"
      : comfort.wordSpacing === "roomier"
        ? "0.2em"
        : "normal";

  const face =
    comfort.face === "clear"
      ? '"Lexend", "Atkinson Hyperlegible", system-ui, sans-serif'
      : "inherit";

  let ink = "#1a1814";
  let bg = "#f3ebe0";
  if (comfort.tone === "soft") {
    ink = "#5c564c";
    bg = "#faf6f0";
  } else if (comfort.tone === "strong") {
    ink = "#0a0908";
    bg = "#ffffff";
  }

  return {
    ["--linaw-type-size"]: typeSize,
    ["--linaw-line-height"]: lineHeight,
    ["--linaw-letter-spacing"]: letterSpacing,
    ["--linaw-word-spacing"]: wordSpacing,
    ["--linaw-reading-face"]: face,
    ["--linaw-reading-ink"]: ink,
    ["--linaw-reading-bg"]: bg,
  };
}
