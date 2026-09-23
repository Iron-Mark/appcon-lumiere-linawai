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

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
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

export function includesPhrase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
