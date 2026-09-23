import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
  AdaptRequestSchema,
  GenerativeOutputSchema,
  VerificationOutputSchema,
  type VerificationOutput,
} from "@/lib/schemas";
import {
  buildGenerativePrompt,
  buildVerificationPrompt,
  buildRepairPrompt,
  GENERATIVE_SYSTEM_PROMPT,
  VERIFICATION_SYSTEM_PROMPT,
} from "@/lib/prompts";

export const maxDuration = 60;

const model = google("gemini-2.5-flash");
const TIMEOUT_MS = 15_000;

// ---------- Auxiliary NLI (Natural Language Inference) check ----------
const HF_NLI_MODEL_URL =
  "https://api-inference.huggingface.co/models/cross-encoder/nli-deberta-v3-base";
const NLI_TIMEOUT_MS = 5_000;
const NLI_CONTRADICTION_THRESHOLD = 0.75;
// Defensive cap: bounds request payload size and worst-case latency when
// adaptedText has many sentences. Tunable; not part of the original spec but
// necessary to keep a single HF call bounded under a hackathon-tight budget.
const MAX_NLI_CLAIMS = 8;

export async function POST(req: NextRequest) {
  // --- 0. Parse + validate input ---
  const json = await req.json().catch(() => null);
  const parsed = AdaptRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { originalText, preferences } = parsed.data;

  try {
    // --- 1. GENERATIVE LAYER (call #1) ---
    const generative = await withTimeout(
      generateObject({
        model,
        schema: GenerativeOutputSchema,
        system: GENERATIVE_SYSTEM_PROMPT,
        prompt: buildGenerativePrompt(originalText, preferences),
      }),
      TIMEOUT_MS
    );

    // --- 2. VERIFICATION LAYER (call #2) + auxiliary NLI check, IN PARALLEL ---
    // `runNLICheck` never rejects (it swallows all failures internally and
    // resolves to []), so this Promise.all only ever rejects on the Gemini
    // verification call failing/timing out — identical failure behavior to
    // before this change. Running them concurrently means the NLI check adds
    // ~0ms to the critical path in the common case, since Gemini's own
    // verification call already takes longer than the 5s NLI budget.
    const [verification, nliFindings] = await Promise.all([
      withTimeout(
        generateObject({
          model,
          schema: VerificationOutputSchema,
          system: VERIFICATION_SYSTEM_PROMPT,
          prompt: buildVerificationPrompt(originalText, generative.object.adaptedText),
        }),
        TIMEOUT_MS
      ),
      runNLICheck(originalText, generative.object.adaptedText),
    ]);

    // --- 2b. Merge Gemini issues + NLI-synthesized issues ---
    const nliIssues: VerificationOutput["issues"] = nliFindings
      .filter((f) => f.contradictionScore > NLI_CONTRADICTION_THRESHOLD)
      .map((f) => ({
        type: "semantic_contradiction",
        severity: "critical",
        description:
          `Cross-encoder NLI (nli-deberta-v3-base) flagged a likely contradiction ` +
          `(score ${f.contradictionScore.toFixed(2)}) for the claim: "${f.claim}"`,
        originalSnippet:
          originalText.length > 300 ? `${originalText.slice(0, 300)}…` : originalText,
        adaptedSnippet: f.claim,
      }));

    const combinedIssues: VerificationOutput["issues"] = [
      ...verification.object.issues,
      ...nliIssues,
    ];
    const hasCritical = combinedIssues.some((i) => i.severity === "critical");
    const effectiveStatus: VerificationOutput["status"] = hasCritical ? "warning" : "ok";

    // --- 3. Bounded repair (ONE attempt) — now driven by combined issues ---
    let finalText = generative.object.adaptedText;
    let finalMeaningMap = generative.object.meaningMap;
    let repaired = false;

    if (hasCritical) {
      const repair = await withTimeout(
        generateObject({
          model,
          schema: GenerativeOutputSchema,
          system: GENERATIVE_SYSTEM_PROMPT,
          prompt: buildRepairPrompt(originalText, preferences, combinedIssues),
        }),
        TIMEOUT_MS
      );
      finalText = repair.object.adaptedText;
      finalMeaningMap = repair.object.meaningMap;
      repaired = true;
    }

    // --- 4. Respond ---
    return NextResponse.json({
      meaningMap: finalMeaningMap,
      adaptedText: finalText,
      repaired,
      verification: {
        ...verification.object,
        issues: combinedIssues,
        status: effectiveStatus,
      },
      verifiedAgainstFinalText: !repaired,
      nli: {
        enabled: Boolean(process.env.HUGGINGFACE_API_KEY?.trim()),
        flaggedClaims: nliIssues.length,
      },
    });
  } catch (err) {
    console.error("[/api/adapt] pipeline error:", err);
    return NextResponse.json(
      { error: "adaptation_failed", fallback: originalText },
      { status: 502 }
    );
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("llm_timeout")), ms);
  });
  return Promise.race([p, timeoutPromise]).finally(() => clearTimeout(timer));
}

// ---------- NLI helper: cross-encoder/nli-deberta-v3-base via HF Inference API ----------

type NLIFinding = { claim: string; contradictionScore: number };
type HFLabelScore = { label: string; score: number };

function isLabelScore(value: unknown): value is HFLabelScore {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).label === "string" &&
    typeof (value as Record<string, unknown>).score === "number"
  );
}

function splitIntoClaims(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function extractContradictions(payload: unknown, claims: string[]): NLIFinding[] {
  // Expected shape for a list `inputs`: Array<Array<{ label, score }>> — one
  // label/score array per input pair, in the same order as `claims`.
  if (!Array.isArray(payload)) return [];

  const findings: NLIFinding[] = [];
  payload.forEach((row, idx) => {
    if (!Array.isArray(row) || claims[idx] === undefined) return;
    const contradiction = row.find(
      (entry): entry is HFLabelScore =>
        isLabelScore(entry) && entry.label.toLowerCase() === "contradiction"
    );
    if (contradiction) {
      findings.push({ claim: claims[idx], contradictionScore: contradiction.score });
    }
  });
  return findings;
}

/**
 * Auxiliary semantic-contradiction check against the raw original text.
 * Strictly non-blocking: never throws, never rejects. Any failure (missing
 * key, network error, timeout, rate limit, cold start) resolves to `[]` and
 * the primary Gemini verification/repair pipeline proceeds unaffected.
 */
async function runNLICheck(
  sourceText: string,
  adaptedText: string
): Promise<Array<NLIFinding>> {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!apiKey) {
    // Environment & Security Decoupling: silently bypass when unconfigured.
    return [];
  }

  const claims = splitIntoClaims(adaptedText).slice(0, MAX_NLI_CLAIMS);
  if (claims.length === 0) {
    return [];
  }

  try {
    const response = await withTimeout(
      fetch(HF_NLI_MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: claims.map((claim) => ({ text: sourceText, text_pair: claim })),
        }),
      }),
      NLI_TIMEOUT_MS
    );

    if (!response.ok) {
      // e.g. 429 rate limit, 503 model cold start — soft failure, not fatal.
      console.warn(
        `[NLI] Hugging Face inference returned HTTP ${response.status}; skipping semantic check for this request.`
      );
      return [];
    }

    const payload: unknown = await response.json();
    return extractContradictions(payload, claims);
  } catch (err) {
    // Network failure, "llm_timeout" from withTimeout, or malformed response.
    console.warn("[NLI] semantic contradiction check failed or timed out:", err);
    return [];
  }
}