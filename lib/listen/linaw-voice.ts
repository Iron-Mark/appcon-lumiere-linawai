import type { ListenPitch, ListenRate } from "./settings";

/** Piper Lessac low. Downloaded on first use, not stored in git. */
export const LINAW_PIPER_ID = "en_US-hfc_female-medium";

export const LINAW_DOWNLOAD_NOTE = "Downloading the Linaw voice…";
export const LINAW_FALLBACK_NOTE = "This play used the device voice.";

type Progress = { loaded: number; total: number };

export type LinawTts = {
  download: (voiceId: string, onProgress?: (progress: Progress) => void) => Promise<unknown>;
  predict: (options: { text: string; voiceId: string }) => Promise<Blob>;
  stored?: () => Promise<string[]>;
};

export type SpeakLinawHooks = {
  load?: () => Promise<LinawTts>;
  play?: (wav: Blob, rate: ListenRate, pitch: ListenPitch) => Promise<void>;
  onNote?: (note: string | null) => void;
};

let stopCurrent: (() => void) | null = null;

export function stopLinawVoice(): void {
  stopCurrent?.();
  stopCurrent = null;
}

async function playWav(wav: Blob, rate: ListenRate, pitch: ListenPitch): Promise<void> {
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(await wav.arrayBuffer());
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.detune.value = 12 * Math.log2(pitch) * 100;
  source.connect(ctx.destination);
  stopCurrent = () => {
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
    void ctx.close();
  };
  await new Promise<void>((resolve, reject) => {
    source.onended = () => {
      stopCurrent = null;
      resolve();
    };
    source.addEventListener("error", () => reject(new Error("Linaw voice playback failed")));
    source.start();
  });
  await ctx.close();
}

/**
 * Speak with the free Linaw voice. Returns false when download or playback fails
 * so the caller can use the device voice for this turn.
 */
export async function speakLinawVoice(
  text: string,
  rate: ListenRate,
  pitch: ListenPitch,
  hooks: SpeakLinawHooks = {},
): Promise<boolean> {
  const onNote = hooks.onNote ?? (() => {});
  try {
    if (!hooks.load) throw new Error("Linaw voice is not available here.");
    const api = await hooks.load();
    const have = api.stored ? await api.stored() : [];
    if (!have.includes(LINAW_PIPER_ID)) onNote(LINAW_DOWNLOAD_NOTE);
    await api.download(LINAW_PIPER_ID);
    onNote(null);
    const wav = await api.predict({ text, voiceId: LINAW_PIPER_ID });
    await (hooks.play ?? playWav)(wav, rate, pitch);
    return true;
  } catch {
    onNote(LINAW_FALLBACK_NOTE);
    return false;
  }
}
