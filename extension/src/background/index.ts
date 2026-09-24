/**
 * Background Service Worker for Linaw AI extension.
 * Clarify calls the Linaw app (Gemini, then Pandev). The page never sees the keys.
 */
import { fetchLinawJson } from "../linaw-origin";

/**
 * Enable "click the toolbar icon opens the side panel".
 * On a fresh unpacked load Chrome can reject the first call with "No SW"
 * (worker not fully registered yet). That rejection is transient, so retry
 * quietly a few times. Anything logged with console.error lands on
 * chrome://extensions as a red Errors badge, so failures here stay silent —
 * the action.onClicked fallback below keeps the icon useful until the
 * behavior sticks.
 */
const PANEL_BEHAVIOR_RETRIES = 3;
const PANEL_BEHAVIOR_RETRY_MS = 1500;

function ensurePanelBehavior(attempt = 1): void {
  if (typeof chrome === "undefined" || !chrome.sidePanel?.setPanelBehavior) {
    return;
  }
  try {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => {
        if (attempt < PANEL_BEHAVIOR_RETRIES) {
          setTimeout(
            () => ensurePanelBehavior(attempt + 1),
            PANEL_BEHAVIOR_RETRY_MS,
          );
        }
      });
  } catch {
    // sidePanel unsupported here — the action fallback below covers it.
  }
}

ensurePanelBehavior();

/**
 * Right-click path: select text anywhere, then "Clarify with Linaw"
 * from the context menu. Same explicit-open flow as the on-page pill.
 * Menus persist across worker restarts, so always removeAll() first —
 * creating a duplicate id rejects as Unchecked runtime.lastError.
 */
async function ensureContextMenu(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.contextMenus) return;
  try {
    await chrome.contextMenus.removeAll();
  } catch {
    // Nothing to clear, or menus unsupported here.
  }
  try {
    await chrome.contextMenus.create({
      id: "linaw-clarify",
      title: "Clarify with Linaw",
      contexts: ["selection"],
    });
  } catch {
    // Menus unsupported here — pill and toolbar still work.
  }
}

if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled) {
  try {
    chrome.runtime.onInstalled.addListener(() => {
      void ensureContextMenu();
    });
  } catch {
    // Install hook unavailable — top-level call below still tries.
  }
}
void ensureContextMenu();

if (typeof chrome !== "undefined" && chrome.contextMenus?.onClicked) {
  try {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info?.menuItemId !== "linaw-clarify") return;
      if (tab?.id == null) return;
      try {
        void chrome.tabs
          .sendMessage(tab.id, { type: "linaw.adaptSelection" })
          .catch(() => {
            // Content script missing on restricted pages.
          });
      } catch {
        // Tabs unavailable.
      }
    });
  } catch {
    // Context menus unavailable — pill and toolbar still work.
  }
}

// Fallback action click handler in case side panel behavior is not supported
if (typeof chrome !== "undefined" && chrome.action?.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id == null) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "linaw.adaptSelection" });
    } catch {
      // Content script may be missing on restricted pages.
    }
  });
}

// Listen for messages from content scripts and store incoming text into chrome.storage.local
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (
      message?.type === "LINAW_TEXT_SELECTED" &&
      typeof message.text === "string"
    ) {
      // Tag the tab it came from so the side panel never shows one tab's
      // highlight under another tab's name.
      const origin = typeof message.origin === "string" ? message.origin : "";
      const entry = { text: message.text, origin, updatedAt: Date.now() };
      void chrome.storage.local
        .set({ pendingSourceText: entry })
        .then(() => {
          sendResponse({ ok: true });
        })
        .catch((error: unknown) => {
          console.error("Failed to store pendingSourceText:", error);
          sendResponse({ ok: false, error: String(error) });
        });
      return true; // Keep message channel open for asynchronous response
    }

    if (message?.type === "linaw.adaptInfo") {
      void fetchLinawJson("/api/adapt", { method: "GET" })
        .then((result) => {
          sendResponse(
            result
              ? { ok: true, status: result.status, json: result.json }
              : { ok: false },
          );
        })
        .catch(() => {
          sendResponse({ ok: false });
        });
      return true;
    }

    if (message?.type === "linaw.adapt" && message.input) {
      void fetchLinawJson("/api/adapt", {
        method: "POST",
        body: JSON.stringify(message.input),
      })
        .then((result) => {
          sendResponse(
            result
              ? { ok: result.status < 400, status: result.status, json: result.json }
              : { ok: false },
          );
        })
        .catch(() => {
          sendResponse({ ok: false });
        });
      return true;
    }

    return undefined;
  });
}

