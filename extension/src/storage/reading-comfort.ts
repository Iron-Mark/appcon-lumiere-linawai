import {
  DEFAULT_READING_COMFORT,
  READING_COMFORT_KEY,
  normalizeReadingComfort,
  type ReadingComfort,
} from "../reading-comfort/defaults";

/**
 * Extension-only reading display options in chrome.storage.local.
 * Kept out of the synced domain Preferences payload (same idea as disabledOrigins).
 */
export async function getReadingComfort(): Promise<ReadingComfort> {
  const result = await chrome.storage.local.get(READING_COMFORT_KEY);
  const raw = result[READING_COMFORT_KEY] as Partial<ReadingComfort> | undefined;
  return normalizeReadingComfort(raw);
}

/**
 * Persist a partial update. Pass `base` from in-memory UI state to avoid
 * read-modify-write races when several controls change quickly.
 */
export async function saveReadingComfort(
  partial: Partial<ReadingComfort>,
  base?: ReadingComfort,
): Promise<ReadingComfort> {
  const current = base ?? (await getReadingComfort());
  const next = normalizeReadingComfort({ ...current, ...partial });
  await chrome.storage.local.set({ [READING_COMFORT_KEY]: next });
  return next;
}

export async function clearReadingComfort(): Promise<void> {
  await chrome.storage.local.remove(READING_COMFORT_KEY);
}

export { DEFAULT_READING_COMFORT, READING_COMFORT_KEY };
export type { ReadingComfort };
