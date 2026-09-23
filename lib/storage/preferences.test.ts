import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Preferences } from "@/lib/domain";
import {
  localStoragePreferenceStore,
  preferenceStore,
} from "@/lib/storage/preferences";
import {
  shouldApplyRemotePreferences,
  prefsUpdatedAt,
} from "@/lib/storage/preferences-sync";

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
    vi.stubGlobal("window", {
      localStorage: createMemoryLocalStorage(),
      location: { origin: "http://localhost:3000" },
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
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

    expect(loaded?.detail).toBe("full");
    expect(loaded?.wording).toBe("original");
    expect(loaded?.delivery).toBe("listen");
    expect(loaded?.browserBehavior).toBe("auto_adapt");
    expect(typeof loaded?.updatedAt).toBe("number");
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

  it("parses legacy payloads without updatedAt", async () => {
    window.localStorage.setItem(
      "linaw.preferences.v1",
      JSON.stringify({
        detail: "full",
        wording: "plain",
        delivery: "read",
        browserBehavior: "manual",
      }),
    );
    const loaded = await localStoragePreferenceStore.get();
    expect(loaded).toEqual({
      detail: "full",
      wording: "plain",
      delivery: "read",
      browserBehavior: "manual",
    });
    expect(loaded?.updatedAt).toBeUndefined();
  });

  it("exposes preferenceStore as the default localStorage binding", () => {
    expect(preferenceStore).toBe(localStoragePreferenceStore);
  });
});

describe("shouldApplyRemotePreferences", () => {
  const base: Preferences = {
    detail: "key_points",
    wording: "plain",
    delivery: "read",
    browserBehavior: "manual",
  };

  it("applies when local is missing", () => {
    expect(
      shouldApplyRemotePreferences(null, { ...base, updatedAt: 1 }),
    ).toBe(true);
  });

  it("prefers the newer updatedAt", () => {
    expect(
      shouldApplyRemotePreferences(
        { ...base, updatedAt: 10 },
        { ...base, detail: "full", updatedAt: 20 },
      ),
    ).toBe(true);
    expect(
      shouldApplyRemotePreferences(
        { ...base, updatedAt: 20 },
        { ...base, detail: "full", updatedAt: 10 },
      ),
    ).toBe(false);
  });

  it("does not overwrite a tied non-default local write", () => {
    expect(
      shouldApplyRemotePreferences(
        { ...base, detail: "full", updatedAt: 5 },
        { ...base, wording: "original", updatedAt: 5 },
      ),
    ).toBe(false);
  });

  it("treats missing updatedAt as zero", () => {
    expect(prefsUpdatedAt({})).toBe(0);
    expect(prefsUpdatedAt({ updatedAt: 42 })).toBe(42);
  });
});
