/**
 * Split clarified (or original) text into focus-line units.
 * Newline / bullet blocks stay as lines; a single block splits on sentence ends.
 */
export function splitReadingLines(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (/\n/.test(trimmed)) {
    return trimmed
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  }

  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length === 0) return [trimmed];
  return sentences.map((s) => s.trim()).filter(Boolean);
}

/** Advance focus one line; clamps at the last line. */
export function advanceFocusLine(current: number, lineCount: number): number {
  if (lineCount <= 0) return 0;
  if (current < 0) return 0;
  return Math.min(current + 1, lineCount - 1);
}

/** Clamp an index into the line list (e.g. after click). */
export function clampFocusLine(index: number, lineCount: number): number {
  if (lineCount <= 0) return 0;
  if (index < 0) return 0;
  if (index >= lineCount) return lineCount - 1;
  return index;
}
