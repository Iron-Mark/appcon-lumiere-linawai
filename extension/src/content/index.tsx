import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import type { Preferences } from "@/lib/domain";
import { Panel } from "./Panel";
import {
  extractMainReadableText,
  getCurrentSelectionText,
} from "./extractor";
import {
  DEFAULT_PREFERENCES,
  disableOrigin,
  isAutoAdaptEnabled,
  isOriginDisabled,
  loadPreferences,
  savePreferences,
} from "../storage/preferences";

const HOST_ID = "linaw-ai-extension-host";

const PANEL_CSS = `
:host, * { box-sizing: border-box; }
:host {
  --color-brand: #4f5d2f;
  --color-brand-hover: #3f4a25;
  --color-brand-light: #eef3e6;
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-white: #ffffff;
  --color-warning: #b45309;
  --color-warning-bg: #fef3c7;
  --color-pass: #15803d;
  --color-pass-bg: #dcfce7;
  --font-ui: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-reading: "Palatino Linotype", Palatino, Georgia, serif;
  all: initial;
  font-family: var(--font-ui);
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
.linaw-shell {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2147483646;
  width: min(400px, calc(100vw - 32px));
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 1rem;
  background-color: var(--color-white);
  border: 1px solid var(--color-slate-200);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  color: var(--color-slate-900);
}
.linaw-panel {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.linaw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.linaw-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.linaw-sindi-wrap {
  transform: scale(0.75);
  transform-origin: left center;
  display: flex;
  align-items: center;
}
.linaw-brand-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-slate-900);
  letter-spacing: -0.01em;
}
.linaw-close-btn {
  background: transparent;
  border: none;
  color: var(--color-slate-400);
  font-size: 1.1rem;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 150ms ease;
}
.linaw-close-btn:hover {
  color: var(--color-slate-700);
}
.linaw-status-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--color-slate-50);
  border: 1px solid var(--color-slate-200);
  border-radius: 9999px;
  padding: 6px 12px;
}
.linaw-status-pill-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.linaw-status-pill-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  font-size: 11px;
  flex-shrink: 0;
}
.linaw-status-pill-badge.is-pass {
  background-color: var(--color-pass-bg);
  color: var(--color-pass);
}
.linaw-status-pill-badge.is-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}
.linaw-status-pill-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.linaw-status-pill-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-slate-800);
  line-height: 1.2;
}
.linaw-status-pill-subtitle {
  font-size: 0.7rem;
  color: var(--color-slate-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.linaw-gear-btn {
  background: transparent;
  border: none;
  color: var(--color-slate-500);
  font-size: 1rem;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 150ms ease;
}
.linaw-gear-btn:hover {
  color: var(--color-slate-800);
}
.linaw-gear-btn.is-active {
  color: var(--color-brand);
}
.linaw-settings-drawer {
  background-color: var(--color-slate-50);
  border: 1px solid var(--color-slate-200);
  border-radius: 0.75rem;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.linaw-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.linaw-settings-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-slate-600);
}
.linaw-btn-group {
  display: inline-flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-slate-300);
}
.linaw-btn-group button {
  background-color: var(--color-white);
  border: none;
  font-size: 0.75rem;
  padding: 4px 10px;
  color: var(--color-slate-600);
  cursor: pointer;
}
.linaw-btn-group button.is-active {
  background-color: var(--color-brand);
  color: var(--color-white);
  font-weight: 600;
}
.linaw-settings-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px solid var(--color-slate-200);
}
.linaw-text-link {
  font-size: 0.72rem;
  color: var(--color-slate-500);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}
.linaw-text-link:hover {
  color: var(--color-slate-800);
  text-decoration: underline;
}
.linaw-reading-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.linaw-reading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.linaw-reading-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-slate-500);
  background-color: var(--color-slate-100);
  padding: 3px 8px;
  border-radius: 4px;
}
.linaw-toggle-original-btn {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  color: var(--color-brand);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
.linaw-toggle-original-btn:hover {
  color: var(--color-brand-hover);
}
.linaw-doc-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-slate-900);
  line-height: 1.35;
}
.linaw-content-card {
  background-color: var(--color-slate-50);
  border: 1px solid var(--color-slate-200);
  border-radius: 0.75rem;
  padding: 12px 14px;
  max-height: 38vh;
  overflow-y: auto;
}
.linaw-bullet-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.linaw-bullet-item {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-slate-800);
  font-family: var(--font-reading);
}
.linaw-paragraph {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-slate-800);
  white-space: pre-wrap;
  font-family: var(--font-reading);
}
.linaw-check-warning {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 0.75rem;
  color: var(--color-warning);
  background-color: var(--color-warning-bg);
  padding: 6px 10px;
  border-radius: 4px;
}
.linaw-error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-warning);
}
.linaw-loading {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-slate-500);
}
.linaw-action-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
}
.linaw-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-slate-700);
  background-color: var(--color-white);
  border: 1px solid var(--color-slate-300);
  border-radius: 0.5rem;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 150ms ease;
}
.linaw-copy-btn:hover {
  background-color: var(--color-slate-50);
  border-color: var(--color-slate-400);
}
.linaw-listen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-white);
  background-color: var(--color-brand);
  border: 1px solid var(--color-brand);
  border-radius: 0.5rem;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 150ms ease;
}
.linaw-listen-btn:hover {
  background-color: var(--color-brand-hover);
}
.linaw-listen-btn.is-listening {
  background-color: var(--color-warning);
  border-color: var(--color-warning);
}
.linaw-btn-icon {
  font-size: 0.9rem;
  line-height: 1;
}
.linaw-footer-origin {
  margin-top: 2px;
  font-size: 0.68rem;
  color: var(--color-slate-400);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.linaw-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483645;
  background-color: var(--color-brand);
  color: var(--color-white);
  border: 1px solid var(--color-brand-hover);
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
  cursor: pointer;
}
`;

