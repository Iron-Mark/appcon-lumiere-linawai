import { afterEach, describe, expect, it } from "vitest";

import {
  PIECES_STORAGE_KEY,
  getPiece,
  listPieces,
  removePiece,
  savePiece,
  statusFromOverall,
  titleFromSource,
} from "./pieces";

const memory = new Map<string, string>();

function installStorage() {
  const localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage,
      dispatchEvent: () => true,
    },
  });
}

afterEach(() => {
  memory.clear();
  Reflect.deleteProperty(globalThis, "window");
});

describe("titleFromSource", () => {
  it("uses the first line and caps the length", () => {
    expect(titleFromSource("  Hello there  \nsecond")).toBe("Hello there");
    expect(titleFromSource("a".repeat(90))).toBe(`${"a".repeat(77)}…`);
  });
});

describe("statusFromOverall", () => {
  it("maps a pass to checked and anything else to needs review", () => {
    expect(statusFromOverall("pass")).toBe("checked");
    expect(statusFromOverall("warning")).toBe("needs_review");
    expect(statusFromOverall("repair_required")).toBe("needs_review");
  });
});

describe("piece store", () => {
  it("saves, lists newest first, updates the same id, and removes", async () => {
    installStorage();

    const first = await savePiece({
      source: "First notice\nMore detail.",
      status: "checked",
    });
    const second = await savePiece({
      source: "Second notice",
      status: "needs_review",
    });

    expect(first.title).toBe("First notice");
    const listed = await listPieces();
    expect(listed.map((piece) => piece.id)).toEqual([second.id, first.id]);

    const updated = await savePiece({
      id: first.id,
      source: "First notice revised",
      status: "needs_review",
    });
    expect(updated.id).toBe(first.id);
    expect((await getPiece(first.id))?.title).toBe("First notice revised");
    expect((await listPieces()).length).toBe(2);

    await removePiece(second.id);
    expect(await getPiece(second.id)).toBeNull();
    expect(memory.get(PIECES_STORAGE_KEY)).toContain(first.id);
  });
});
