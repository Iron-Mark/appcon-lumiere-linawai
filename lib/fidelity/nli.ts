import type { Check, CheckStatus } from "@/lib/domain";
import {
  REASON_NLI_CONTRADICTION,
  REASON_NLI_DISCONNECTED,
  REASON_NLI_ENTAILED,
  REASON_NLI_INCONCLUSIVE,
} from "./copy";

/** NLI labels supported once a model is wired. */
export type NliLabel = "entailment" | "contradiction" | "neutral";

export type NliSlotResult = {
  label: NliLabel;
  reason: string;
  check: Check;
};

export type NliSlotInput = {
  source: string;
  adaptedText: string;
  claim?: string;
  evidence?: string;
  /**
   * Optional predict URL (e.g. http://127.0.0.1:8000/predict).
   * When omitted, uses process.env.NLI_ENDPOINT (Node) or
   * process.env.NEXT_PUBLIC_NLI_ENDPOINT (browser / Next inlines).
   * Unset = disconnected stub; request failures also fall back.
   */
  endpoint?: string;
};

type LabelScore = { label: string; score: number };

const FETCH_TIMEOUT_MS = 4_000;

/**
 * Layer 3 — NLI / semantic verification slot.
 * Uses an explicit endpoint, NLI_ENDPOINT, or NEXT_PUBLIC_NLI_ENDPOINT when
 * configured; otherwise returns neutral with “Semantic check not connected.”
 * Request failures fall back to the same disconnected stub so the reading UI
 * never blocks on the network.
 */
export async function runNliSlot(input: NliSlotInput): Promise<NliSlotResult> {
  const endpoint = resolveEndpoint(input.endpoint);
  if (!endpoint) {
    return disconnectedStub(input);
  }

  try {
    const premise = (input.evidence ?? input.source).trim();
    const hypothesis = (input.claim ?? input.adaptedText).trim();
    if (!premise || !hypothesis) {
      return disconnectedStub(input);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [{ text: premise, text_pair: hypothesis }],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return disconnectedStub(input);
    }

    const payload: unknown = await response.json();
    const label = pickTopLabel(payload);
    if (!label) {
      return disconnectedStub(input);
    }

    return resultForLabel(label, input);
  } catch {
    return disconnectedStub(input);
  }
}

function resolveEndpoint(explicit?: string): string | undefined {
  const fromCaller = explicit?.trim();
  if (fromCaller) return fromCaller;

  try {
    if (typeof process === "undefined") return undefined;
    const fromPublic = process.env?.NEXT_PUBLIC_NLI_ENDPOINT?.trim();
    if (fromPublic) return fromPublic;
    const fromServer = process.env?.NLI_ENDPOINT?.trim();
    return fromServer || undefined;
  } catch {
    return undefined;
  }
}

function disconnectedStub(input: NliSlotInput): NliSlotResult {
  const label: NliLabel = "neutral";
  const reason = REASON_NLI_DISCONNECTED;
  return {
    label,
    reason,
    check: {
      claim: claimFor(label),
      // Disconnected slot must not invent entailment or contradiction.
      status: "pass",
      evidence: input.evidence ?? "",
      reason,
    },
  };
}

function resultForLabel(label: NliLabel, input: NliSlotInput): NliSlotResult {
  const { reason, status } = statusForLabel(label);
  return {
    label,
    reason,
    check: {
      claim: claimFor(label),
      status,
      evidence: input.evidence ?? "",
      reason,
    },
  };
}

function statusForLabel(label: NliLabel): {
  reason: string;
  status: CheckStatus;
} {
  switch (label) {
    case "contradiction":
      return { reason: REASON_NLI_CONTRADICTION, status: "warning" };
    case "entailment":
      return { reason: REASON_NLI_ENTAILED, status: "pass" };
    case "neutral":
      return { reason: REASON_NLI_INCONCLUSIVE, status: "pass" };
  }
}

function claimFor(label: NliLabel): string {
  return `Semantic verification (NLI): ${label}`;
}

/** Parse nli-service POST /predict batch response; pick argmax label. */
function pickTopLabel(payload: unknown): NliLabel | null {
  if (!Array.isArray(payload) || payload.length === 0) return null;
  const first = payload[0];
  if (!Array.isArray(first) || first.length === 0) return null;

  let best: { label: NliLabel; score: number } | null = null;
  for (const entry of first) {
    if (!isLabelScore(entry)) continue;
    const normalized = normalizeLabel(entry.label);
    if (!normalized) continue;
    if (!best || entry.score > best.score) {
      best = { label: normalized, score: entry.score };
    }
  }
  return best?.label ?? null;
}

function isLabelScore(value: unknown): value is LabelScore {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.label === "string" && typeof row.score === "number";
}

function normalizeLabel(raw: string): NliLabel | null {
  const label = raw.trim().toLowerCase();
  if (label === "entailment" || label === "contradiction" || label === "neutral") {
    return label;
  }
  return null;
}
