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
      void chrome.storage.local
        .set({ pendingSourceText: message.text })
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

