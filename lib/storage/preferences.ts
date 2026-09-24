import {
  PreferencesSchema,
  type Preferences,
} from "@/lib/domain";
import {
  LINAW_PREFERENCES_CHANGED_EVENT,
  LINAW_PREFS_MESSAGE_TYPE,
  LINAW_PREFS_SOURCE_EXT,
  LINAW_PREFS_SOURCE_WEB,
  isLinawPrefsSyncMessage,
  shouldApplyRemotePreferences,
  stampPreferences,
  toDomainPreferences,
} from "@/lib/storage/preferences-sync";

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

function readRaw(): Preferences | null {
  if (!canUseLocalStorage()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return toDomainPreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeRaw(preferences: Preferences): void {
  if (!canUseLocalStorage()) return;
  const parsed = PreferencesSchema.parse(preferences);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
}

function notifyPreferencesChanged(preferences: Preferences): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LINAW_PREFERENCES_CHANGED_EVENT, { detail: preferences }),
  );
}

function broadcastToExtension(preferences: Preferences): void {
  if (typeof window === "undefined") return;
  window.postMessage(
    {
      source: LINAW_PREFS_SOURCE_WEB,
      type: LINAW_PREFS_MESSAGE_TYPE,
      preferences,
    },
    window.location.origin,
  );
}

let syncListenerAttached = false;

function applyFromExtension(remote: Preferences): void {
  const local = readRaw();
  if (!shouldApplyRemotePreferences(local, remote)) {
    // Local is newer (or tied non-default) — push so the extension catches up.
    if (local && shouldApplyRemotePreferences(remote, local)) {
      broadcastToExtension(local);
    }
    return;
  }
  writeRaw(remote);
  notifyPreferencesChanged(remote);
}

/** Listen for extension preference offers (content script on Linaw origin). */
export function ensureWebPreferenceSync(): void {
  if (typeof window === "undefined" || syncListenerAttached) return;
  syncListenerAttached = true;
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== window) return;
    if (!isLinawPrefsSyncMessage(event.data)) return;
    if (event.data.source !== LINAW_PREFS_SOURCE_EXT) return;
    const remote = toDomainPreferences(event.data.preferences);
    if (!remote) return;
    applyFromExtension(remote);
  });
}

export const localStoragePreferenceStore: PreferenceStore = {
  async get() {
    ensureWebPreferenceSync();
    return readRaw();
  },

  async set(preferences) {
    ensureWebPreferenceSync();
    if (!canUseLocalStorage()) return;
    const toStore = stampPreferences(PreferencesSchema.parse(preferences));
    writeRaw(toStore);
    notifyPreferencesChanged(toStore);
    broadcastToExtension(toStore);
    // Await so these loads finish inside the call. A floating import races
    // test teardown and fails CI after the file's environment is gone.
    const { attachPreferencesToSignedInProfile } = await import(
      "@/lib/auth/local"
    );
    attachPreferencesToSignedInProfile(toStore);
    const { pushPreferencesIfSignedIn } = await import("@/lib/auth/supabase");
    await pushPreferencesIfSignedIn(toStore);
  },

  async clear() {
    if (!canUseLocalStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

/** Default web binding. */
export const preferenceStore: PreferenceStore = localStoragePreferenceStore;

if (typeof window !== "undefined") {
  ensureWebPreferenceSync();
}
