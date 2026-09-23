import {
  LISTEN_SETTINGS_KEY,
  normalizeListenSettings,
  type ListenSettings,
} from "@/lib/listen/settings";

export async function getListenSettings(): Promise<ListenSettings> {
  const result = await chrome.storage.local.get(LISTEN_SETTINGS_KEY);
  return normalizeListenSettings(result[LISTEN_SETTINGS_KEY]);
}

export async function saveListenSettings(
  partial: Partial<ListenSettings>,
): Promise<ListenSettings> {
  const current = await getListenSettings();
  const next = normalizeListenSettings({ ...current, ...partial });
  await chrome.storage.local.set({ [LISTEN_SETTINGS_KEY]: next });
  return next;
}
