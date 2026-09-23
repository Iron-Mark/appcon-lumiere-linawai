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
  --color-paper: #f3ebe0;
  --color-paper-raised: #faf6f0;
  --color-paper-inset: #e8dfd2;
  --color-ink: #1a1814;
  --color-ink-muted: #5c564c;
  --color-ink-subtle: #8a8276;
  --color-action: #4f5d2f;
  --color-action-hover: #3f4a25;
  --color-action-soft: #e4ebd4;
  --color-action-border: #6b7a3f;
  --color-warning: #a16207;
  --color-warning-soft: #fef3c7;
  --color-pass: #3f4a25;
  --color-focus: #4f5d2f;
  --font-reading: "Palatino Linotype", Palatino, "Book Antiqua", serif;
  --font-ui: "Trebuchet MS", "Segoe UI", sans-serif;
  --motion-base: 220ms;
  all: initial;
  font-family: var(--font-ui);
}
@media (prefers-reduced-motion: reduce) {
  :host { --motion-base: 0ms; }
}
.linaw-shell {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483646;
  width: min(380px, calc(100vw - 24px));
  max-height: calc(100vh - 32px);
  overflow: auto;
  color: var(--color-ink);
  background: var(--color-paper);
  border: 1px solid var(--color-paper-inset);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--color-ink) 18%, transparent);
  border-radius: 4px;
}
.linaw-panel { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 12px; }
.linaw-header { display: flex; flex-direction: column; gap: 6px; }
.linaw-brand-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.linaw-sindi-wrap { transform: scale(0.78); transform-origin: left center; max-width: 85%; }
.linaw-sindi { font-size: 12px !important; }
.linaw-title {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.linaw-mode-line { margin: 0; color: var(--color-ink-muted); font-size: 0.8rem; }
.linaw-controls { display: flex; flex-direction: column; gap: 8px; }
.linaw-toggle-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.linaw-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-subtle); min-width: 4.5rem; }
.linaw-toggle-row button,
.linaw-actions button,
.linaw-link-btn,
.linaw-icon-btn,
.linaw-fab {
  font-family: var(--font-ui);
  font-size: 0.82rem;
  border: 1px solid var(--color-action-border);
  background: var(--color-paper-raised);
  color: var(--color-ink);
  padding: 6px 10px;
  border-radius: 3px;
  cursor: pointer;
}
.linaw-toggle-row button.is-active {
  background: var(--color-action-soft);
  border-color: var(--color-action);
  color: var(--color-action-hover);
}
.linaw-toggle-row button:focus-visible,
.linaw-actions button:focus-visible,
.linaw-link-btn:focus-visible,
.linaw-icon-btn:focus-visible,
.linaw-fab:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
.linaw-body { display: flex; flex-direction: column; gap: 8px; }
.linaw-note {
  font-family: var(--font-reading);
  font-size: 0.95rem;
  line-height: 1.55;
  max-width: 65ch;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-paper-inset);
  padding: 12px;
  white-space: pre-wrap;
  max-height: 40vh;
  overflow: auto;
}
.linaw-check-status { margin: 0; font-size: 0.8rem; color: var(--color-ink-muted); }
.linaw-error { margin: 0; color: var(--color-warning); font-size: 0.85rem; }
.linaw-muted { margin: 0; color: var(--color-ink-muted); font-size: 0.85rem; }
.linaw-actions { display: flex; flex-direction: column; gap: 6px; }
.linaw-link-btn { display: inline-block; text-decoration: none; text-align: center; }
.linaw-icon-btn { border: none; background: transparent; font-size: 1.25rem; line-height: 1; padding: 2px 6px; color: var(--color-ink-muted); }
.linaw-footer-meta { margin: 0; font-size: 0.7rem; color: var(--color-ink-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.linaw-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483645;
  background: var(--color-action);
  color: #faf6f0;
  border-color: var(--color-action-hover);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-ink) 20%, transparent);
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
  await openWithSource(selection);
}

/**
 * Auto-Adapt only after explicit opt-in (browserBehavior === auto_adapt)
 * and when this origin is not disabled. Never sends page text before consent.
 */
async function maybeAutoAdapt() {
  if (state.disabled) return;
  state.preferences = await loadPreferences();
  if (!isAutoAdaptEnabled(state.preferences)) return;
  const text = extractMainReadableText();
  if (!text) return;
  await openWithSource(text);
}

async function bootstrap() {
  state.disabled = await isOriginDisabled(location.origin);

  // Seed chrome.storage with the same schema; Auto-Adapt stays manual until opt-in.
  const raw = await chrome.storage.local.get("linaw.preferences.v1");
  if (raw["linaw.preferences.v1"] == null) {
    await savePreferences(DEFAULT_PREFERENCES);
  }
  state.preferences = await loadPreferences();

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

  if (!state.disabled) {
    void maybeAutoAdapt();
  }
}

void bootstrap();
