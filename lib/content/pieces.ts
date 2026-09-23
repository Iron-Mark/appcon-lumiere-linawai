import type { CheckStatus } from "@/lib/domain";

/** localStorage key for pieces the reader saved on this device. */
export const PIECES_STORAGE_KEY = "linaw.pieces.v1";

/** Same-tab listeners (storage events only fire across tabs). */
export const PIECES_CHANGE_EVENT = "linaw:pieces-change";

/** Same cap as the Read composer. */
export const MAX_PIECE_SOURCE_CHARS = 20_000;

export type PieceStatus = "checked" | "needs_review";

export type SavedPiece = {
  id: string;
  title: string;
  source: string;
  /** ISO timestamp */
  savedAt: string;
  status: PieceStatus;
};

export type SavePieceInput = {
  /** Update this piece when it already exists. Omit to create one. */
  id?: string | null;
  source: string;
  status: PieceStatus;
};

function canUseLocalStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PIECES_CHANGE_EVENT));
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `piece-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isPieceStatus(value: unknown): value is PieceStatus {
  return value === "checked" || value === "needs_review";
}

function isSavedPiece(value: unknown): value is SavedPiece {
  if (!value || typeof value !== "object") return false;
  const piece = value as Partial<SavedPiece>;
  return (
    typeof piece.id === "string" &&
    piece.id.length > 0 &&
    typeof piece.title === "string" &&
    piece.title.length > 0 &&
    typeof piece.source === "string" &&
    piece.source.length > 0 &&
    piece.source.length <= MAX_PIECE_SOURCE_CHARS &&
    typeof piece.savedAt === "string" &&
    isPieceStatus(piece.status)
  );
}

function readAll(): SavedPiece[] {
  if (!canUseLocalStorage()) return [];
  const raw = window.localStorage.getItem(PIECES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPiece);
  } catch {
    return [];
  }
}

function writeAll(pieces: SavedPiece[]): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(PIECES_STORAGE_KEY, JSON.stringify(pieces));
  notifyChange();
}

export function statusFromOverall(overall: CheckStatus): PieceStatus {
  return overall === "pass" ? "checked" : "needs_review";
}

/** First non-empty line, collapsed to one line, capped for the table. */
export function titleFromSource(source: string): string {
  const line =
    source
      .split("\n")
      .map((part) => part.trim())
      .find((part) => part.length > 0) ?? "Untitled";
  const oneLine = line.replace(/\s+/g, " ");
  if (oneLine.length <= 80) return oneLine;
  return `${oneLine.slice(0, 77)}…`;
}

export function formatPieceDate(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export async function listPieces(): Promise<SavedPiece[]> {
  return readAll().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export async function getPiece(id: string): Promise<SavedPiece | null> {
  return readAll().find((piece) => piece.id === id) ?? null;
}

export async function savePiece(input: SavePieceInput): Promise<SavedPiece> {
  const source = input.source
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!source) {
    throw new Error("A source is required to save.");
  }
  if (source.length > MAX_PIECE_SOURCE_CHARS) {
    throw new Error(
      `That text is too long. Keep it under ${MAX_PIECE_SOURCE_CHARS.toLocaleString()} characters.`,
    );
  }

  const pieces = readAll();
  const now = new Date().toISOString();
  const title = titleFromSource(source);

  if (input.id) {
    const index = pieces.findIndex((piece) => piece.id === input.id);
    if (index >= 0) {
      const next: SavedPiece = {
        ...pieces[index],
        title,
        source,
        status: input.status,
        savedAt: now,
      };
      pieces[index] = next;
      writeAll(pieces);
      return next;
    }
  }

  const created: SavedPiece = {
    id: newId(),
    title,
    source,
    status: input.status,
    savedAt: now,
  };
  writeAll([created, ...pieces]);
  return created;
}

export async function removePiece(id: string): Promise<void> {
  writeAll(readAll().filter((piece) => piece.id !== id));
}
