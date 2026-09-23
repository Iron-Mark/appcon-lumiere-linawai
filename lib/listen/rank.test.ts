import { describe, expect, it } from "vitest";
import { applyListenSettings, type ListenUtteranceTarget } from "./settings";
import { bestListenVoice, DEVICE_VOICE_ID, LINAW_VOICE_ID } from "./rank";

const david = {
  voiceURI: "david",
  name: "Microsoft David",
  lang: "en-US",
  default: true,
};
const natural = {
  voiceURI: "aria",
  name: "Microsoft Aria Online (Natural)",
  lang: "en-US",
};

describe("bestListenVoice", () => {
  it("prefers a Natural voice over Microsoft David", () => {
    expect(bestListenVoice([david, natural])?.voiceURI).toBe("aria");
  });

  it("keeps the browser default when every voice is rough", () => {
    expect(bestListenVoice([david])).toBeNull();
  });

  it("prefers a plain installed voice over Microsoft David", () => {
    const hazel = { voiceURI: "hazel", name: "Microsoft Hazel", lang: "en-GB" };
    expect(bestListenVoice([david, hazel])?.voiceURI).toBe("hazel");
  });
});

describe("explicit device voice", () => {
  it("stays on the browser default even when a clearer voice exists", () => {
    const target: ListenUtteranceTarget = { rate: 1, pitch: 1, voice: natural };
    applyListenSettings(
      target,
      { voiceURI: DEVICE_VOICE_ID, pitch: 1, rate: 1 },
      [david, natural],
    );
    expect(target.voice).toBeNull();
  });

  it("stores Linaw as its own id and falls back to the ranked voice for speech", () => {
    const target: ListenUtteranceTarget = { rate: 1, pitch: 1, voice: null };
    applyListenSettings(
      target,
      { voiceURI: LINAW_VOICE_ID, pitch: 1, rate: 1 },
      [david, natural],
    );
    expect(target.voice?.voiceURI).toBe("aria");
  });
});
