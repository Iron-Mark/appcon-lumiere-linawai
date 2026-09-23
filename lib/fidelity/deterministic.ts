import type { Check, MeaningMap } from "@/lib/domain";
import {
  REASON_CONDITION_CHANGED,
  REASON_ENTITY_MISMATCH,
  REASON_NEGATION_REVIEW,
  REASON_NO_ISSUE,
  REASON_OBLIGATION_CHANGED,
  REASON_VALUE_MISMATCH,
} from "./copy";
import {
  CONDITION_MARKERS,
  EXCEPTION_MARKERS,
  NEGATION_MARKERS,
  containsNormalizedTime,
  extractNumbers,
  extractQuantityUnits,
  extractRoleSubjects,
  extractTimes,
  extractWeekdays,
  hasObligationMarker,
  hasPermissionMarker,
  includesMarker,
  includesPhrase,
  normalizeTimeToken,
  splitSentences,
} from "./normalize";

/**
 * Layer 1 — Deterministic checks.
 * Exact/normalized compare for dates, times, numbers, names/entities, units,
 * negation, condition/exception markers, and must vs may. Runs offline.
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
  const mapUnitAmounts = new Map<string, Set<string>>();
  const mapActors = collectMapActors(meaningMap);
  const knownNameCorpus = buildNameCorpus(meaningMap);

  for (const fact of meaningMap.criticalFacts) {
    // Everything the source actually says about this fact counts as known:
    // the value, its condition/exception text, and the verbatim evidence.
    // A value can hold several times ("from 9:00 AM to 3:00 PM"), and a
    // time can live in the condition ("before 12:00 noon") — comparing the
    // adaptation against `value` alone flagged both as mismatches.
    const known = [fact.value, fact.condition, fact.exception, fact.evidence]
      .filter((s): s is string => Boolean(s))
      .join(" ");
    for (const time of extractTimes(known)) mapTimes.add(time);
    if (fact.value) {
      const single = normalizeTimeToken(fact.value);
      if (single) mapTimes.add(single);
    }
    for (const day of extractWeekdays(known)) mapWeekdays.add(day);
    for (const n of extractNumbers(known)) mapNumbers.add(n);
    for (const qu of extractQuantityUnits(
      `${fact.value ?? ""} ${fact.evidence}`,
    )) {
      const amounts = mapUnitAmounts.get(qu.unit) ?? new Set<string>();
      amounts.add(qu.amount);
      mapUnitAmounts.set(qu.unit, amounts);
    }
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

  // Units: same unit label with an amount the map never used (§12 “15 units vs 18 units”).
  for (const qu of extractQuantityUnits(adaptedText)) {
    const allowed = mapUnitAmounts.get(qu.unit);
    if (allowed && allowed.size > 0 && !allowed.has(qu.amount)) {
      checks.push({
        claim: `Quantity ${qu.amount} ${qu.unit}`,
        status: "warning",
        evidence: meaningMap.sourceIntent,
        reason: REASON_VALUE_MISMATCH,
      });
    }
  }

  // Names/entities: role subjects beside schedule/action verbs must be known map actors
  // (or appear in map evidence). Unknown groups with a mapped time are suspicious.
  if (mapActors.size > 0) {
    for (const sentence of splitSentences(adaptedText)) {
      const hasMappedTime = extractTimes(sentence).some((t) => mapTimes.has(t));
      if (!hasMappedTime && !extractQuantityUnits(sentence).length) continue;

      for (const subject of extractRoleSubjects(sentence)) {
        if (isKnownActorOrEvidenceName(subject, mapActors, knownNameCorpus)) {
          continue;
        }
        checks.push({
          claim: `Name / group: ${subject}`,
          status: "warning",
          evidence: meaningMap.sourceIntent,
          reason: REASON_ENTITY_MISMATCH,
        });
      }
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

    // Must vs may: only flag when both sides state a modal and they disagree (§12).
    // Scope to sentences that mention this fact so other facts' modals do not bleed in.
    const evidenceBlob = `${fact.evidence} ${fact.action ?? ""}`;
    const claimSentences = splitSentences(adaptedText).filter((sentence) =>
      sentenceMentionsFact(sentence, fact.actor, fact.action, fact.value),
    );

    if (claimSentences.length > 0) {
      const evidenceMust = hasObligationMarker(evidenceBlob);
      const evidenceMay = hasPermissionMarker(evidenceBlob);
      const claimBlob = claimSentences.join(" ");
      const adaptedMust = hasObligationMarker(claimBlob);
      const adaptedMay = hasPermissionMarker(claimBlob);

      if (evidenceMust && adaptedMay && !adaptedMust) {
        checks.push({
          claim: describeFact(fact.id, fact.action, fact.value),
          status: "warning",
          evidence: fact.evidence,
          reason: REASON_OBLIGATION_CHANGED,
        });
      } else if (evidenceMay && !evidenceMust && adaptedMust) {
        checks.push({
          claim: describeFact(fact.id, fact.action, fact.value),
          status: "warning",
          evidence: fact.evidence,
          reason: REASON_OBLIGATION_CHANGED,
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

function collectMapActors(meaningMap: MeaningMap): Set<string> {
  const actors = new Set<string>();
  for (const fact of meaningMap.criticalFacts) {
    if (fact.actor?.trim()) actors.add(fact.actor.trim().toLowerCase());
  }
  return actors;
}

function buildNameCorpus(meaningMap: MeaningMap): string {
  return meaningMap.criticalFacts
    .map((f) => `${f.actor ?? ""} ${f.evidence}`)
    .join(" ")
    .toLowerCase();
}

function isKnownActorOrEvidenceName(
  subject: string,
  mapActors: Set<string>,
  corpus: string,
): boolean {
  const lower = subject.toLowerCase();
  if (mapActors.has(lower)) return true;
  for (const actor of mapActors) {
    if (actor.includes(lower) || lower.includes(actor)) return true;
  }
  // Broad generalizations are handled by the relationship layer.
  if (
    /^(all|every|everyone|everybody|other)\b/.test(lower) ||
    lower === "everyone" ||
    lower === "everybody"
  ) {
    return true;
  }
  return corpus.includes(lower);
}

function sentenceMentionsFact(
  sentence: string,
  actor: string | null,
  action: string | null,
  value: string | null,
): boolean {
  if (actor && includesPhrase(sentence, actor)) return true;
  if (action && includesPhrase(sentence, action)) return true;
  if (
    value &&
    (containsNormalizedTime(sentence, value) || includesPhrase(sentence, value))
  ) {
    return true;
  }
  return false;
}
