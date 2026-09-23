import type { Check, CriticalFact, MeaningMap, Preferences } from "@/lib/domain";
import {
  REASON_CONDITION_CHANGED,
  REASON_DEADLINE_REVIEW,
  REASON_NO_ISSUE,
} from "./copy";
import {
  containsNormalizedTime,
  includesPhrase,
  normalizeTimeToken,
} from "./normalize";

const HIGH_PRIORITY_TYPES = new Set([
  "condition",
  "deadline",
  "exception",
  "prohibition",
]);

/**
 * Layer 4 — Coverage.
 * For Key Points: critical facts retained, intentionally omitted, or flagged.
 * Conditions, deadlines, exceptions, and prohibitions stay high priority.
 */
export function runCoverageChecks(
  meaningMap: MeaningMap,
  adaptedText: string,
  preferences: Preferences,
  alreadyFlaggedFactIds: Set<string>,
): Check[] {
  const checks: Check[] = [];

  if (preferences.detail !== "key_points") {
    checks.push({
      claim: "Critical fact coverage",
      status: "pass",
      evidence: meaningMap.sourceIntent,
      reason: REASON_NO_ISSUE,
    });
    return checks;
  }

  for (const fact of meaningMap.criticalFacts) {
    if (!isHighPriority(fact)) continue;
    if (alreadyFlaggedFactIds.has(fact.id)) continue;

    if (isFactRetained(fact, adaptedText)) continue;

    checks.push({
      claim: coverageClaim(fact),
      status: "warning",
      evidence: fact.evidence,
      reason:
        fact.type === "deadline" || fact.type === "schedule" || fact.type === "time"
          ? REASON_DEADLINE_REVIEW
          : REASON_CONDITION_CHANGED,
    });
  }

  if (checks.length === 0) {
    checks.push({
      claim: "Critical fact coverage",
      status: "pass",
      evidence: meaningMap.sourceIntent,
      reason: REASON_NO_ISSUE,
    });
  }

  return checks;
}

function isHighPriority(fact: CriticalFact): boolean {
  if (HIGH_PRIORITY_TYPES.has(fact.type)) return true;
  if (fact.condition || fact.exception) return true;
  return false;
}

function isFactRetained(fact: CriticalFact, adaptedText: string): boolean {
  if (fact.condition && includesPhrase(adaptedText, fact.condition)) return true;
  if (fact.exception && includesPhrase(adaptedText, fact.exception)) return true;

  if (fact.value) {
    if (normalizeTimeToken(fact.value)) {
      if (containsNormalizedTime(adaptedText, fact.value)) return true;
    } else if (includesPhrase(adaptedText, fact.value)) {
      return true;
    }
  }

  // Deadline often spans weekday + time across value/evidence.
  if (fact.type === "deadline" || fact.type === "exception" || fact.type === "condition") {
    const evidenceBits = fact.evidence
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 4);
    const hits = evidenceBits.filter((bit) => includesPhrase(adaptedText, bit));
    if (hits.length >= 2) return true;
  }

  return false;
}

function coverageClaim(fact: CriticalFact): string {
  if (fact.condition) return `Condition: ${fact.condition}`;
  if (fact.exception) return `Exception: ${fact.exception}`;
  if (fact.value) return `${fact.type}: ${fact.value}`;
  return `${fact.type}: ${fact.id}`;
}
