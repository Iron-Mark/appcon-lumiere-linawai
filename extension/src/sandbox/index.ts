import * as tts from "@diffusionstudio/vits-web";
import { LINAW_PIPER_ID } from "@/lib/listen/linaw-voice";

type RequestMessage = {
  source?: string;
  id?: number;
  op?: "stored" | "download" | "predict";
  text?: string;
};

window.addEventListener("message", (event: MessageEvent<RequestMessage>) => {
  const data = event.data;
  if (data?.source !== "linaw-panel" || typeof data.id !== "number") return;
  const replyTo = event.source;
  if (!replyTo || !("postMessage" in replyTo)) return;

  void (async () => {
    try {
      if (data.op === "stored") {
        const stored = await tts.stored();
        replyTo.postMessage({ source: "linaw-sandbox", id: data.id, ok: true, stored });
        return;
      }
      if (data.op === "download") {
        await tts.download(LINAW_PIPER_ID);
        replyTo.postMessage({ source: "linaw-sandbox", id: data.id, ok: true });
        return;
      }
      if (data.op === "predict" && data.text) {
        const wav = await tts.predict({ text: data.text, voiceId: LINAW_PIPER_ID });
        const buffer = await wav.arrayBuffer();
        (replyTo as Window).postMessage(
          { source: "linaw-sandbox", id: data.id, ok: true, buffer },
          "*",
          [buffer],
        );
        return;
      }
      replyTo.postMessage({
        source: "linaw-sandbox",
        id: data.id,
        ok: false,
        error: "Unknown Linaw voice request.",
      });
    } catch (error) {
      replyTo.postMessage({
        source: "linaw-sandbox",
        id: data.id,
        ok: false,
        error: error instanceof Error ? error.message : "Linaw voice failed.",
      });
    }
  })();
});
