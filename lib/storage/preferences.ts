import {
  PreferencesSchema,
  type Preferences,
} from "@/lib/domain";

const STORAGE_KEY = "linaw.preferences.v1";

/**
 * Preference persistence port.
 * Web: localStorage. Extension track: chrome.storage under extension/.
 */
export interface PreferenceStore {
  get(): Promise<Preferences | null>;
  set(preferences: Preferences): Promise<void>;
  clear(): Promise<void>;
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const localStoragePreferenceStore: PreferenceStore = {
  async get() {
    if (!canUseLocalStorage()) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return PreferencesSchema.parse(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  async set(preferences: Preferences) {
    if (!canUseLocalStorage()) return;
    const parsed = PreferencesSchema.parse(preferences);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  },

  async clear() {
    if (!canUseLocalStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

/** Default web binding. */
export const preferenceStore: PreferenceStore = localStoragePreferenceStore;
