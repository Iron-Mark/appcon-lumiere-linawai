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
import { adaptWithModel, modelConfigured, readModelProviders } from "./model";

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

function plainError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function normalizeKey(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Lets the UI say up front whether text will be sent to a model. */
export async function GET(): Promise<Response> {
  const providers = readModelProviders().map((p) => p.kind);
  return Response.json({
    adapter: providers.length > 0 ? "model" : "fixture",
    providers,
  });
}

export async function POST(request: Request): Promise<Response> {
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
  const input = parsed.data;

  const isSeededDemo =
    normalizeKey(input.source) === normalizeKey(SEEDED_FAILURE_SOURCE);

  if (!isSeededDemo && input.source.trim() && modelConfigured()) {
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
