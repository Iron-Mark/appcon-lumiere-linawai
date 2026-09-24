import { LINAW_PIPER_ID, type LinawTts } from "@/lib/listen/linaw-voice";

type SandboxReply = {
  source?: string;
  id?: number;
  ok?: boolean;
  buffer?: ArrayBuffer;
  stored?: string[];
  error?: string;
};

let frameWindow: Window | null = null;
let frameReady: Promise<Window> | null = null;
let nextId = 1;

function sandboxFrame(): Promise<Window> {
  if (frameWindow) return Promise.resolve(frameWindow);
  if (frameReady) return frameReady;
  frameReady = new Promise((resolve, reject) => {
    const failTimer = window.setTimeout(() => {
      frameReady = null;
      reject(new Error("Linaw voice frame did not start (blocked by this page)."));
    }, 10_000);
    let iframe: HTMLIFrameElement | null = null;
    try {
      iframe = document.createElement("iframe");
      const runtimeUrl = chrome.runtime?.getURL;
      if (!runtimeUrl) {
        window.clearTimeout(failTimer);
        frameReady = null;
        reject(new Error("Linaw voice frame is only available in the extension."));
        return;
      }
      iframe.hidden = true;
      iframe.title = "Linaw voice";
      iframe.src = runtimeUrl("sandbox.html");
    } catch {
      window.clearTimeout(failTimer);
      frameReady = null;
      reject(new Error("Linaw voice frame was blocked by this page."));
      return;
    }
    iframe.addEventListener("load", () => {
      window.clearTimeout(failTimer);
      if (!iframe?.contentWindow) {
        frameReady = null;
        reject(new Error("Linaw voice frame did not start."));
        return;
      }
      frameWindow = iframe.contentWindow;
      resolve(iframe.contentWindow);
    });
    iframe.addEventListener("error", () => {
      window.clearTimeout(failTimer);
      frameReady = null;
      reject(new Error("Linaw voice frame did not load."));
    });
    try {
      (document.documentElement ?? document.body).appendChild(iframe);
    } catch {
      window.clearTimeout(failTimer);
      frameReady = null;
      reject(new Error("Linaw voice frame was blocked by this page."));
    }
  });
  return frameReady;
}

function callSandbox(
  op: "stored" | "download" | "predict",
  text?: string,
): Promise<SandboxReply> {
  const id = nextId++;
  // First predict can download the voice model; control ops stay short.
  const timeoutMs = op === "predict" ? 60_000 : 10_000;
  return sandboxFrame().then(
    (target) =>
      new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
          window.removeEventListener("message", onMessage);
          reject(new Error("Linaw voice timed out — using device voice instead."));
        }, timeoutMs);
        const onMessage = (event: MessageEvent<SandboxReply>) => {
          if (event.source !== target) return;
          if (event.data?.source !== "linaw-sandbox" || event.data.id !== id) return;
          window.clearTimeout(timer);
          window.removeEventListener("message", onMessage);
          if (!event.data.ok) {
            reject(new Error(event.data.error || "Linaw voice failed."));
            return;
          }
          resolve(event.data);
        };
        window.addEventListener("message", onMessage);
        target.postMessage({ source: "linaw-panel", id, op, text });
      }),
  );
}

/** Piper runs in the extension sandbox, where eval is allowed. */
export function extensionLinawTts(): LinawTts {
  return {
    stored: async () => (await callSandbox("stored")).stored ?? [],
    download: async () => {
      await callSandbox("download");
    },
    predict: async ({ text }) => {
      const result = await callSandbox("predict", text);
      if (!result.buffer) throw new Error("Linaw voice returned no audio.");
      return new Blob([result.buffer], { type: "audio/wav" });
    },
  };
}
