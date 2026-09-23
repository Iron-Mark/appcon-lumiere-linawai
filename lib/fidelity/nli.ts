import type { Check } from "@/lib/domain";
import { REASON_NLI_DISCONNECTED } from "./copy";

/** NLI labels supported once a model is wired. */
export type NliLabel = "entailment" | "contradiction" | "neutral";

export type NliSlotResult = {
  label: NliLabel;
  reason: string;
  check: Check;
};

/**
 * Layer 3 — NLI / semantic verification slot.
 * MVP: disconnected stub. Does not call a model.
 * Always returns neutral with a cautious reason.
 */
export function runNliSlot(_input: {
  source: string;
  adaptedText: string;
  claim?: string;
  evidence?: string;
}): NliSlotResult {
  const label: NliLabel = "neutral";
  const reason = REASON_NLI_DISCONNECTED;

  return {
    label,
    reason,
    check: {
      claim: "Semantic verification (NLI): neutral",
      // Disconnected slot must not invent entailment or contradiction.
      status: "pass",
      evidence: _input.evidence ?? "",
      reason,
    },
  };
}
