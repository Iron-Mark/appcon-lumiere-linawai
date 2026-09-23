import type { PreferenceStore } from "@/lib/storage/preferences";

export type Detail = "full" | "key_points";
export type Wording = "original" | "plain";
export type Delivery = "read" | "listen";
export type BrowserBehavior = "auto_adapt" | "manual";

export interface ExtensionPreferences {
  detail: Detail;
  wording: Wording;
  delivery: Delivery;
  browserBehavior: BrowserBehavior;
  disabledOrigins: string[];
}

export type Preferences = ExtensionPreferences;

export const DEFAULT_PREFERENCES: ExtensionPreferences = {
  detail: "key_points",
  wording: "plain",
  delivery: "read",
  browserBehavior: "manual",
  disabledOrigins: [],
};

export const PREFERENCES_KEY = "linaw.preferences.v1";

/**
 * Retrieves the current extension preferences from chrome.storage.local.
 * Returns default preferences when nothing has been stored yet.
 */
export async function getPreferences(): Promise<ExtensionPreferences> {
  const result = await chrome.storage.local.get(PREFERENCES_KEY);
  const raw = result[PREFERENCES_KEY] as Partial<ExtensionPreferences> | undefined;
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_PREFERENCES,
      disabledOrigins: [...DEFAULT_PREFERENCES.disabledOrigins],
    };
  }

  const detail: Detail = raw.detail === "full" ? "full" : "key_points";
  const wording: Wording = raw.wording === "original" ? "original" : "plain";
  const delivery: Delivery = raw.delivery === "listen" ? "listen" : "read";
  const browserBehavior: BrowserBehavior =
    raw.browserBehavior === "auto_adapt" ? "auto_adapt" : "manual";
  const disabledOrigins: string[] = Array.isArray(raw.disabledOrigins)
    ? raw.disabledOrigins.filter((item): item is string => typeof item === "string")
    : [];

  return {
    detail,
    wording,
    delivery,
    browserBehavior,
    disabledOrigins,
  };
}

/**
 * Updates extension preferences with partial fields and persists to chrome.storage.local.
 */
export async function updatePreferences(
  partial: Partial<ExtensionPreferences>,
): Promise<ExtensionPreferences> {
  const current = await getPreferences();
  const updated: ExtensionPreferences = {
    detail: partial.detail ?? current.detail,
    wording: partial.wording ?? current.wording,
    delivery: partial.delivery ?? current.delivery,
    browserBehavior: partial.browserBehavior ?? current.browserBehavior,
    disabledOrigins:
      partial.disabledOrigins !== undefined
        ? Array.isArray(partial.disabledOrigins)
          ? [...partial.disabledOrigins]
          : []
        : current.disabledOrigins,
  };

  await chrome.storage.local.set({ [PREFERENCES_KEY]: updated });
  return updated;
}

/**
 * Checks whether a given web origin is disabled for the Linaw extension.
 */
export async function isOriginDisabled(origin: string): Promise<boolean> {
  const prefs = await getPreferences();
  return prefs.disabledOrigins.includes(origin);
}

/**
 * Toggles the disabled state of an origin and persists to storage.
 * Returns true if the origin is now disabled, or false if it is enabled.
 */
export async function toggleOriginDisabled(origin: string): Promise<boolean> {
  const prefs = await getPreferences();
  const isCurrentlyDisabled = prefs.disabledOrigins.includes(origin);
  const nextOrigins = isCurrentlyDisabled
    ? prefs.disabledOrigins.filter((item) => item !== origin)
    : [...prefs.disabledOrigins, origin];

  await updatePreferences({ disabledOrigins: nextOrigins });
  return !isCurrentlyDisabled;
}

/**
 * Explicitly disables Linaw companion on a given origin.
 */
export async function disableOrigin(origin: string): Promise<void> {
  const prefs = await getPreferences();
  if (!prefs.disabledOrigins.includes(origin)) {
    await updatePreferences({
      disabledOrigins: [...prefs.disabledOrigins, origin],
    });
  }
}

/**
 * Explicitly enables Linaw companion on a given origin.
 */
export async function enableOrigin(origin: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs.disabledOrigins.includes(origin)) {
    await updatePreferences({
      disabledOrigins: prefs.disabledOrigins.filter((item) => item !== origin),
    });
  }
}

/** Alias for getPreferences() maintaining compatibility. */
export async function loadPreferences(): Promise<ExtensionPreferences> {
  return getPreferences();
}

/** Alias for updatePreferences() maintaining compatibility. */
export async function savePreferences(
  preferences: Partial<ExtensionPreferences>,
): Promise<ExtensionPreferences> {
  return updatePreferences(preferences);
}

/** Auto-Adapt is on only when the user explicitly chose auto_adapt. */
export function isAutoAdaptEnabled(
  preferences?: { browserBehavior?: string } | null,
): boolean {
  return preferences?.browserBehavior === "auto_adapt";
}

/**
 * chrome.storage adapter implementing the shared PreferenceStore interface.
 */
export const chromePreferenceStore: PreferenceStore = {
  async get() {
    const result = await chrome.storage.local.get(PREFERENCES_KEY);
    const raw = result[PREFERENCES_KEY];
    if (raw == null) return null;
    return getPreferences();
  },

  async set(preferences) {
    await updatePreferences(preferences);
  },

  async clear() {
    await chrome.storage.local.remove(PREFERENCES_KEY);
  },
};
