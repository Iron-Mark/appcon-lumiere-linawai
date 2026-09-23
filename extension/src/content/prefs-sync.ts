import type { Preferences } from "@/lib/domain";
import {
  LINAW_PREFERENCES_CHANGED_EVENT,
  LINAW_PREFS_MESSAGE_TYPE,
  LINAW_PREFS_SOURCE_EXT,
  LINAW_PREFS_SOURCE_WEB,
  isLinawPrefsSyncMessage,
  shouldApplyRemotePreferences,
  toDomainPreferences,
} from "@/lib/storage/preferences-sync";
import {
  PREFERENCES_KEY,
  applySyncedDomainPreferences,
  getStoredDomainPreferences,
} from "../storage/preferences";

const STORAGE_KEY = "linaw.preferences.v1";

const LINAW_DEV_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export function isLinawWebOrigin(origin: string = location.origin): boolean {
  return LINAW_DEV_ORIGINS.has(origin);
}

function readPagePreferences(): Preferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return toDomainPreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writePagePreferences(preferences: Preferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(
    new CustomEvent(LINAW_PREFERENCES_CHANGED_EVENT, { detail: preferences }),
  );
}

function offerToPage(preferences: Preferences): void {
  window.postMessage(
    {
      source: LINAW_PREFS_SOURCE_EXT,
      type: LINAW_PREFS_MESSAGE_TYPE,
      preferences,
    },
    location.origin,
  );
}

async function applyFromPage(remote: Preferences): Promise<void> {
  const local = await getStoredDomainPreferences();
  if (!shouldApplyRemotePreferences(local, remote)) return;
  await applySyncedDomainPreferences(remote);
}

/**
 * Bidirectional preference sync with the Linaw web app.
 * Uses the shared localStorage key for an initial LWW pass (same origin),
 * then window.postMessage for live updates while the site is open.
 * disabledOrigins stay extension-local.
 */
export function startLinawPreferenceSync(): void {
  if (!isLinawWebOrigin()) return;

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.origin !== location.origin) return;
    if (event.source !== window) return;
    if (!isLinawPrefsSyncMessage(event.data)) return;
    if (event.data.source !== LINAW_PREFS_SOURCE_WEB) return;
    const remote = toDomainPreferences(event.data.preferences);
    if (!remote) return;
    void applyFromPage(remote);
  });

  let applyingFromPageStorage = false;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[PREFERENCES_KEY]) return;
    if (applyingFromPageStorage) return;
    const next = toDomainPreferences(changes[PREFERENCES_KEY].newValue);
    if (!next) return;
    const page = readPagePreferences();
    if (shouldApplyRemotePreferences(page, next)) {
      writePagePreferences(next);
    }
    offerToPage(next);
  });

  void (async () => {
    const page = readPagePreferences();
    const local = await getStoredDomainPreferences();

    if (shouldApplyRemotePreferences(local, page) && page) {
      applyingFromPageStorage = true;
      try {
        await applySyncedDomainPreferences(page);
      } finally {
        applyingFromPageStorage = false;
      }
      offerToPage(page);
      return;
    }

    if (local && shouldApplyRemotePreferences(page, local)) {
      writePagePreferences(local);
      offerToPage(local);
      return;
    }

    if (local) {
      offerToPage(local);
    } else if (page) {
      offerToPage(page);
    }
  })();
}
