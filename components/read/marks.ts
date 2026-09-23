import type { Check, CriticalFact } from "@/lib/domain";

export type TextMark = {
  checkIndex: number;
  start: number;
  end: number;
  phrase: string;
  status: Check["status"];
};

/**
 * Build non-overlapping marks for check claims that appear in adapted text.
 * Also marks fact values that share evidence with a check.
 */
export function buildMarks(
  adaptedText: string,
  checks: Check[],
  facts: CriticalFact[],
): TextMark[] {
  const candidates: TextMark[] = [];

  checks.forEach((check, checkIndex) => {
    const phrases = new Set<string>();
    const claim = check.claim.trim();
    if (claim.length >= 2) phrases.add(claim);

    for (const fact of facts) {
      const related =
        Boolean(fact.evidence) &&
        (check.evidence.includes(fact.evidence) ||
          fact.evidence.includes(check.evidence) ||
          (fact.value != null &&
            (check.claim.includes(fact.value) ||
              adaptedText.includes(fact.value))));
      if (!related) continue;
      if (fact.value && fact.value.trim().length >= 2) {
        phrases.add(fact.value.trim());
      }
    }

    for (const phrase of phrases) {
      const found = findPhrase(adaptedText, phrase);
      if (!found) continue;
      candidates.push({
        checkIndex,
        start: found.start,
        end: found.start + found.length,
        phrase: adaptedText.slice(found.start, found.start + found.length),
        status: check.status,
      });
    }
  });

  candidates.sort((a, b) => {
    const lenDiff = b.phrase.length - a.phrase.length;
    if (lenDiff !== 0) return lenDiff;
    const severity = (s: Check["status"]) =>
      s === "repair_required" ? 2 : s === "warning" ? 1 : 0;
    return severity(b.status) - severity(a.status);
  });

  const accepted: TextMark[] = [];
  for (const mark of candidates) {
    const overlaps = accepted.some(
      (m) => !(mark.end <= m.start || mark.start >= m.end),
    );
    if (!overlaps) accepted.push(mark);
  }

  return accepted.sort((a, b) => a.start - b.start);
}

/** Prefer exact match; allow claim without trailing period in adapted text. */
function findPhrase(
  haystack: string,
  needle: string,
): { start: number; length: number } | null {
  const exact = haystack.indexOf(needle);
  if (exact !== -1) return { start: exact, length: needle.length };
  const stripped = needle.replace(/[.…]+$/, "");
  if (stripped !== needle && stripped.length >= 2) {
    const start = haystack.indexOf(stripped);
    if (start !== -1) return { start, length: stripped.length };
  }
  return null;
}

export function warningLineForChecks(checks: Check[]): string {
  const flagged = checks.find(
    (c) => c.status === "warning" || c.status === "repair_required",
  );
  if (!flagged) return "Important condition may have changed. Review source.";

  const reason = flagged.reason.trim();
  if (
    reason === "The time appears to be attached to the wrong group." ||
    reason === "Important condition may have changed. Review source."
  ) {
    return reason;
  }
  if (/time|group|mentor|member|8:30|arrive/i.test(`${flagged.claim} ${reason}`)) {
    return "The time appears to be attached to the wrong group.";
  }
  return "Important condition may have changed. Review source.";
}
