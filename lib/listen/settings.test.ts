import { describe, expect, it } from "vitest";
import {
  applyListenSettings,
  normalizeListenSettings,
  resolveListenVoice,
} from "./settings";

const voices = [
  { voiceURI: "fil-ph", name: "Filipino", lang: "fil-PH" },
  { voiceURI: "en-us", name: "English", lang: "en-US" },
];

describe("normalizeListenSettings", () => {
  it("keeps allowed pitch and pace and drops the rest", () => {
    expect(
      normalizeListenSettings({ voiceURI: "fil-ph", pitch: 1.15, rate: 1.25 }),
    ).toEqual({ voiceURI: "fil-ph", pitch: 1.15, rate: 1.25 });
    expect(
      normalizeListenSettings({ voiceURI: 4, pitch: 9, rate: "fast" }),
    ).toEqual({ voiceURI: "", pitch: 1, rate: 1 });
  });
});

describe("applyListenSettings", () => {
  it("uses the saved voice, pitch, and pace", () => {
    const target = { rate: 0, pitch: 0, voice: null };
    applyListenSettings(
      target,
      { voiceURI: "fil-ph", pitch: 0.85, rate: 0.8 },
      voices,
    );
    expect(target).toEqual({
      rate: 0.8,
      pitch: 0.85,
      voice: voices[0],
    });
  });

  it("falls back to the device default when the saved voice is missing", () => {
    const target = { rate: 1, pitch: 1, voice: voices[1] };
    applyListenSettings(
      target,
      { voiceURI: "gone", pitch: 1, rate: 1 },
      voices,
    );
    expect(target.voice).toBeNull();
    expect(resolveListenVoice(voices, "")).toBeNull();
  });
});