type HostState = {
  root: Root | null;
  shadow: ShadowRoot | null;
  host: HTMLElement | null;
  fab: HTMLButtonElement | null;
  preferences: Preferences;
  source: string;
  disabled: boolean;
  panelOpen: boolean;
};

const state: HostState = {
  root: null,
  shadow: null,
  host: null,
  fab: null,
  preferences: DEFAULT_PREFERENCES,
  source: "",
  disabled: false,
  panelOpen: false,
};

function ensureHost(): ShadowRoot {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("data-linaw", "companion");
    document.documentElement.appendChild(host);
  }
  const shadow =
    host.shadowRoot ?? host.attachShadow({ mode: "open" });
  if (!shadow.querySelector("style[data-linaw-style]")) {
    const style = document.createElement("style");
    style.setAttribute("data-linaw-style", "true");
    style.textContent = PANEL_CSS;
    shadow.appendChild(style);
  }
  state.host = host;
  state.shadow = shadow;
  return shadow;
}

function renderPanel() {
  const shadow = ensureHost();
  let mount = shadow.querySelector("#linaw-mount") as HTMLElement | null;
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "linaw-mount";
    shadow.appendChild(mount);
  }

  if (!state.panelOpen) {
    if (state.root) {
      state.root.unmount();
      state.root = null;
    }
    mount.replaceChildren();
    return;
  }

  if (!state.root) {
    state.root = createRoot(mount);
  }

  state.root.render(
    createElement(
      "div",
      { className: "linaw-shell" },
      createElement(Panel, {
        source: state.source,
        preferences: state.preferences,
        origin: location.origin,
        onPreferencesChange: (next) => {
          const wasAuto = isAutoAdaptEnabled(state.preferences);
          state.preferences = next;
          renderPanel();
          // Only extract page text when the user newly opts into Auto-Adapt.
          if (!wasAuto && isAutoAdaptEnabled(next)) {
            void maybeAutoAdapt();
          }
        },
        onAdaptSelection: () => {
          void openWithSelection();
        },
        onClose: () => {
          state.panelOpen = false;
          renderPanel();
        },
        onDisableSite: () => {
          void (async () => {
            await disableOrigin(location.origin);
            state.disabled = true;
            state.panelOpen = false;
            renderPanel();
            updateFab();
          })();
        },
      }),
    ),
  );
}

