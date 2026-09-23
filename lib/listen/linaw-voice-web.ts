import type { LinawTts } from "./linaw-voice";

/** Browser-only loader. The extension cannot bundle this package (it uses eval). */
export async function loadLinawTts(): Promise<LinawTts> {
  const tts = (await import("@diffusionstudio/vits-web")) as unknown as LinawTts;
  return tts;
}
