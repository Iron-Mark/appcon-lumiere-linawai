import type { Check, MeaningMap } from "@/lib/domain";
import {
  REASON_CONDITION_CHANGED,
  REASON_NEGATION_REVIEW,
  REASON_NO_ISSUE,
  REASON_VALUE_MISMATCH,
} from "./copy";
import {
  CONDITION_MARKERS,
  EXCEPTION_MARKERS,
  NEGATION_MARKERS,
  containsNormalizedTime,
  extractNumbers,
  extractTimes,
  extractWeekdays,
  includesMarker,
  includesPhrase,
  normalizeTimeToken,
} from "./normalize";

/**
 * Layer 1 — Deterministic checks.
 * Exact/normalized compare for dates, times, numbers, negation,
 * and condition/exception markers. Runs offline.
 */
export function runDeterministicChecks(
  meaningMap: MeaningMap,
  adaptedText: string,
): Check[] {
  const checks: Check[] = [];
  const adaptedTimes = new Set(extractTimes(adaptedText));
  const adaptedWeekdays = new Set(extractWeekdays(adaptedText));
  const adaptedNumbers = new Set(extractNumbers(adaptedText));

  const mapTimes = new Set<string>();
  const mapWeekdays = new Set<string>();
  const mapNumbers = new Set<string>();

  for (const fact of meaningMap.criticalFacts) {
    if (fact.value) {
      const time = normalizeTimeToken(fact.value);
      if (time) mapTimes.add(time);
      for (const day of extractWeekdays(fact.value)) mapWeekdays.add(day);
      for (const day of extractWeekdays(fact.evidence)) mapWeekdays.add(day);
      for (const n of extractNumbers(fact.value)) mapNumbers.add(n);
    }
    for (const day of extractWeekdays(fact.evidence)) mapWeekdays.add(day);
  }

  // Times present in the adaptation should exist in the Meaning Map (normalized).
  for (const time of adaptedTimes) {
    if (mapTimes.size > 0 && !mapTimes.has(time)) {
      checks.push({
        claim: `Time ${time}`,
        status: "warning",
        evidence: findEvidenceForValue(meaningMap, time) ?? meaningMap.sourceIntent,
        reason: REASON_VALUE_MISMATCH,
      });
    }
  }

  // Weekdays introduced in adaptation that are absent from map evidence/values.
  for (const day of adaptedWeekdays) {
    if (mapWeekdays.size > 0 && !mapWeekdays.has(day)) {
      checks.push({
        claim: `Date ${day}`,
        status: "warning",
        evidence: meaningMap.sourceIntent,
        reason: REASON_VALUE_MISMATCH,
      });
    }
  }

  // Numbers in adaptation that never appear in mapped values.
  for (const n of adaptedNumbers) {
    if (mapNumbers.size > 0 && !mapNumbers.has(n)) {
      checks.push({
        claim: `Number ${n}`,
        status: "warning",
        evidence: meaningMap.sourceIntent,
        reason: REASON_VALUE_MISMATCH,
      });
    }
  }

  for (const fact of meaningMap.criticalFacts) {
    if (fact.negated) {
      const flipped =
        includesPhrase(adaptedText, fact.action ?? "") &&
        !includesMarker(adaptedText, NEGATION_MARKERS);
      if (flipped && (fact.action || fact.value)) {
        checks.push({
          claim: describeFact(fact.id, fact.action, fact.value),
          status: "repair_required",
          evidence: fact.evidence,
          reason: REASON_NEGATION_REVIEW,
        });
      }
    }

    if (fact.condition || fact.type === "condition") {
      const conditionText = fact.condition ?? fact.value ?? "";
      const claimPresent =
        (fact.action && includesPhrase(adaptedText, fact.action)) ||
        (fact.value &&
          (containsNormalizedTime(adaptedText, fact.value) ||
            includesPhrase(adaptedText, fact.value))) ||
        (fact.actor && includesPhrase(adaptedText, fact.actor));

      if (claimPresent) {
        const hasMarker =
          includesMarker(adaptedText, CONDITION_MARKERS) ||
          (conditionText.length > 0 && includesPhrase(adaptedText, conditionText));
        if (!hasMarker) {
          checks.push({
            claim: describeFact(fact.id, fact.action, fact.condition ?? fact.value),
            status: "warning",
            evidence: fact.evidence,
            reason: REASON_CONDITION_CHANGED,
          });
        }
      }
    }

    if (fact.exception || fact.type === "exception") {
      const exceptionText = fact.exception ?? fact.condition ?? fact.value ?? "";
      const relatedMentioned =
        (fact.actor && includesPhrase(adaptedText, fact.actor)) ||
        (fact.action && includesPhrase(adaptedText, fact.action));

      if (relatedMentioned) {
        const hasMarker =
          includesMarker(adaptedText, EXCEPTION_MARKERS) ||
          includesMarker(adaptedText, CONDITION_MARKERS) ||
          (exceptionText.length > 0 && includesPhrase(adaptedText, exceptionText));
        if (!hasMarker) {
          checks.push({
            claim: describeFact(fact.id, fact.action, exceptionText || null),
            status: "warning",
            evidence: fact.evidence,
            reason: REASON_CONDITION_CHANGED,
          });
        }
      }
    }
  }

  if (checks.length === 0) {
    checks.push({
      claim: "Deterministic fact compare",
      status: "pass",
      evidence: meaningMap.sourceIntent,
      reason: REASON_NO_ISSUE,
    });
  }

  return checks;
}

function describeFact(
  id: string,
  action: string | null,
  value: string | null,
): string {
  const parts = [action, value].filter(Boolean);
  return parts.length > 0 ? parts.join(" — ") : id;
}

function findEvidenceForValue(
  meaningMap: MeaningMap,
  normalizedTime: string,
): string | null {
  for (const fact of meaningMap.criticalFacts) {
    if (fact.value && normalizeTimeToken(fact.value) === normalizedTime) {
      return fact.evidence;
    }
  }
  return null;
}
