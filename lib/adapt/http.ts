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
export async function getAdapterInfo(): Promise<AdapterInfo> {
  try {
    const res = await fetch("/api/adapt", { method: "GET" });
    if (!res.ok) return { adapter: "fixture", providers: [] };
    const json = (await res.json()) as Partial<AdapterInfo>;
    return {
      adapter: json.adapter === "model" ? "model" : "fixture",
      providers: Array.isArray(json.providers) ? json.providers.map(String) : [],
    };
  } catch {
    return { adapter: "fixture", providers: [] };
  }
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

/** In-browser fixture, labelled so the UI never presents it as a model result. */
async function localFallback(input: AdaptRequest): Promise<AdaptResponse> {
  const result = await adaptFixture(input);
  return { ...result, adapter: "fixture" };
}
