import type { Check, CriticalFact, CriticalFactType } from "@/lib/domain";

/**
 * Glue between the Meaning Map (facts) and Meaning Check (checks) for the
 * non-prose views. Uses the same relatedness rule as `buildMarks`, so a fact
 * lights up in "At a glance" exactly when its mark would in the text.
 */

export type FactStatus = Check["status"];

export type LinkedFact = {
  fact: CriticalFact;
  /** Index into checks[] of the most severe related check, or null. */
  checkIndex: number | null;
  status: FactStatus;
};

const SEVERITY: Record<FactStatus, number> = {
  pass: 0,
  warning: 1,
  repair_required: 2,
};

function related(fact: CriticalFact, check: Check, adaptedText: string): boolean {
  if (!fact.evidence) return false;
  if (check.evidence && (check.evidence.includes(fact.evidence) || fact.evidence.includes(check.evidence))) {
    return true;
  }
  if (fact.value != null && fact.value.trim().length >= 2) {
    if (check.claim.includes(fact.value) || adaptedText.includes(fact.value)) return true;
  }
  return false;
}

/** A layer that did not run must not colour a fact. */
function ran(check: Check): boolean {
  return !/not connected/i.test(check.reason);
}

export function linkFacts(
  facts: CriticalFact[],
  checks: Check[],
  adaptedText: string,
): LinkedFact[] {
  return facts.map((fact) => {
    let bestIndex: number | null = null;
    let bestStatus: FactStatus = "pass";
    for (let index = 0; index < checks.length; index++) {
      const check = checks[index]!;
      if (!ran(check) || !related(fact, check, adaptedText)) continue;
      if (bestIndex === null || SEVERITY[check.status] > SEVERITY[bestStatus]) {
        bestIndex = index;
        bestStatus = check.status;
      }
    }
    return { fact, checkIndex: bestIndex, status: bestStatus };
  });
}

/** Facts that answer "when". */
export const TIME_TYPES: ReadonlySet<CriticalFactType> = new Set([
  "deadline",
  "schedule",
  "date",
  "time",
]);

/** Facts that gate or restrict. */
export const RULE_TYPES: ReadonlySet<CriticalFactType> = new Set([
  "condition",
  "exception",
  "permission",
  "prohibition",
  "negation",
]);

export const TYPE_LABEL: Record<CriticalFactType, string> = {
  deadline: "Deadline",
  schedule: "Schedule",
  date: "Date",
  time: "Time",
  quantity: "Amount",
  condition: "Condition",
  exception: "Exception",
  permission: "Allowed",
  prohibition: "Not allowed",
  negation: "Not",
  actor: "Who",
  action: "What",
  relationship: "Who does what",
  other: "Note",
};

/** Human line for a fact: prefer the concrete value, then the rule text, then the action. */
export function factTitle(fact: CriticalFact): string {
  return (
    fact.value?.trim() ||
    fact.condition?.trim() ||
    fact.action?.trim() ||
    fact.evidence.trim()
  );
}

/** Secondary line: who, and what, minus whatever the title already used. */
export function factMeta(fact: CriticalFact): string {
  const title = factTitle(fact);
  const parts = [fact.actor?.trim(), fact.action?.trim()].filter(
    (p): p is string => Boolean(p) && p !== title,
  );
  return parts.join(" · ");
}

/**
 * Split the adapted note into readable units for "one at a time".
 * Line breaks win; otherwise sentence ends. Never returns empty strings.
 */
export function splitIntoUnits(text: string): string[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const units: string[] = [];
  for (const line of lines) {
    const parts = line.split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(])/);
    for (const p of parts) {
      const t = p.trim();
      if (t) units.push(t);
    }
  }
  return units.length > 0 ? units : text.trim() ? [text.trim()] : [];
}

/** Facts whose value appears in a unit — used to label focus cards. */
export function factsInUnit(unit: string, linked: LinkedFact[]): LinkedFact[] {
  return linked.filter(
    (l) => l.fact.value && l.fact.value.trim().length >= 2 && unit.includes(l.fact.value),
  );
}
