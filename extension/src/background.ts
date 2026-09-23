/**
 * Thin MV3 service worker — not a backend.
 * Toolbar click asks the active tab's content script to adapt the selection.
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id == null) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "linaw.adaptSelection" });
  } catch {
    // Content script may be missing on restricted pages (chrome://, Web Store, etc.).
  }
});
