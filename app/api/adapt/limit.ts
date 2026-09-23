/**
 * In-process guards for /api/adapt. A restart clears the counters.
 * Source text is never logged.
 */

export const MAX_BODY_BYTES = 80_000;
export const MAX_SOURCE_CHARS = 20_000;
export const MIN_MODEL_SOURCE_CHARS = 20;

const MODEL_ATTEMPTS = 20;
const MODEL_WINDOW_MS = 10 * 60 * 1000;
const GET_ATTEMPTS = 60;
const GET_WINDOW_MS = 60 * 1000;

export const RATE_LIMIT_MESSAGE =
  "Too many clarifications from this network. Wait a few minutes and try again.";
export const SOURCE_TOO_LONG_MESSAGE =
  "That note is too long to clarify. Shorten it to 20,000 characters.";
export const BODY_TOO_LARGE_MESSAGE = "That request is too large.";

const SOURCE_BEGIN = "<<<LINAW_UNTRUSTED_SOURCE>>>";
const SOURCE_END = "<<<END_LINAW_UNTRUSTED_SOURCE>>>";

const INJECTION =
  /ignore (?:all |any )?(?:previous |prior |above )?instructions|reveal (?:the )?(?:system |hidden )?prompt|print (?:the |your )?(?:api |secret )?key|you are now|disregard (?:all |the )?(?:system |rules|instructions)/i;

const modelHits = new Map<string, number[]>();
const getHits = new Map<string, number[]>();

export type SlotResult =
  | { ok: true }
  | { ok: false; retryAfter: number };

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "local";
  const address = raw.slice(0, 64);
  return address || "local";
}

export function bodyTooLarge(request: Request): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const size = Number(raw);
  return Number.isFinite(size) && size > MAX_BODY_BYTES;
}

/** Drop NUL and other controls. Keep tab, newline, and carriage return. */
export function sanitizeSource(source: string): string {
  return source.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function prune(stamps: number[], now: number, windowMs: number): number[] {
  return stamps.filter((stamp) => now - stamp < windowMs);
}

function takeSlot(
  bucket: Map<string, number[]>,
  address: string,
  limit: number,
  windowMs: number,
  now: number,
): SlotResult {
  const stamps = prune(bucket.get(address) ?? [], now, windowMs);
  if (stamps.length >= limit) {
    const oldest = stamps[0] ?? now;
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    bucket.set(address, stamps);
    return { ok: false, retryAfter };
  }
  stamps.push(now);
  bucket.set(address, stamps);
  return { ok: true };
}

/** Count one uncached model attempt. Cache hits must not call this. */
export function takeModelSlot(address: string, now = Date.now()): SlotResult {
  return takeSlot(modelHits, address, MODEL_ATTEMPTS, MODEL_WINDOW_MS, now);
}

export function takeGetSlot(address: string, now = Date.now()): SlotResult {
  return takeSlot(getHits, address, GET_ATTEMPTS, GET_WINDOW_MS, now);
}

export function clearLimits(): void {
  modelHits.clear();
  getHits.clear();
}

/**
 * True when the whole note is an instruction to override the system prompt.
 * A longer notice that merely quotes such a sentence is not injection-only.
 */
export function isInjectionOnly(source: string): boolean {
  const trimmed = source.replace(/\s+/g, " ").trim();
  if (!INJECTION.test(trimmed)) return false;
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const other = sentences.filter(
    (sentence) => !INJECTION.test(sentence) && sentence.length >= MIN_MODEL_SOURCE_CHARS,
  );
  return other.length === 0;
}

/** Remove the fence tokens so a source cannot close the untrusted block early. */
export function fenceSource(source: string): string {
  return source.split(SOURCE_BEGIN).join("").split(SOURCE_END).join("");
}

export const UNTRUSTED_SOURCE_BEGIN = SOURCE_BEGIN;
export const UNTRUSTED_SOURCE_END = SOURCE_END;

/** Model output that echoes the system prompt or a credential. */
export function answerLooksLeaked(adaptedText: string): boolean {
  const lower = adaptedText.toLowerCase();
  if (lower.includes("you are linaw ai's generative core")) return true;
  if (lower.includes("critical security & data rule")) return true;
  if (/AIza[0-9A-Za-z\-_]{20,}/.test(adaptedText)) return true;
  if (/sk-[A-Za-z0-9]{20,}/.test(adaptedText)) return true;
  if (/GEMINI_API_KEY\s*=/.test(adaptedText)) return true;
  if (/LLM_API_KEY\s*=/.test(adaptedText)) return true;
  return false;
}
