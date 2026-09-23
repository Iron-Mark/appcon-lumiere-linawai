import { describe, expect, it, vi } from "vitest";
import { LINAW_FALLBACK_NOTE, speakLinawVoice } from "./linaw-voice";

describe("speakLinawVoice", () => {
  it("reports the device-voice fallback when download fails", async () => {
    const onNote = vi.fn();
    const ok = await speakLinawVoice("The reading room closes at 6:00 PM.", 1, 1, {
      load: async () => {
        throw new Error("offline");
      },
      onNote,
    });
    expect(ok).toBe(false);
    expect(onNote).toHaveBeenCalledWith(LINAW_FALLBACK_NOTE);
  });

  it("reports the device-voice fallback when playback fails", async () => {
    const onNote = vi.fn();
    const ok = await speakLinawVoice("The reading room closes at 6:00 PM.", 1, 1, {
      load: async () => ({
        stored: async () => ["en_US-lessac-low"],
        download: async () => undefined,
        predict: async () => new Blob(["wav"]),
      }),
      play: async () => {
        throw new Error("audio");
      },
      onNote,
    });
    expect(ok).toBe(false);
    expect(onNote).toHaveBeenCalledWith(LINAW_FALLBACK_NOTE);
  });
});
