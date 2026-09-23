import { z } from "zod";
import {
  CriticalFactTypeSchema,
  MeaningMapSchema,
  type AdaptRequest,
  type AdaptResponse,
  type CriticalFact,
  type MeaningMap,
} from "@/lib/domain";
import {
  GENERATIVE_SYSTEM_PROMPT,
  buildGenerativePrompt,
} from "@/lib/adapt/prompts";
import { runFidelityGuard } from "@/lib/fidelity";

/**
 * Server-only model adapter for /api/adapt.
 *
 * Provider order:
 *   1. Gemini            — GEMINI_API_KEY (+ GEMINI_MODEL, default gemini-3.8-flash)
 *   2. OpenAI-compatible — LLM_API_BASE + LLM_API_KEY (+ LLM_MODEL, default auto);
 *                          used as the fallback gateway when Gemini is unset or fails
 *   3. (route) fixture   — when neither answers, the route falls back and says so
 *
 * Each provider is asked for a strict JSON meaning map + adapted text. The
 * verbatim-evidence rule is enforced here rather than trusted, then the same
 * Fidelity Guard the fixture path uses runs on the result.
 *
 * Keys never leave this process. Source text is not logged.
 */

/** Gemini answers in seconds; the fallback gateway takes ~20–30 s with thinking disabled. */
const GEMINI_TIMEOUT_MS = 40_000;
const GATEWAY_TIMEOUT_MS = 75_000;

export type ModelProvider =
  | { kind: "gemini"; apiKey: string; model: string }
  | { kind: "openai-compatible"; baseUrl: string; apiKey: string; model: string };

/** Configured providers, in the order they should be tried. */
export function readModelProviders(): ModelProvider[] {
  const providers: ModelProvider[] = [];

  const geminiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (geminiKey) {
    providers.push({
      kind: "gemini",
      apiKey: geminiKey,
      model: (process.env.GEMINI_MODEL ?? "").trim() || "gemini-3.8-flash",
    });
  }

  const baseUrl = (process.env.LLM_API_BASE ?? "").trim().replace(/\/+$/, "");
  const apiKey = (process.env.LLM_API_KEY ?? "").trim();
  if (baseUrl && apiKey) {
    providers.push({
      kind: "openai-compatible",
      baseUrl,
      apiKey,
      model: (process.env.LLM_MODEL ?? "").trim() || "auto",
    });
  }

  return providers;
}

/** True when at least one model provider is configured. */
export function modelConfigured(): boolean {
  return readModelProviders().length > 0;
}

/** Output contract we ask the model for. Lenient on nulls; ids are assigned here. */
const ModelFactSchema = z.object({
  type: z.string(),
  actor: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  exception: z.string().nullable().optional(),
  negated: z.boolean().optional(),
  evidence: z.string(),
});

const ModelOutputSchema = z.object({
  sourceIntent: z.string().default(""),
  criticalFacts: z.array(ModelFactSchema).default([]),
  adaptedText: z.string(),
});

const FORMAT_INSTRUCTIONS = `
OUTPUT FORMAT — return ONE JSON object and nothing else (no prose, no code fences):
{
  "sourceIntent": "one short line saying what the source is for",
  "criticalFacts": [
    {
      "type": "deadline | schedule | date | time | quantity | condition | exception | permission | prohibition | negation | actor | action | relationship | other",
      "actor": "who this concerns, or null",
      "action": "what they do / must do, or null",
      "value": "the concrete value — a time, date, amount, place — copied exactly from the source, or null",
      "condition": "an 'only if / unless' gate copied from the source, or null",
      "exception": "an override copied from the source, or null",
      "negated": false,
      "evidence": "EXACT verbatim sentence or clause from the source that supports this fact"
    }
  ],
  "adaptedText": "the recipient-facing adaptation, following the TARGET PREFERENCES; use a newline between key points"
}
Rules: keep every value/condition/exception in the adaptedText spelled exactly as in the source. Facts must be grounded — if you cannot quote evidence verbatim, leave the fact out. Aim for 3–8 facts.
`.trim();

export type ModelAdaptResult = {
  response: AdaptResponse;
  provider: ModelProvider["kind"];
};

/**
 * Try each configured provider in order; the first grounded, non-empty answer
 * wins. Returns null when none is configured or all fail.
 */
