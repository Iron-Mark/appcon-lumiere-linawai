export type DeadlineSegment = {
  text: string;
  marked: boolean;
};

/**
 * Split plain text into segments so dates, times, and numbers can be emphasized
 * in the panel only. The original string is unchanged for Copy / adapt().
 */
const DEADLINE_PATTERN =
  /\b(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{2,4})?|(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}:\d{2}\s*(?:[AaPp][Mm])?|\d{1,2}\s*[AaPp][Mm]|\d+(?:\.\d+)?(?:st|nd|rd|th)?)\b/g;

export function splitDeadlineMarks(text: string): DeadlineSegment[] {
  if (!text) return [];

  const segments: DeadlineSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(DEADLINE_PATTERN.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), marked: false });
    }
    segments.push({ text: match[0], marked: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), marked: false });
  }

  if (segments.length === 0) {
    return [{ text, marked: false }];
  }

  return segments;
}
