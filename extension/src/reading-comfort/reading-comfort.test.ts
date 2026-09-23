import { describe, expect, it } from "vitest";
import {
  DEFAULT_READING_COMFORT,
  normalizeReadingComfort,
  readingTextStyleVars,
  speechRateForPace,
} from "./defaults";
import { splitDeadlineMarks } from "./deadline-marks";
import {
  advanceFocusLine,
  clampFocusLine,
  splitReadingLines,
} from "./focus-line";

describe("normalizeReadingComfort", () => {
  it("returns defaults for empty input", () => {
    expect(normalizeReadingComfort(undefined)).toEqual(DEFAULT_READING_COMFORT);
    expect(normalizeReadingComfort(null)).toEqual(DEFAULT_READING_COMFORT);
    expect(normalizeReadingComfort({})).toEqual(DEFAULT_READING_COMFORT);
  });

  it("keeps valid fields and drops invalid ones", () => {
    const next = normalizeReadingComfort({
      typeSize: "larger",
      face: "clear",
      focusLine: true,
      listenPace: "faster",
      // @ts-expect-error intentional invalid
      tone: "neon",
    });
    expect(next.typeSize).toBe("larger");
    expect(next.face).toBe("clear");
    expect(next.focusLine).toBe(true);
    expect(next.listenPace).toBe("faster");
    expect(next.tone).toBe("paper");
  });

  it("defaults focus line to off", () => {
    expect(DEFAULT_READING_COMFORT.focusLine).toBe(false);
  });
});

describe("speechRateForPace", () => {
  it("maps slower / steady / faster", () => {
    expect(speechRateForPace("slower")).toBeLessThan(1);
    expect(speechRateForPace("steady")).toBe(1);
    expect(speechRateForPace("faster")).toBeGreaterThan(1);
  });
});

describe("readingTextStyleVars", () => {
  it("sets clear face and soft tone vars", () => {
    const vars = readingTextStyleVars({
      ...DEFAULT_READING_COMFORT,
      face: "clear",
      tone: "soft",
      typeSize: "smaller",
    });
    expect(vars["--linaw-reading-face"]).toContain("Lexend");
    expect(vars["--linaw-type-size"]).toBe("0.8rem");
    expect(vars["--linaw-reading-bg"]).toBeTruthy();
  });
});

describe("splitDeadlineMarks", () => {
  it("marks dates, times, and numbers without changing plain join", () => {
    const text =
      "Mentors Friday 8:30 AM; others by Thursday 5 PM. Bring 2 forms.";
    const parts = splitDeadlineMarks(text);
    expect(parts.map((p) => p.text).join("")).toBe(text);
    const marked = parts.filter((p) => p.marked).map((p) => p.text);
    expect(marked).toContain("Friday");
    expect(marked).toContain("8:30 AM");
    expect(marked).toContain("Thursday");
    expect(marked).toContain("5 PM");
    expect(marked).toContain("2");
  });

  it("returns a single unmarked segment when nothing matches", () => {
    expect(splitDeadlineMarks("Hello world")).toEqual([
      { text: "Hello world", marked: false },
    ]);
  });
});

describe("focus line helpers", () => {
  it("splits bullets into lines", () => {
    expect(splitReadingLines("- One\n- Two\n- Three")).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });

  it("splits a paragraph on sentences", () => {
    expect(splitReadingLines("First. Second! Third?")).toEqual([
      "First.",
      "Second!",
      "Third?",
    ]);
  });

  it("advances and clamps focus index", () => {
    expect(advanceFocusLine(0, 3)).toBe(1);
    expect(advanceFocusLine(2, 3)).toBe(2);
    expect(advanceFocusLine(0, 0)).toBe(0);
    expect(clampFocusLine(5, 3)).toBe(2);
    expect(clampFocusLine(-1, 3)).toBe(0);
  });
});