export async function adaptWithModel(
  input: AdaptRequest,
  providers: ModelProvider[] = readModelProviders(),
): Promise<ModelAdaptResult | null> {
  const systemPrompt = `${GENERATIVE_SYSTEM_PROMPT}\n\n${FORMAT_INSTRUCTIONS}`;
  const userPrompt = buildGenerativePrompt(input.source, {
    detail: input.preferences.detail,
    wording: input.preferences.wording,
  });

  for (const provider of providers) {
    const raw =
      provider.kind === "gemini"
        ? await callGemini(provider, systemPrompt, userPrompt)
        : await callChatCompletion(provider, systemPrompt, userPrompt);
    if (!raw) continue;

    const parsed = parseModelJson(raw);
    if (!parsed) continue;

    const adaptedText = parsed.adaptedText.trim();
    if (!adaptedText) continue;
    const meaningMap = groundMeaningMap(parsed, input.source);

    const guard = await runFidelityGuard({
      source: input.source,
      adaptedText,
      meaningMap,
      preferences: input.preferences,
      nliEndpoint: process.env.NLI_ENDPOINT?.trim() || undefined,
    });

    return {
      provider: provider.kind,
      response: {
        adaptedText,
        meaningMap,
        checks: guard.checks,
        overallStatus: guard.overallStatus,
        adapter: "model",
      },
    };
  }

  return null;
}

/** Gemini REST — generateContent with JSON response mode. */
async function callGemini(
  provider: Extract<ModelProvider, { kind: "gemini" }>,
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": provider.apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const text = pickGeminiText(json);
    return text && text.trim() ? text : null;
  } catch {
    return null;
  }
}

/** candidates[0].content.parts[].text joined. */
function pickGeminiText(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const candidates = (json as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } }).content?.parts;
  if (!Array.isArray(parts)) return null;
  return parts
    .map((p) => (typeof p === "object" && p && "text" in p ? String((p as { text: unknown }).text) : ""))
    .join("");
}

/** OpenAI-compatible chat completions (the fallback gateway). */
async function callChatCompletion(
  provider: Extract<ModelProvider, { kind: "openai-compatible" }>,
  systemPrompt: string,
  userPrompt: string,
): Promise<string | null> {
  const body = {
    model: provider.model,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    // vLLM-hosted Qwen: skip the hidden reasoning pass. Extraction here is
    // schema-driven, and thinking triples latency (≈75 s → ≈25 s) for no gain
    // in grounding — the Guard verifies the output anyway. Ignored by servers
    // that do not know the field.
    chat_template_kwargs: { enable_thinking: false },
  };

  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const content = pickContent(json);
    return content && content.trim() ? content : null;
  } catch {
    return null;
  }
}

/** choices[0].message.content — ignore reasoning_content. */
function pickContent(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string") return content;
  // Some servers return content as an array of parts.
  if (Array.isArray(content)) {
    return content
      .map((p) => (typeof p === "object" && p && "text" in p ? String((p as { text: unknown }).text) : ""))
      .join("");
  }
  return null;
}

/** Strip fences/preamble and parse the first balanced JSON object. */
function parseModelJson(text: string): z.infer<typeof ModelOutputSchema> | null {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  // Walk to the matching brace so trailing chatter does not break JSON.parse.
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  try {
    const obj: unknown = JSON.parse(cleaned.slice(start, end + 1));
    const parsed = ModelOutputSchema.safeParse(obj);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Verbatim-evidence rule, enforced rather than trusted: keep a fact only if its
 * evidence occurs in the source. Case/whitespace slips are repaired to the exact
 * source substring; anything else is dropped so the map stays grounded.
 */
function groundMeaningMap(
  out: z.infer<typeof ModelOutputSchema>,
  source: string,
): MeaningMap {
  const normalizedSource = source.replace(/\s+/g, " ");
  const lowerSource = normalizedSource.toLowerCase();
  const facts: CriticalFact[] = [];

  out.criticalFacts.forEach((f, i) => {
    const evidenceRaw = f.evidence.replace(/\s+/g, " ").trim();
    if (evidenceRaw.length < 4) return;
    let evidence: string | null = null;
    if (normalizedSource.includes(evidenceRaw)) {
      evidence = evidenceRaw;
    } else {
      const at = lowerSource.indexOf(evidenceRaw.toLowerCase());
      if (at !== -1) evidence = normalizedSource.slice(at, at + evidenceRaw.length);
    }
    if (!evidence) return;

    const type = CriticalFactTypeSchema.safeParse(f.type.trim().toLowerCase());
    facts.push({
      id: `fact_${i + 1}`,
      type: type.success ? type.data : "other",
      actor: clean(f.actor),
      action: clean(f.action),
      value: clean(f.value),
      condition: clean(f.condition),
      exception: clean(f.exception),
      negated: Boolean(f.negated),
      evidence,
    });
  });

  return MeaningMapSchema.parse({
    sourceIntent: out.sourceIntent.trim(),
    criticalFacts: facts,
  });
}

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t && t.toLowerCase() !== "null" ? t : null;
}
