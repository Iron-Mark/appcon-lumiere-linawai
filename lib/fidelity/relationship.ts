import type { Check, CriticalFact, MeaningMap } from "@/lib/domain";
import { REASON_NO_ISSUE, REASON_WRONG_GROUP } from "./copy";
import {
  containsNormalizedTime,
  includesPhrase,
  normalizeTimeToken,
  splitSentences,
} from "./normalize";

/** Phrases that over-generalize a specific actor/group. */
const BROAD_ACTORS = [
  "all members",
  "all volunteers",
  "all participants",
  "everyone",
  "everybody",
  "all students",
] as const;

/**
 * Layer 2 — Relationship checks.
 * Values must stay attached to the correct actor/action
 * (e.g. 8:30 AM with mentors, not “all members”).
 */
export function runRelationshipChecks(
  meaningMap: MeaningMap,
  adaptedText: string,
): Check[] {
  const checks: Check[] = [];
  const valuedFacts = meaningMap.criticalFacts.filter(
    (fact) => fact.actor && fact.value && hasAttachableValue(fact),
  );

  for (const fact of valuedFacts) {
    const sentences = splitSentences(adaptedText);
    for (const sentence of sentences) {
      if (!valueAppearsIn(sentence, fact.value!)) continue;

      if (isAttachedToWrongGroup(sentence, fact, valuedFacts)) {
        checks.push({
          claim: relationshipClaim(fact),
          status: "warning",
          evidence: fact.evidence,
          reason: REASON_WRONG_GROUP,
        });
        break;
      }
    }
  }

  if (checks.length === 0) {
    checks.push({
      claim: "Actor–value relationships",
      status: "pass",
      evidence: meaningMap.sourceIntent,
      reason: REASON_NO_ISSUE,
    });
  }

  return checks;
}

function hasAttachableValue(fact: CriticalFact): boolean {
  if (normalizeTimeToken(fact.value ?? "")) return true;
  return (
    fact.type === "time" ||
    fact.type === "schedule" ||
    fact.type === "deadline" ||
    fact.type === "quantity" ||
    fact.type === "relationship" ||
    fact.type === "date"
  );
}

function valueAppearsIn(text: string, value: string): boolean {
  if (normalizeTimeToken(value)) {
    return containsNormalizedTime(text, value);
  }
  return includesPhrase(text, value);
}

function relationshipClaim(fact: CriticalFact): string {
  const action = fact.action ?? "value";
  return `${fact.actor} → ${action} → ${fact.value}`;
}

function isAttachedToWrongGroup(
  sentence: string,
  fact: CriticalFact,
  peers: CriticalFact[],
): boolean {
  const lower = sentence.toLowerCase();
  const goldActor = fact.actor!.toLowerCase();
  const mentionsGold = includesPhrase(sentence, fact.actor!);

  for (const broad of BROAD_ACTORS) {
    if (!lower.includes(broad)) continue;
    // Gold already uses a broad actor — not a swap.
    if (goldActor.includes(broad) || broad.includes(goldActor)) continue;
    if (!mentionsGold) return true;
  }

  for (const peer of peers) {
    if (peer.id === fact.id || !peer.actor) continue;
    if (peer.actor.toLowerCase() === goldActor) continue;
    if (!includesPhrase(sentence, peer.actor)) continue;

    // Same sentence names another mapped actor and this fact's value,
    // without the gold actor — likely an actor/value swap.
    if (!mentionsGold) {
      const peerValue = peer.value;
      if (
        peerValue &&
        valueAppearsIn(sentence, peerValue) &&
        normalizeTimeToken(fact.value!) === normalizeTimeToken(peerValue)
      ) {
        continue;
      }
      return true;
    }
  }

  return false;
}
