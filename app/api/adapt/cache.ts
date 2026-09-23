import type { AdaptResponse, Detail, Wording } from "@/lib/domain";

/** Process memory only. A restart drops every entry. Source text is not logged. */
const MAX_ENTRIES = 50;

const entries = new Map<string, AdaptResponse>();

/** Same source, detail, and wording. Delivery is omitted: Read and Listen share one answer. */
export function modelCacheKey(
  source: string,
  detail: Detail,
  wording: Wording,
): string {
  const normalized = source.replace(/\s+/g, " ").trim();
  return `${normalized}\n${detail}\n${wording}`;
}

/** Moves a hit to the newest end so the cap drops the oldest entry. */
export function readModelCache(key: string): AdaptResponse | undefined {
  const hit = entries.get(key);
  if (!hit) return undefined;
  entries.delete(key);
  entries.set(key, hit);
  return hit;
}

export function writeModelCache(key: string, response: AdaptResponse): void {
  if (entries.has(key)) entries.delete(key);
  entries.set(key, response);
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest === undefined) break;
    entries.delete(oldest);
  }
}

export function clearModelCache(): void {
  entries.clear();
}
