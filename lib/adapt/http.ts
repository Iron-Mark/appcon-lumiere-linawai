import {
  AdaptResponseSchema,
  type AdaptRequest,
  type AdaptResponse,
} from "@/lib/domain";
import { adapt as adaptFixture } from "./fixture";

export { getDevelopmentSampleSource } from "./fixture";

export type AdapterInfo = {
  adapter: "model" | "fixture";
  providers: string[];
};

/**
 * Asks the route what will handle the next adaptation, so the reading UI can
 * tell the reader up front whether their text will be sent to a model.
 * Falls back to "fixture" when the route is unreachable.
 */
type ExtensionAdaptReply = {
  ok?: boolean;
  status?: number;
  json?: unknown;
};

/**
 * Content-script bridge. The web app has no chrome.runtime id, so it keeps
 * posting to a relative `/api/adapt`. The extension asks its service worker,
 * which calls the Linaw app (Gemini, then Pandev, then the fixture).
 */
function extensionSendMessage():
  | ((message: unknown) => Promise<ExtensionAdaptReply>)
  | null {
  const runtime = (
    globalThis as {
      chrome?: {
        runtime?: {
          id?: string;
          sendMessage?: (message: unknown) => Promise<unknown>;
        };
      };
    }
  ).chrome?.runtime;
  if (!runtime?.id || typeof runtime.sendMessage !== "function") return null;
  const send = runtime.sendMessage.bind(runtime);
  return async (message) => (await send(message)) as ExtensionAdaptReply;
}

async function extensionExchange(
  message: unknown,
): Promise<ExtensionAdaptReply | null> {
  const send = extensionSendMessage();
  if (!send) return null;
  try {
    return await send(message);
  } catch {
    return null;
  }
}

export async function getAdapterInfo(): Promise<AdapterInfo> {
  if (extensionSendMessage()) {
    const viaExtension = await extensionExchange({ type: "linaw.adaptInfo" });
    return parseAdapterInfo(viaExtension?.json);
  }

  try {
    const res = await fetch("/api/adapt", { method: "GET" });
    if (!res.ok) return { adapter: "fixture", providers: [] };
    return parseAdapterInfo(await res.json());
  } catch {
    return { adapter: "fixture", providers: [] };
  }
}

function parseAdapterInfo(json: unknown): AdapterInfo {
  const body = (json ?? {}) as Partial<AdapterInfo>;
  return {
    adapter: body.adapter === "model" ? "model" : "fixture",
    providers: Array.isArray(body.providers) ? body.providers.map(String) : [],
  };
}

/**
 * Thrown when `/api/adapt` returns a plain-language error body.
 * Callers (e.g. /read) surface `message` in the existing error toast.
 * Network failures and non-JSON/unavailable responses do not throw;
 * they fall back to the in-browser fixture instead.
 */
export class AdaptRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdaptRequestError";
  }
}

function plainErrorFromBody(json: unknown): string | null {
  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    typeof (json as { error: unknown }).error === "string"
  ) {
    const message = (json as { error: string }).error.trim();
    return message.length > 0 ? message : null;
  }
  return null;
}

/**
 * Client adapt implementation: POST to `/api/adapt`, then fall back to the
 * in-browser fixture if the server is unreachable or the body is not usable.
 * A JSON error response from the route is rethrown as AdaptRequestError.
 * Callers import adapt() from `@/lib/adapt` only.
 */
export async function adapt(input: AdaptRequest): Promise<AdaptResponse> {
  if (extensionSendMessage()) {
    const viaExtension = await extensionExchange({ type: "linaw.adapt", input });
    if (!viaExtension) return localFallback(input);
    return adaptFromExchange(viaExtension, input);
  }

  try {
    const res = await fetch("/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return localFallback(input);
    }

    if (!res.ok) {
      const message = plainErrorFromBody(json);
      if (message) {
        throw new AdaptRequestError(message);
      }
      return localFallback(input);
    }

    const parsed = AdaptResponseSchema.safeParse(json);
    if (!parsed.success) {
      return localFallback(input);
    }

    return parsed.data;
  } catch (err) {
    if (err instanceof AdaptRequestError) {
      throw err;
    }
    return localFallback(input);
  }
}

function adaptFromExchange(
  reply: ExtensionAdaptReply,
  input: AdaptRequest,
): Promise<AdaptResponse> {
  if (!reply.ok && reply.json == null) {
    return localFallback(input);
  }
  const message = plainErrorFromBody(reply.json);
  if (reply.status && reply.status >= 400 && message) {
    throw new AdaptRequestError(message);
  }
  const parsed = AdaptResponseSchema.safeParse(reply.json);
  if (!parsed.success) {
    return localFallback(input);
  }
  return Promise.resolve(parsed.data);
}

/** In-browser fixture, labelled so the UI never presents it as a model result. */
async function localFallback(input: AdaptRequest): Promise<AdaptResponse> {
  const result = await adaptFixture(input);
  return { ...result, adapter: "fixture" };
}
