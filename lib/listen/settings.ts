/**
 * Listen display choices. Not part of the synced reading preferences.
 * An empty voiceURI means automatic (the clearest installed voice).
 * "device" is the browser default. "linaw" is the free downloaded voice.
 */

import { bestListenVoice, DEVICE_VOICE_ID, LINAW_VOICE_ID } from "./rank";

export const LISTEN_SETTINGS_KEY = "linaw.listen.v1";
const LEGACY_RATE_KEY = "linaw.listen.rate";

export const LISTEN_RATES = [0.8, 1, 1.25, 1.5] as const;
export const LISTEN_PITCHES = [0.85, 1, 1.15] as const;

export type ListenRate = (typeof LISTEN_RATES)[number];
export type ListenPitch = (typeof LISTEN_PITCHES)[number];

export type ListenSettings = {
  /** Empty: automatic. "device": browser default. "linaw": downloaded voice. */
  voiceURI: string;
  pitch: ListenPitch;
  rate: ListenRate;
};

export type ListenVoice = {
  voiceURI: string;
  name: string;
  lang: string;
  default?: boolean;
};

export const DEFAULT_LISTEN_SETTINGS: ListenSettings = {
  voiceURI: "",
  pitch: 1,
  rate: 1,
};

export const PITCH_LABELS: Record<ListenPitch, string> = {
  0.85: "Lower",
  1: "Natural",
  1.15: "Higher",
};

function pickNumber<T extends number>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const n = typeof value === "number" ? value : Number(value);
  return (allowed as readonly number[]).includes(n) ? (n as T) : fallback;
}

export function normalizeListenSettings(raw: unknown): ListenSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_LISTEN_SETTINGS };
  const record = raw as Partial<ListenSettings>;
  const voiceURI = typeof record.voiceURI === "string" ? record.voiceURI : "";
  return {
    voiceURI,
    pitch: pickNumber(record.pitch, LISTEN_PITCHES, DEFAULT_LISTEN_SETTINGS.pitch),
    rate: pickNumber(record.rate, LISTEN_RATES, DEFAULT_LISTEN_SETTINGS.rate),
  };
}

/** Saved voice for Web Speech. Automatic and a failed Linaw voice use the best installed voice. */
export function resolveListenVoice(
  voices: readonly ListenVoice[],
  voiceURI: string,
): ListenVoice | null {
  return voiceForSpeech(voiceURI, voices);
}

/** Voice used for Web Speech, including the automatic and Linaw-failure paths. */
export function voiceForSpeech(
  voiceURI: string,
  voices: readonly ListenVoice[],
): ListenVoice | null {
  if (voiceURI === DEVICE_VOICE_ID) return null;
  if (!voiceURI || voiceURI === LINAW_VOICE_ID) return bestListenVoice(voices);
  return (
    voices.find((voice) => voice.voiceURI === voiceURI) ?? bestListenVoice(voices)
  );
}

export type ListenUtteranceTarget = {
  rate: number;
  pitch: number;
  voice: ListenVoice | null;
};

/** Apply pace, pitch, and voice. A missing voice falls back to the device default. */
export function applyListenSettings(
  target: ListenUtteranceTarget,
  settings: ListenSettings,
  voices: readonly ListenVoice[],
): void {
  const next = normalizeListenSettings(settings);
  target.rate = next.rate;
  target.pitch = next.pitch;
  target.voice = voiceForSpeech(next.voiceURI, voices);
}

export function loadListenSettings(): ListenSettings {
  if (typeof window === "undefined") return { ...DEFAULT_LISTEN_SETTINGS };
  try {
    const raw = window.localStorage.getItem(LISTEN_SETTINGS_KEY);
    if (raw) return normalizeListenSettings(JSON.parse(raw));
    const legacy = window.localStorage.getItem(LEGACY_RATE_KEY);
    const rate = legacy ? Number(legacy) : NaN;
    if ((LISTEN_RATES as readonly number[]).includes(rate)) {
      return { ...DEFAULT_LISTEN_SETTINGS, rate: rate as ListenRate };
    }
  } catch {
    // A bad stored value falls back to the device default.
  }
  return { ...DEFAULT_LISTEN_SETTINGS };
}

export function saveListenSettings(settings: ListenSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LISTEN_SETTINGS_KEY,
      JSON.stringify(normalizeListenSettings(settings)),
    );
  } catch {
    // Preference is a convenience; ignore storage failures.
  }
}
