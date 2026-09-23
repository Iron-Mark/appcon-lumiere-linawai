/**
 * Share a source as a link. The recipient opens /read?s=<encoded> and the
 * note is adapted with *their* preferences — one message, many readers,
 * each in the format they chose, with Meaning Check attached.
 *
 * The source travels in the URL (no server, no storage). Keep it short:
 * browsers and chat apps start truncating around 8k characters.
 */

export const SHARE_PARAM = "s";
/** Source length we allow in a link; longer sources should be saved instead. */
export const SHARE_MAX_SOURCE_CHARS = 4000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array | null {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  try {
    const binary = atob(padded + pad);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function encodeShareSource(source: string): string {
  return toBase64Url(new TextEncoder().encode(source));
}

export function decodeShareSource(param: string | null | undefined): string | null {
  if (!param) return null;
  const bytes = fromBase64Url(param);
  if (!bytes) return null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

export type ShareLinkResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export function buildShareLink(source: string, origin: string): ShareLinkResult {
  const trimmed = source.trim();
  if (!trimmed) return { ok: false, reason: "Nothing to share yet." };
  if (trimmed.length > SHARE_MAX_SOURCE_CHARS) {
    return {
      ok: false,
      reason: `Links carry up to ${SHARE_MAX_SOURCE_CHARS.toLocaleString()} characters. Save this one on your device instead.`,
    };
  }
  const url = new URL("/read", origin);
  url.searchParams.set(SHARE_PARAM, encodeShareSource(trimmed));
  return { ok: true, url: url.toString() };
}
