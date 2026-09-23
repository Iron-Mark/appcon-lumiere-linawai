import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Preferences } from "@/lib/domain";
import {
  localStoragePreferenceStore,
  preferenceStore,
} from "@/lib/storage/preferences";

function createMemoryLocalStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

describe("localStoragePreferenceStore", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createMemoryLocalStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves and loads detail, wording, delivery, and browserBehavior", async () => {
    const preferences: Preferences = {
      detail: "full",
      wording: "original",
      delivery: "listen",
      browserBehavior: "auto_adapt",
    };

    await localStoragePreferenceStore.set(preferences);
    const loaded = await localStoragePreferenceStore.get();

    expect(loaded).toEqual(preferences);
    expect(loaded?.detail).toBe("full");
    expect(loaded?.wording).toBe("original");
    expect(loaded?.delivery).toBe("listen");
    expect(loaded?.browserBehavior).toBe("auto_adapt");
  });

  it("returns null when nothing is stored", async () => {
    expect(await localStoragePreferenceStore.get()).toBeNull();
  });

  it("clears stored preferences", async () => {
    await localStoragePreferenceStore.set({
      detail: "key_points",
      wording: "plain",
      delivery: "read",
      browserBehavior: "manual",
    });
    await localStoragePreferenceStore.clear();
    expect(await localStoragePreferenceStore.get()).toBeNull();
  });

  it("exposes preferenceStore as the default localStorage binding", () => {
    expect(preferenceStore).toBe(localStoragePreferenceStore);
  });
});