function updateFab() {
  const shadow = ensureHost();
  if (state.disabled || state.panelOpen) {
    state.fab?.remove();
    state.fab = null;
    return;
  }

  const selection = getCurrentSelectionText();
  if (!selection) {
    state.fab?.remove();
    state.fab = null;
    return;
  }

  if (!state.fab) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "linaw-fab";
    btn.textContent = "Adapt with Linaw";
    btn.addEventListener("click", () => {
      void openWithSelection();
    });
    shadow.appendChild(btn);
    state.fab = btn;
  }
}

async function handleTextSelection() {
  if (state.disabled) return;
  const selection = getCurrentSelectionText();
  if (selection && selection.length > 20) {
    try {
      await chrome.runtime.sendMessage({
        type: "LINAW_TEXT_SELECTED",
        text: selection,
      });
    } catch {
      // Background worker might be idle or asleep
    }
    await chrome.storage.local.set({ pendingSourceText: selection });
  }
}

async function openWithSource(source: string) {
  if (state.disabled) return;
  const trimmed = source.trim();
  if (!trimmed) return;
  state.source = trimmed;
  state.panelOpen = true;
  state.preferences = await loadPreferences();
  renderPanel();
  updateFab();
}

async function openWithSelection() {
  const selection = getCurrentSelectionText();
  if (!selection) return;
  if (selection.length > 20) {
    try {
      await chrome.runtime.sendMessage({
        type: "LINAW_TEXT_SELECTED",
        text: selection,
      });
    } catch {
      // Ignore
    }
    await chrome.storage.local.set({ pendingSourceText: selection });
  }
  await openWithSource(selection);
}

/**
 * Auto-Adapt only after explicit opt-in (browserBehavior === auto_adapt or auto)
 * and when this origin is not disabled. Never sends page text before consent.
 */
async function maybeAutoAdapt() {
  if (state.disabled) return;
  state.preferences = await loadPreferences();
  if (!isAutoAdaptEnabled(state.preferences)) return;
  const text = extractMainReadableText();
  if (!text) return;
  await chrome.storage.local.set({ pendingSourceText: text });
  try {
    await chrome.runtime.sendMessage({
      type: "LINAW_TEXT_SELECTED",
      text,
    });
  } catch {
    // service worker may be starting up
  }
  await openWithSource(text);
}

async function bootstrap() {
  const origin = window.location.origin;
  state.disabled = await isOriginDisabled(origin);

  // If disabled, do not attach listeners or perform automatic extraction
  if (state.disabled) {
    return;
  }

  // Seed chrome.storage with default preferences if not yet present
  const raw = await chrome.storage.local.get("linaw.preferences.v1");
  if (raw["linaw.preferences.v1"] == null) {
    await savePreferences(DEFAULT_PREFERENCES);
  }
  state.preferences = await loadPreferences();

  // Listen for text selection (mouseup); if length > 20, notify background and store
  document.addEventListener("mouseup", () => {
    void handleTextSelection();
  });

  document.addEventListener("selectionchange", () => {
    updateFab();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "linaw.adaptSelection") {
      void openWithSelection().then(() => sendResponse({ ok: true }));
      return true;
    }
    return undefined;
  });

  // If browserBehavior === "auto", extract readable article/main text on page load as default content;
  // if "manual", strictly wait for user selection.
  if (isAutoAdaptEnabled(state.preferences)) {
    void maybeAutoAdapt();
  }
}

void bootstrap();

