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

const model = google("gemini-3.8-flash");
const TIMEOUT_MS = 25_000;

// ---------- Auxiliary NLI (Natural Language Inference) check ----------
// NLI is now ENDPOINT-DRIVEN: NLI_ENDPOINT must point at a real, deployed
// inference backend (e.g. a dedicated Hugging Face Inference Endpoint
// running cross-encoder/nli-deberta-v3-base today, or our fine-tuned Linaw
// DeBERTa checkpoint later — same integration, different URL/model behind
// it). We deliberately do NOT construct an assumed serverless Hugging Face
// model URL from the model name anymore: a HUGGINGFACE_API_KEY + model ID
// is NOT sufficient evidence that serverless inference actually exists for
// that model (confirmed: cross-encoder/nli-deberta-v3-base is on the Hub
// but was not served by the general Inference Providers routing we were
// hitting — requests failed at DNS resolution, not authentication).
// HUGGINGFACE_API_KEY is used ONLY as bearer auth for NLI_ENDPOINT, and is
// no longer used to decide whether NLI is "enabled".
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
    const [verification, nliResult] = await Promise.all([
      withTimeout(
        generateObject({
          model,
          schema: VerificationOutputSchema,
          system: VERIFICATION_SYSTEM_PROMPT,
          prompt: buildVerificationPrompt(originalText, generative.object.adaptedText, preferences),
        }),
        TIMEOUT_MS
      ),
      runNLICheck(originalText, generative.object.adaptedText),
    ]);

    // --- 2b. Merge Gemini issues + NLI-synthesized issues ---
    const nliIssues: VerificationOutput["issues"] = nliResult.findings
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
        // `enabled` now reflects whether a remote NLI endpoint is
        // configured at all (NLI_ENDPOINT), NOT whether a Hugging Face
        // token exists — a token alone proves nothing about whether a
        // serverless/dedicated backend is actually reachable for this
        // model. See runNLICheck() below for exact status semantics.
        enabled: Boolean(process.env.NLI_ENDPOINT?.trim()),
        // Operational status of the auxiliary check itself — distinct from
        // `enabled` (configuration only) and from `flaggedClaims` (which is
        // 0 both when the endpoint wasn't reached AND when it was reached
        // but found nothing).
        //   "disabled"     — no NLI_ENDPOINT; NLI intentionally not attempted.
        //   "ok"           — the endpoint request completed and was parsed
        //                    for scoring (zero findings still counts as "ok").
        //   "soft_failure" — NLI was attempted but timeout/non-2xx/malformed
        //                    payload/network error prevented a valid result.
        status: nliResult.status,
        flaggedClaims: nliIssues.length,
        auditedClaims: nliResult.auditedClaims,
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

// Operational status of the auxiliary NLI check, distinct from the
// scoring result itself. See runNLICheck() for exact semantics.
type NLIStatus = "disabled" | "ok" | "soft_failure";
interface NLICheckResult {
  status: NLIStatus;
  findings: NLIFinding[];
  /** Number of claims actually sent to the HF endpoint (0 if not attempted). */
  auditedClaims: number;
}

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

// ---------- NLI endpoint adapter (isolated on purpose) ----------
// This is the ONLY place that should change once we have the exact
// request/response example generated by the Hugging Face Endpoint UI for
// our dedicated deployment. Everything else in runNLICheck (auth, timeout,
// status mapping, scoring/threshold logic) is endpoint-shape-agnostic.
//
// Current shape matches the standard Hugging Face text-classification
// "sentence pair" inference contract: `{ inputs: [{ text, text_pair }] }` in,
// `Array<Array<{ label, score }>>` out. This has NOT been verified against a
// real dedicated Inference Endpoint response yet — it is carried over
// unchanged from the previous (unreachable) serverless integration because
// inspection gives no evidence it is wrong, and inventing a different shape
// without the endpoint's own example would be a guess, not a fix.

/** Request body sent to NLI_ENDPOINT. */
function buildNLIRequestBody(sourceText: string, claims: string[]): unknown {
  return {
    inputs: claims.map((claim) => ({ text: sourceText, text_pair: claim })),
  };
}

/**
 * Parses the NLI_ENDPOINT response body. Returns `null` (not `[]`) when the
 * payload shape is not recognized, so the caller can tell "parsed
 * successfully, zero contradictions" (status="ok") apart from "could not be
 * parsed" (status="soft_failure") — do not collapse these two cases.
 */
function parseNLIResponse(payload: unknown, claims: string[]): NLIFinding[] | null {
  if (!Array.isArray(payload)) return null;
  return extractContradictions(payload, claims);
}

/**
 * Auxiliary semantic-contradiction check against the raw original text, run
 * against a configurable remote NLI_ENDPOINT. Strictly non-blocking: never
 * throws, never rejects. Any operational failure (network error, timeout,
 * non-2xx, malformed payload) is reported via `status: "soft_failure"` with
 * empty findings — never as a thrown error — so the primary Gemini
 * verification/repair pipeline proceeds unaffected either way.
 *
 * `status` answers a different question than `findings`/`flaggedClaims`:
 * it tells you whether the endpoint request itself completed and was
 * usable, independent of whether any contradiction happened to be found. A
 * successful request that finds zero contradictions is still "ok" — do not
 * infer endpoint health from `findings.length` alone.
 */
async function runNLICheck(
  sourceText: string,
  adaptedText: string
): Promise<NLICheckResult> {
  const endpoint = process.env.NLI_ENDPOINT?.trim();
  if (!endpoint) {
    // NLI_ENDPOINT — not HUGGINGFACE_API_KEY — defines whether NLI is
    // configured. A token + model ID is not evidence that a working
    // inference backend exists for that model.
    return { status: "disabled", findings: [], auditedClaims: 0 };
  }

  const claims = splitIntoClaims(adaptedText).slice(0, MAX_NLI_CLAIMS);
  if (claims.length === 0) {
    // Nothing to audit (e.g. empty adaptedText) — not an operational
    // failure, just no-op. No request is made in this case.
    return { status: "ok", findings: [], auditedClaims: 0 };
  }

  // HUGGINGFACE_API_KEY is used ONLY as bearer auth, and only if present —
  // this allows a public test endpoint with no token while still
  // supporting private Hugging Face Endpoints normally.
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const response = await withTimeout(
      fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(buildNLIRequestBody(sourceText, claims)),
      }),
      NLI_TIMEOUT_MS
    );

    if (!response.ok) {
      // e.g. 429 rate limit, 503 cold start — soft failure, not fatal. Log
      // only a safe status code, never the response body (which could echo
      // request headers/tokens depending on the provider's error format).
      console.warn(
        `[NLI] endpoint returned HTTP ${response.status}; skipping semantic check for this request.`
      );
      return { status: "soft_failure", findings: [], auditedClaims: claims.length };
    }

    const payload: unknown = await response.json();
    const findings = parseNLIResponse(payload, claims);
    if (findings === null) {
      // Unexpected/malformed response shape — could not be parsed for
      // normal scoring logic, so this is a soft failure, not an "ok" with
      // zero findings.
      console.warn("[NLI] endpoint returned an unexpected payload shape; skipping semantic check for this request.");
      return { status: "soft_failure", findings: [], auditedClaims: claims.length };
    }

    return { status: "ok", findings, auditedClaims: claims.length };
  } catch (err) {
    // Network failure or "llm_timeout" from withTimeout. Log only the
    // error's safe message/category — never headers or the request body.
    console.warn("[NLI] semantic contradiction check failed or timed out:", err);
    return { status: "soft_failure", findings: [], auditedClaims: claims.length };
  }
}