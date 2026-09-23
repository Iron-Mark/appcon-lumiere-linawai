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
        enabled: Boolean(process.env.HUGGINGFACE_API_KEY?.trim()),
        // Operational status of the auxiliary check itself — distinct from
        // `enabled` (which only reflects whether a key is configured) and
        // from `flaggedClaims` (which is 0 both when HF wasn't reached AND
        // when it was reached but found nothing). See runNLICheck() below.
        //   "disabled"     — no HUGGINGFACE_API_KEY; NLI intentionally skipped.
        //   "ok"           — HF request completed and was parsed for scoring
        //                    (zero findings still counts as "ok").
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

/**
 * Auxiliary semantic-contradiction check against the raw original text.
 * Strictly non-blocking: never throws, never rejects. Any operational
 * failure (network error, timeout, non-2xx, malformed payload) is reported
 * via `status: "soft_failure"` with empty findings — never as a thrown
 * error — so the primary Gemini verification/repair pipeline proceeds
 * unaffected either way.
 *
 * `status` answers a different question than `findings`/`flaggedClaims`:
 * it tells you whether the HF request itself completed and was usable,
 * independent of whether any contradiction happened to be found. A
 * successful request that finds zero contradictions is still "ok" — do not
 * infer HF health from `findings.length` alone.
 */
async function runNLICheck(
  sourceText: string,
  adaptedText: string
): Promise<NLICheckResult> {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!apiKey) {
    // Environment & Security Decoupling: silently bypass when unconfigured.
    return { status: "disabled", findings: [], auditedClaims: 0 };
  }

  const claims = splitIntoClaims(adaptedText).slice(0, MAX_NLI_CLAIMS);
  if (claims.length === 0) {
    // Nothing to audit (e.g. empty adaptedText) — not an operational
    // failure, just no-op. No HF request is made in this case.
    return { status: "ok", findings: [], auditedClaims: 0 };
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
      return { status: "soft_failure", findings: [], auditedClaims: claims.length };
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      // Unexpected/malformed response shape — could not be parsed for
      // normal scoring logic, so this is a soft failure, not an "ok" with
      // zero findings.
      console.warn("[NLI] Hugging Face returned an unexpected payload shape; skipping semantic check for this request.");
      return { status: "soft_failure", findings: [], auditedClaims: claims.length };
    }

    return { status: "ok", findings: extractContradictions(payload, claims), auditedClaims: claims.length };
  } catch (err) {
    // Network failure or "llm_timeout" from withTimeout.
    console.warn("[NLI] semantic contradiction check failed or timed out:", err);
    return { status: "soft_failure", findings: [], auditedClaims: claims.length };
  }
}