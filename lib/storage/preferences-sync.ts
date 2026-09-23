import {
  DEFAULT_PREFERENCES,
  PreferencesSchema,
  type Preferences,
} from "@/lib/domain";

/** postMessage source for the Linaw web app. */
export const LINAW_PREFS_SOURCE_WEB = "linaw-web";

/** postMessage source for the Linaw extension content script. */
export const LINAW_PREFS_SOURCE_EXT = "linaw-extension";

/** Bidirectional preference exchange on the Linaw origin. */
export const LINAW_PREFS_MESSAGE_TYPE = "linaw.prefs.sync";

/** Same-tab event so React can refresh after extension→web apply. */
export const LINAW_PREFERENCES_CHANGED_EVENT = "linaw.preferences.changed";

export type LinawPrefsSyncMessage = {
  source: typeof LINAW_PREFS_SOURCE_WEB | typeof LINAW_PREFS_SOURCE_EXT;
  type: typeof LINAW_PREFS_MESSAGE_TYPE;
  preferences: Preferences;
};

export function prefsUpdatedAt(
  preferences: { updatedAt?: number } | null | undefined,
): number {
  const value = preferences?.updatedAt;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function isDefaultDomainPreferences(preferences: Preferences): boolean {
  return (
    preferences.detail === DEFAULT_PREFERENCES.detail &&
    preferences.wording === DEFAULT_PREFERENCES.wording &&
    preferences.delivery === DEFAULT_PREFERENCES.delivery &&
    preferences.browserBehavior === DEFAULT_PREFERENCES.browserBehavior
  );
}

/**
 * Last-write-wins. Equal timestamps do not overwrite unless local is
 * defaults / missing and remote is not (legacy payloads without updatedAt).
 */
export function shouldApplyRemotePreferences(
  local: Preferences | null,
  remote: Preferences,
): boolean {
  if (!local) return true;
  const localAt = prefsUpdatedAt(local);
  const remoteAt = prefsUpdatedAt(remote);
  if (remoteAt > localAt) return true;
  if (remoteAt < localAt) return false;
  return (
    isDefaultDomainPreferences(local) && !isDefaultDomainPreferences(remote)
  );
}

/** Domain fields only (strips extension-only keys like disabledOrigins). */
export function toDomainPreferences(raw: unknown): Preferences | null {
  if (!raw || typeof raw !== "object") return null;
  const result = PreferencesSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function isLinawPrefsSyncMessage(
  data: unknown,
): data is LinawPrefsSyncMessage {
  if (!data || typeof data !== "object") return false;
  const msg = data as Partial<LinawPrefsSyncMessage>;
  if (
    msg.type !== LINAW_PREFS_MESSAGE_TYPE ||
    (msg.source !== LINAW_PREFS_SOURCE_WEB &&
      msg.source !== LINAW_PREFS_SOURCE_EXT)
  ) {
    return false;
  }
  return toDomainPreferences(msg.preferences) != null;
}

export function stampPreferences(preferences: Preferences): Preferences {
  return PreferencesSchema.parse({
    ...preferences,
    updatedAt: Date.now(),
  });
}
