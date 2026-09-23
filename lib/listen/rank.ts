import type { ListenVoice } from "./settings";

/** Explicit browser default, even when it is the rough system voice. */
export const DEVICE_VOICE_ID = "device";

/** Free Piper voice. Not a speechSynthesis voice. */
export const LINAW_VOICE_ID = "linaw";

export function scoreListenVoice(voice: ListenVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;
  if (/natural|neural|online/.test(name)) score += 50;
  if (/zira|aria|jenny|sonia|libby/.test(name)) score += 30;
  if (lang.startsWith("en-ph") || lang.startsWith("fil") || lang.startsWith("tl")) {
    score += 20;
  }
  if (name.includes("google")) score += 10;
  if (/microsoft david|microsoft mark/.test(name)) score -= 80;
  return score;
}

/** Highest score first. Equal scores keep a stable name order. */
export function rankListenVoices(voices: readonly ListenVoice[]): ListenVoice[] {
  return [...voices].sort(
    (a, b) =>
      scoreListenVoice(b) - scoreListenVoice(a) || a.name.localeCompare(b.name),
  );
}

/** Clearest installed voice, or null when every voice is rough. */
export function bestListenVoice(voices: readonly ListenVoice[]): ListenVoice | null {
  const top = rankListenVoices(voices)[0];
  // Negative scores are the rough system voices. Zero is a plain installed voice.
  if (!top || scoreListenVoice(top) < 0) return null;
  return top;
}

export function deviceVoiceName(voices: readonly ListenVoice[]): string | null {
  return voices.find((voice) => voice.default)?.name ?? null;
}
