import {
  DEFAULT_PREFERENCES,
  PreferencesSchema,
  type Preferences,
} from "@/lib/domain";
import type { PreferenceStore } from "@/lib/storage/preferences";

/** Same key as the web localStorage store — extension caches the same schema. */
export const PREFERENCES_KEY = "linaw.preferences.v1";
export const DISABLED_SITES_KEY = "linaw.disabledSites.v1";

/**
 * chrome.storage adapter implementing the shared PreferenceStore interface.
 * Does not edit the web store; field names match domain Preferences.
 */
export const chromePreferenceStore: PreferenceStore = {
  async get() {
    const result = await chrome.storage.local.get(PREFERENCES_KEY);
    const raw = result[PREFERENCES_KEY];
    if (raw == null) return null;
    try {
      return PreferencesSchema.parse(raw);
    } catch {
      return null;
    }
  },

  async set(preferences: Preferences) {
    const parsed = PreferencesSchema.parse(preferences);
    await chrome.storage.local.set({ [PREFERENCES_KEY]: parsed });
  },

  async clear() {
    await chrome.storage.local.remove(PREFERENCES_KEY);
  },
};

export async function loadPreferences(): Promise<Preferences> {
  const stored = await chromePreferenceStore.get();
  return stored ?? DEFAULT_PREFERENCES;
}

export async function savePreferences(
  preferences: Preferences,
): Promise<Preferences> {
  const parsed = PreferencesSchema.parse(preferences);
  await chromePreferenceStore.set(parsed);
  return parsed;
}

type DisabledMap = Record<string, true>;

async function readDisabledMap(): Promise<DisabledMap> {
  const result = await chrome.storage.local.get(DISABLED_SITES_KEY);
  const raw = result[DISABLED_SITES_KEY];
  if (!raw || typeof raw !== "object") return {};
  return raw as DisabledMap;
}

export async function isOriginDisabled(origin: string): Promise<boolean> {
  const map = await readDisabledMap();
  return map[origin] === true;
}

export async function disableOrigin(origin: string): Promise<void> {
  const map = await readDisabledMap();
  map[origin] = true;
  await chrome.storage.local.set({ [DISABLED_SITES_KEY]: map });
}

export async function enableOrigin(origin: string): Promise<void> {
  const map = await readDisabledMap();
  delete map[origin];
  await chrome.storage.local.set({ [DISABLED_SITES_KEY]: map });
}

/** Auto-Adapt is on only when the user explicitly chose auto_adapt. */
export function isAutoAdaptEnabled(preferences: Preferences): boolean {
  return preferences.browserBehavior === "auto_adapt";
}
