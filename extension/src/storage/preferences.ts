import type { PreferenceStore } from "@/lib/storage/preferences";
import {
  stampPreferences,
  toDomainPreferences,
} from "@/lib/storage/preferences-sync";
import type { Preferences as DomainPreferences } from "@/lib/domain";

export type Detail = "full" | "key_points";
export type Wording = "original" | "plain" | "taglish";
export type Delivery = "read" | "listen";
export type BrowserBehavior = "auto_adapt" | "manual";

export interface ExtensionPreferences {
  detail: Detail;
  wording: Wording;
  delivery: Delivery;
  browserBehavior: BrowserBehavior;
  disabledOrigins: string[];
  /** Last-write-wins sync with the web app; optional for legacy payloads. */
  updatedAt?: number;
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

function normalizePreferences(
  raw: Partial<ExtensionPreferences> | undefined,
): ExtensionPreferences {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_PREFERENCES,
      disabledOrigins: [...DEFAULT_PREFERENCES.disabledOrigins],
    };
  }

  const detail: Detail = raw.detail === "full" ? "full" : "key_points";
  const wording: Wording =
    raw.wording === "original" || raw.wording === "taglish" ? raw.wording : "plain";
  const delivery: Delivery = raw.delivery === "listen" ? "listen" : "read";
  const browserBehavior: BrowserBehavior =
    raw.browserBehavior === "auto_adapt" ||
    (raw.browserBehavior as unknown as string) === "auto"
      ? "auto_adapt"
      : "manual";
  const disabledOrigins: string[] = Array.isArray(raw.disabledOrigins)
    ? raw.disabledOrigins.filter((item): item is string => typeof item === "string")
    : [];
  const updatedAt =
    typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
      ? raw.updatedAt
      : undefined;

  return {
    detail,
    wording,
    delivery,
    browserBehavior,
    disabledOrigins,
    ...(updatedAt !== undefined ? { updatedAt } : {}),
  };
}

/**
 * Retrieves the current extension preferences from chrome.storage.local.
 * Returns default preferences when nothing has been stored yet.
 */
export async function getPreferences(): Promise<ExtensionPreferences> {
  const result = await chrome.storage.local.get(PREFERENCES_KEY);
  const raw = result[PREFERENCES_KEY] as Partial<ExtensionPreferences> | undefined;
  return normalizePreferences(raw);
}

/** Raw stored domain-shaped prefs, or null when unset (for sync LWW). */
export async function getStoredDomainPreferences(): Promise<DomainPreferences | null> {
  const result = await chrome.storage.local.get(PREFERENCES_KEY);
  const raw = result[PREFERENCES_KEY];
  if (raw == null) return null;
  return toDomainPreferences(raw);
}

/**
 * Updates extension preferences with partial fields and persists to chrome.storage.local.
 */
export async function updatePreferences(
  partial: Partial<ExtensionPreferences>,
  options?: { fromSync?: boolean },
): Promise<ExtensionPreferences> {
  const current = await getPreferences();
  const merged: ExtensionPreferences = {
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

  if (options?.fromSync) {
    if (typeof partial.updatedAt === "number") {
      merged.updatedAt = partial.updatedAt;
    } else if (typeof current.updatedAt === "number") {
      merged.updatedAt = current.updatedAt;
    }
  } else {
    const stamped = stampPreferences({
      detail: merged.detail,
      wording: merged.wording as DomainPreferences["wording"],
      delivery: merged.delivery,
      browserBehavior: merged.browserBehavior,
    });
    merged.updatedAt = stamped.updatedAt;
  }

  await chrome.storage.local.set({ [PREFERENCES_KEY]: merged });
  return merged;
}

/**
 * Applies domain preferences from the web app (preserves disabledOrigins).
 */
export async function applySyncedDomainPreferences(
  remote: DomainPreferences,
): Promise<ExtensionPreferences> {
  return updatePreferences(
    {
      detail: remote.detail,
      wording: remote.wording === "taglish" ? "plain" : remote.wording,
      delivery: remote.delivery,
      browserBehavior: remote.browserBehavior,
      updatedAt: remote.updatedAt,
    },
    { fromSync: true },
  );
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

/** Auto-Clarify is on only when the user explicitly chose auto_adapt or auto. */
export function isAutoAdaptEnabled(
  preferences?: { browserBehavior?: string } | null,
): boolean {
  return (
    preferences?.browserBehavior === "auto_adapt" ||
    preferences?.browserBehavior === "auto"
  );
}

/**
 * chrome.storage adapter implementing the shared PreferenceStore interface.
 */
export const chromePreferenceStore: PreferenceStore = {
  async get() {
    const result = await chrome.storage.local.get(PREFERENCES_KEY);
    const raw = result[PREFERENCES_KEY];
    if (raw == null) return null;
    return toDomainPreferences(await getPreferences());
  },

  async set(preferences) {
    await updatePreferences(preferences);
  },

  async clear() {
    await chrome.storage.local.remove(PREFERENCES_KEY);
  },
};
