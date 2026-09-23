import {
  AdaptRequestSchema,
  AdaptResponseSchema,
  type AdaptResponse,
} from "@/lib/domain";
import {
  adapt as runLocalAdapt,
  SEEDED_FAILURE_SOURCE,
} from "@/lib/adapt/fixture";
import { modelCacheKey, readModelCache, writeModelCache } from "./cache";
import {
  BODY_TOO_LARGE_MESSAGE,
  MAX_SOURCE_CHARS,
  MIN_MODEL_SOURCE_CHARS,
  RATE_LIMIT_MESSAGE,
  SOURCE_TOO_LONG_MESSAGE,
  bodyTooLarge,
  clientAddress,
  isInjectionOnly,
  sanitizeSource,
  takeGetSlot,
  takeModelSlot,
} from "./limit";
import { adaptWithModel, modelConfigured, readModelProviders } from "./model";

/** Gateway abort is 75s. 90s lets the route return fixture instead of a platform kill. */
export const maxDuration = 90;
export const runtime = "nodejs";

/**
 * Adapt POST handler.
 *
 * Order: Gemini → OpenAI-compatible gateway → offline fixture. The response
 * carries `adapter: "model" | "fixture"` so the reading UI can tell the reader
 * whether their text was sent to a model, and a debug header names the
 * provider. The seeded failure example always uses the fixture: it is a
 * deliberately wrong adaptation that exists to show Meaning Check catching it.
 *
 * Source text is never logged.
 */

function plainError(
  message: string,
  status: number,
  headers?: Record<string, string>,
): Response {
  return Response.json({ error: message }, { status, headers });
}

function normalizeKey(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Lets the UI say up front whether text will be sent to a model. */
export async function GET(request: Request): Promise<Response> {
  const slot = takeGetSlot(clientAddress(request));
  if (!slot.ok) {
    return plainError(RATE_LIMIT_MESSAGE, 429, {
      "Retry-After": String(slot.retryAfter),
    });
  }
  const providers = readModelProviders().map((p) => p.kind);
  return Response.json({
    adapter: providers.length > 0 ? "model" : "fixture",
    providers,
  });
}

export async function POST(request: Request): Promise<Response> {
  if (bodyTooLarge(request)) {
    return plainError(BODY_TOO_LARGE_MESSAGE, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return plainError("The request body was not valid JSON.", 400);
  }

  const parsed = AdaptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return plainError("The request did not match the expected shape.", 400);
  }
  const input = {
    ...parsed.data,
    source: sanitizeSource(parsed.data.source),
  };

  if (input.source.length > MAX_SOURCE_CHARS) {
    return plainError(SOURCE_TOO_LONG_MESSAGE, 400);
  }

  const isSeededDemo =
    normalizeKey(input.source) === normalizeKey(SEEDED_FAILURE_SOURCE);
  const skipModel =
    isSeededDemo ||
    input.source.trim().length < MIN_MODEL_SOURCE_CHARS ||
    isInjectionOnly(input.source);

  if (!skipModel && input.source.trim() && modelConfigured()) {
    const key = modelCacheKey(
      input.source,
      input.preferences.detail,
      input.preferences.wording,
    );
    const cached = readModelCache(key);
    if (cached) {
      return Response.json(AdaptResponseSchema.parse(cached), {
        headers: { "x-linaw-adapter": "model:cache" },
      });
    }

    const address = clientAddress(request);
    const slot = takeModelSlot(address);
    if (!slot.ok) {
      return plainError(RATE_LIMIT_MESSAGE, 429, {
        "Retry-After": String(slot.retryAfter),
      });
    }

    const viaModel = await adaptWithModel(input);
    if (viaModel) {
      const body = AdaptResponseSchema.parse({
        ...viaModel.response,
        adapter: "model",
      });
      writeModelCache(key, body);
      return Response.json(body, {
        headers: { "x-linaw-adapter": `model:${viaModel.provider}` },
      });
    }
  }

  const local = await runLocalAdapt(input);
  const response: AdaptResponse = { ...local, adapter: "fixture" };
  return Response.json(AdaptResponseSchema.parse(response), {
    headers: { "x-linaw-adapter": "fixture" },
  });
}
