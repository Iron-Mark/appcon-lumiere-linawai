import type { SavePieceInput } from "./pieces";

const PENDING_SAVE_KEY = "linaw.pending-piece-save";

function isStatus(value: unknown): value is SavePieceInput["status"] {
  return value === "checked" || value === "needs_review";
}

/** Hold a piece save across the account page. Cleared when taken. */
export function stashPendingPieceSave(input: SavePieceInput): void {
  if (typeof window === "undefined") return;
  const source = input.source.trim();
  if (!source || !isStatus(input.status)) return;
  window.sessionStorage.setItem(
    PENDING_SAVE_KEY,
    JSON.stringify({
      id: input.id ?? null,
      source,
      status: input.status,
    }),
  );
}

export function readPendingPieceSave(): SavePieceInput | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PENDING_SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavePieceInput>;
    if (typeof parsed.source !== "string" || !isStatus(parsed.status)) {
      return null;
    }
    return {
      id: typeof parsed.id === "string" ? parsed.id : null,
      source: parsed.source,
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

export function clearPendingPieceSave(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_SAVE_KEY);
}
