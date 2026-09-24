/** Shared text helpers for fidelity layers (offline, deterministic). */

const TIME_PATTERN = /\b(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)\b/gi;

const WEEKDAY_PATTERN =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;

const NUMBER_PATTERN = /\b\d+(?:\.\d+)?\b/g;

export const CONDITION_MARKERS = [
  "only with",
  "only if",
  "only when",
  "unless",
  "provided that",
  "as long as",
  "if and only if",
] as const;

export const EXCEPTION_MARKERS = [
  "except",
  "exception",
  "excluding",
  "other than",
] as const;

export const NEGATION_MARKERS = [
  "not allowed",
  "must not",
  "may not",
  "cannot",
  "can't",
  "never",
  "no longer",
  "not",
] as const;

/** Obligation strength (§12 must vs may). Order matters for scanning. */
export const OBLIGATION_MARKERS = [
  "must not",
  "must",
  "required to",
  "shall not",
  "shall",
] as const;

export const PERMISSION_MARKERS = ["may not", "may", "optional"] as const;

const UNIT_PATTERN =
  /\b(\d+(?:\.\d+)?)\s*(units?|people|persons|books|hours|minutes|days|kg|lbs?|percent|seats?|spots?|items?|restarts?)\b/gi;

const WEEKDAY_NAMES = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export type QuantityUnit = { amount: string; unit: string };

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Quantity + unit pairs (e.g. "15 units", "2 books"). */
export function extractQuantityUnits(text: string): QuantityUnit[] {
  const withoutTimes = text.replace(TIME_PATTERN, " ");
  const found: QuantityUnit[] = [];
  for (const match of withoutTimes.matchAll(UNIT_PATTERN)) {
    found.push({
      amount: match[1],
      unit: match[2].toLowerCase().replace(/s$/, ""),
    });
  }
  return found;
}

/**
 * Role-like subjects ahead of modal/action verbs (names/entities).
 * Skips weekdays and lone sentence-start verbs.
 */
export function extractRoleSubjects(text: string): string[] {
  const pattern =
    /\b([A-Z][A-Za-z0-9'’-]*(?:\s+[A-Z][A-Za-z0-9'’-]*){0,3})\s+(?:should|must|may|will|arriv(?:e|es|ing)|collect(?:s|ing)?|submit(?:s|ting)?|claim(?:s|ing)?|borrow(?:s|ing)?|enter(?:s|ing)?|leav(?:e|es|ing)|assembl(?:e|es|ing)|rest(?:s|ing)?|cross(?:es|ing)?|hand(?:s|ing)?|approv(?:e|es|ing)|restart(?:s|ing)?)\b/g;
  const found: string[] = [];
  for (const match of text.matchAll(pattern)) {
    const subject = match[1].trim();
    if (WEEKDAY_NAMES.has(subject.toLowerCase())) continue;
    if (subject.length < 3) continue;
    found.push(subject);
  }
  return found;
}

export function hasObligationMarker(text: string): boolean {
  const lower = text.toLowerCase();
  // Positive obligation only — "must not" is negation, not "must".
  if (/\bmust not\b/.test(lower) || /\bshall not\b/.test(lower)) return false;
  return /\b(must|required to|shall)\b/.test(lower);
}

export function hasPermissionMarker(text: string): boolean {
  const lower = text.toLowerCase();
  if (/\bmay not\b/.test(lower)) return false;
  return /\b(may|optional)\b/.test(lower);
}

export function normalizeTimeToken(raw: string): string | null {
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)/i);
  if (!match) return null;
  const hour = String(Number.parseInt(match[1], 10));
  const minute = match[2];
  const meridiem = match[3].replace(/\./g, "").toLowerCase();
  return `${hour}:${minute}${meridiem}`;
}

export function extractTimes(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(TIME_PATTERN)) {
    const normalized = normalizeTimeToken(match[0]);
    if (normalized) found.push(normalized);
  }
  return found;
}

export function extractWeekdays(text: string): string[] {
  return [...text.matchAll(WEEKDAY_PATTERN)].map((m) => m[1].toLowerCase());
}

export function extractNumbers(text: string): string[] {
  // Skip numbers that are part of times (already captured separately).
  const withoutTimes = text.replace(TIME_PATTERN, " ");
  return [...withoutTimes.matchAll(NUMBER_PATTERN)].map((m) => m[0]);
}

export function containsNormalizedTime(text: string, value: string): boolean {
  const target = normalizeTimeToken(value);
  if (!target) {
    return text.toLowerCase().includes(value.toLowerCase());
  }
  return extractTimes(text).includes(target);
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function includesMarker(
  text: string,
  markers: readonly string[],
): boolean {
  const lower = text.toLowerCase();
  return markers.some((marker) => lower.includes(marker));
}

/** "No requests" is a negation. "Notice" is not. */
export function hasNegation(text: string): boolean {
  if (/\bno\b/i.test(text)) return true;
  const lower = text.toLowerCase();
  return NEGATION_MARKERS.some((marker) => {
    if (marker === "not") return /\bnot\b/i.test(text);
    return lower.includes(marker);
  });
}

export function includesPhrase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
