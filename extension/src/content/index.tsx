import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import type { Preferences } from "@/lib/domain";
import { Panel } from "./Panel";
import {
  extractMainReadableText,
  findMainContentRoot,
  getCurrentSelectionText,
} from "./extractor";
import {
  DEFAULT_PREFERENCES,
  disableOrigin,
  isAutoAdaptEnabled,
  isOriginDisabled,
  loadPreferences,
} from "../storage/preferences";
import { startLinawPreferenceSync } from "./prefs-sync";
import { getReadingComfort } from "../storage/reading-comfort";
import {
  clearPageReading,
  releasePageReadingHold,
  selectionInsideArticle,
  syncPageReading,
} from "./page-reading";

const HOST_ID = "linaw-companion-root";

/** Manual clarify needs only a short phrase; single-char drags are noise. */
export const MIN_SELECTION_CHARS = 3;

const RESTRICTED_PROTOCOLS = new Set([
  "chrome:",
  "chrome-extension:",
  "edge:",
  "about:",
  "moz-extension:",
  "view-source:",
  "data:",
  "blob:",
]);

export function isRestrictedPage(url: string = location.href): boolean {
  try {
    const protocol = new URL(url).protocol;
    if (RESTRICTED_PROTOCOLS.has(protocol)) return true;
    // Chrome Web Store and browser settings block content scripts entirely.
    if (/^https?:\/\/(chrome\.google\.com\/webstore|chromewebstore\.google\.com)/.test(url)) return true;
    return false;
  } catch {
    return true;
  }
}

function chromeRuntime(): typeof chrome.runtime | null {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) return chrome.runtime;
    // Content scripts can still use chrome.storage without runtime.id in some contexts.
    if (typeof chrome !== "undefined" && chrome.runtime) return chrome.runtime;
    return null;
  } catch {
    return null;
  }
}

async function safeSendSelection(text: string): Promise<void> {
  try {
    const runtime = chromeRuntime();
    if (!runtime?.sendMessage) return;
    await runtime.sendMessage({ type: "LINAW_TEXT_SELECTED", text });
  } catch {
    // Background worker may be idle, asleep, or blocked on this page.
  }
}

async function safeStorePending(text: string): Promise<void> {
  try {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return;
    await chrome.storage.local.set({ pendingSourceText: text });
  } catch {
    // Storage blocked (private mode / policy) — panel still works for this view.
  }
}

let bootstrapped = false;

export const PANEL_CSS = `
:host, * { box-sizing: border-box; }
:host {
  --color-brand: #4f5d2f;
  --color-brand-hover: #3f4a25;
  --color-brand-light: #e4ebd4;
  --color-paper: #f3ebe0;
  --color-paper-raised: #faf6f0;
  --color-paper-inset: #e8dfd2;
  --color-ink: #1a1814;
  --color-ink-muted: #5c564c;
  --color-action: #4f5d2f;
  --color-action-soft: #e4ebd4;
  --color-action-border: #6b7a3f;
  --color-slate-50: #faf6f0;
  --color-slate-100: #f3ebe0;
  --color-slate-200: #e8dfd2;
  --color-slate-300: #d4cbbd;
  --color-slate-400: #94a3b8;
  --color-slate-500: #726a5c;
  --color-slate-600: #5c564c;
  --color-slate-700: #334155;
  --color-slate-800: #1a1814;
  --color-slate-900: #0f172a;
  --color-white: #ffffff;
  --color-warning: #a16207;
  --color-warning-bg: #fef3c7;
  --color-pass: #3f4a25;
  --color-pass-bg: #e4ebd4;
  --color-pass-border: #6b7a3f;
  --font-ui: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --linaw-type-size: 0.875rem;
  --linaw-line-height: 1.6;
  --linaw-letter-spacing: normal;
  --linaw-word-spacing: normal;
  --linaw-reading-face: inherit;
  --linaw-reading-ink: #1a1814;
  --linaw-reading-bg: #f3ebe0;
  all: initial;
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
  .linaw-focus-line { transition: none !important; }
}
.linaw-shell {
  position: absolute;
  z-index: 2147483646;
  width: min(384px, calc(100vw - 32px));
  max-width: 384px;
  max-height: min(540px, calc(100vh - 32px));
  overflow-y: auto;
  border-radius: 16px;
  background-color: var(--color-paper-raised);
  border: 1px solid var(--color-paper-inset);
  box-shadow: 0 20px 25px -5px rgba(26, 24, 20, 0.1), 0 8px 10px -6px rgba(26, 24, 20, 0.08);
  color: var(--color-ink);
  animation: linaw-popover-in 160ms cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@keyframes linaw-popover-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.linaw-panel {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  color: var(--color-ink);
  letter-spacing: -0.025em;
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
  background-color: var(--color-pass-bg);
  border: 1px solid var(--color-pass-border);
  color: var(--color-pass);
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
.linaw-status-pill.is-warning {
  background-color: var(--color-warning-bg);
  border-color: #fde68a;
  color: var(--color-warning);
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
  background-color: var(--color-action-soft);
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
  font-weight: 500;
  color: var(--color-pass);
  line-height: 1.2;
}
.linaw-status-pill.is-warning .linaw-status-pill-title {
  color: var(--color-warning);
}
.linaw-status-pill-subtitle {
  font-size: 0.7rem;
  color: var(--color-action-border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.linaw-status-pill.is-warning .linaw-status-pill-subtitle {
  color: #b45309;
}
.linaw-gear-btn {
  background: transparent;
  border: none;
  color: var(--color-pass);
  font-size: 1rem;
  min-width: 44px;
  min-height: 44px;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 150ms ease;
}
.linaw-gear-btn:hover {
  color: var(--color-brand-hover);
}
.linaw-status-pill.is-warning .linaw-gear-btn {
  color: var(--color-warning);
}
.linaw-gear-btn.is-active {
  color: var(--color-action);
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
.linaw-select {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--color-slate-800);
  background-color: var(--color-white);
  border: 1px solid var(--color-slate-300);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
.linaw-select:focus {
  outline: 2px solid var(--color-action);
  outline-offset: 1px;
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
  background-color: var(--color-action);
  color: var(--color-white);
  font-weight: 600;
}
.linaw-reading-disclosure {
  background-color: var(--color-paper);
  border: 1px solid var(--color-paper-inset);
  border-radius: 0.75rem;
  padding: 0;
}
.linaw-reading-summary {
  list-style: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-ink-muted);
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  user-select: none;
}
.linaw-reading-summary::-webkit-details-marker { display: none; }
.linaw-reading-summary::before {
  content: "";
  width: 0;
  height: 0;
  border-left: 5px solid var(--color-ink-muted);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  margin-right: 8px;
  transition: transform 150ms ease;
}
details[open] > .linaw-reading-summary::before {
  transform: rotate(90deg);
}
.linaw-reading-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px 12px;
  border-top: 1px solid var(--color-paper-inset);
  padding-top: 10px;
}
.linaw-comfort-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.linaw-segment {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.linaw-segment-btn {
  font-family: var(--font-ui);
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  background-color: var(--color-paper-raised);
  border: 1px solid var(--color-paper-inset);
  border-radius: 8px;
  min-height: 44px;
  min-width: 44px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
.linaw-segment-btn:hover {
  border-color: var(--color-action-border);
  color: var(--color-ink);
}
.linaw-segment-btn.is-active {
  background-color: var(--color-action-soft);
  border-color: var(--color-action-border);
  color: var(--color-action);
  font-weight: 600;
}
.linaw-toggle-btn {
  align-self: flex-start;
  min-width: 72px;
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
.linaw-disabled-banner {
  background-color: var(--color-warning-bg);
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.linaw-disabled-banner-text {
  font-size: 0.85rem;
  color: var(--color-warning);
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
}
.linaw-enable-primary-btn {
  background-color: var(--color-action);
  color: var(--color-white);
  border: 1px solid var(--color-action);
  border-radius: 0.5rem;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  min-height: 44px;
  transition: background-color 150ms ease;
}
.linaw-enable-primary-btn:hover {
  background-color: var(--color-brand-hover);
}
.linaw-disabled-sites-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--color-slate-200);
}
.linaw-empty-text {
  font-size: 0.72rem;
  color: var(--color-slate-400);
  margin: 0;
  font-style: italic;
}
.linaw-disabled-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.linaw-disabled-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--color-white);
  border: 1px solid var(--color-slate-200);
  border-radius: 6px;
  padding: 4px 8px;
}
.linaw-disabled-origin {
  font-size: 0.72rem;
  color: var(--color-slate-700);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.linaw-remove-btn {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
}
.linaw-remove-btn:hover {
  background-color: #fee2e2;
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
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}
.linaw-toggle-original-btn {
  background: transparent;
  border: none;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  transition: color 150ms ease;
}
.linaw-toggle-original-btn:hover {
  color: #334155;
  text-decoration: underline;
}
.linaw-doc-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  line-height: 1.35;
}
.linaw-content-card {
  background-color: var(--linaw-reading-bg, var(--color-paper));
  border: 1px solid var(--color-paper-inset);
  border-radius: 12px;
  padding: 12px 14px;
  max-height: 38vh;
  overflow-y: auto;
}
.linaw-reading-text {
  color: var(--linaw-reading-ink);
}
.linaw-reading-text .linaw-paragraph,
.linaw-reading-text .linaw-bullet-item {
  font-size: var(--linaw-type-size);
  line-height: var(--linaw-line-height);
  letter-spacing: var(--linaw-letter-spacing);
  word-spacing: var(--linaw-word-spacing);
  font-family: var(--linaw-reading-face);
  color: var(--linaw-reading-ink);
}
.linaw-focus-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}
.linaw-focus-line {
  background-color: color-mix(in srgb, var(--color-action-soft) 70%, transparent);
  border-radius: 4px;
  box-shadow: inset 3px 0 0 var(--color-action);
  padding: 2px 6px;
  margin-left: -6px;
  margin-right: -6px;
  transition: background-color 150ms ease, box-shadow 150ms ease;
  cursor: pointer;
}
.linaw-deadline-mark {
  background-color: var(--color-action-soft);
  color: var(--color-action);
  font-weight: 600;
  border-radius: 2px;
  padding: 0 2px;
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
  font-weight: 400;
  line-height: 1.6;
  color: #334155;
  font-family: inherit;
}
.linaw-paragraph {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  font-family: inherit;
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
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  margin-top: 4px;
  align-items: stretch;
}
.linaw-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-ink);
  background-color: var(--color-paper-raised);
  border: 1px solid var(--color-paper-inset);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 44px;
  cursor: pointer;
  transition: all 150ms ease;
}
.linaw-copy-btn:hover {
  background-color: var(--color-paper);
  border-color: var(--color-action-border);
}
.linaw-listen-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.linaw-pace-segment {
  width: 100%;
}
.linaw-pace-btn {
  flex: 1;
  min-width: 0;
  font-size: 0.68rem;
  padding: 6px 4px;
}
.linaw-listen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
  color: #ffffff;
  background-color: var(--color-action);
  border: 1px solid var(--color-action);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 44px;
  cursor: pointer;
  transition: all 150ms ease;
  width: 100%;
}
.linaw-listen-btn:hover {
  background-color: var(--color-brand-hover);
  border-color: var(--color-brand-hover);
}
.linaw-listen-btn.is-listening {
  background-color: #a16207;
  border-color: #a16207;
}
.linaw-listen-btn.is-listening:hover {
  background-color: #854d0e;
  border-color: #854d0e;
}
.linaw-btn-svg {
  display: inline-block;
  flex-shrink: 0;
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
  background-color: var(--color-action);
  color: var(--color-white);
  border: 1px solid var(--color-brand-hover);
  border-radius: 9999px;
  padding: 8px 16px;
  min-height: 44px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgb(26 24 20 / 0.15);
  cursor: pointer;
}
`;

function buildPanelCss(): string {
  let fontFace = "";
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      const url = chrome.runtime.getURL("fonts/Lexend.woff2");
      fontFace = `
@font-face {
  font-family: "Lexend";
  src: url("${url}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
`;
    }
  } catch {
    // Outside an extension context (tests / SSR) — Clear falls back to system UI.
  }
  return fontFace + PANEL_CSS;
}

type HostState = {
  root: Root | null;
  shadow: ShadowRoot | null;
  host: HTMLElement | null;
  fab: HTMLButtonElement | null;
  preferences: Preferences;
  source: string;
  disabled: boolean;
  panelOpen: boolean;
  position: { top: number; left: number } | null;
  replaceOnPage: boolean;
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
  position: null,
  replaceOnPage: false,
};

function ensureHost(): ShadowRoot | null {
  try {
    const docRoot = document.documentElement;
    if (!docRoot) return null;
    let host = document.getElementById(HOST_ID) as HTMLElement | null;
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.setAttribute("data-linaw", "companion");
      docRoot.appendChild(host);
    }
  const shadow =
    host.shadowRoot ?? host.attachShadow({ mode: "open" });
  if (!shadow.querySelector("style[data-linaw-style]")) {
    const style = document.createElement("style");
    style.setAttribute("data-linaw-style", "true");
    style.textContent = buildPanelCss();
    shadow.appendChild(style);
  }
  state.host = host;
  state.shadow = shadow;
  return shadow;
  } catch {
    return null;
  }
}

function calculatePopoverPosition(rect: DOMRect): { top: number; left: number } {
  const cardWidth = Math.min(384, window.innerWidth - 32);
  const estimatedHeight = 440;
  const margin = 16;

  // Viewport-relative horizontal position, clamped within viewport bounds
  let vpLeft = rect.left;
  if (vpLeft + cardWidth > window.innerWidth - margin) {
    vpLeft = window.innerWidth - cardWidth - margin;
  }
  if (vpLeft < margin) {
    vpLeft = margin;
  }

  // Viewport-relative vertical position: anchor directly underneath selected range
  let vpTop = rect.bottom + 8;
  if (vpTop + estimatedHeight > window.innerHeight - margin) {
    if (rect.top - 8 - estimatedHeight >= margin) {
      vpTop = rect.top - 8 - estimatedHeight;
    } else {
      vpTop = Math.max(margin, window.innerHeight - estimatedHeight - margin);
    }
  }

  // Anchor offset by window.scrollX and window.scrollY
  const left = vpLeft + window.scrollX;
  const top = vpTop + window.scrollY;

  return { top, left };
}

function renderPanel() {
  let shadow: ShadowRoot | null = null;
  try {
    shadow = ensureHost();
  } catch {
    return;
  }
  if (!shadow) return;
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
    try {
      state.root = createRoot(mount);
    } catch {
      return;
    }
  }

  const positionStyle: Record<string, string> = state.position
    ? {
        position: "absolute",
        top: `${Math.round(state.position.top)}px`,
        left: `${Math.round(state.position.left)}px`,
        right: "auto",
        bottom: "auto",
      }
    : {
        position: "fixed",
        top: "20px",
        right: "20px",
        left: "auto",
        bottom: "auto",
      };

  state.root.render(
    createElement(
      "div",
      { className: "linaw-shell", style: positionStyle },
      createElement(Panel, {
        source: state.source,
        preferences: state.preferences,
        origin: location.origin,
        replaceOnPage: state.replaceOnPage,
        onPreferencesChange: (next) => {
          const wasAuto = isAutoAdaptEnabled(state.preferences);
          state.preferences = next;
          renderPanel();
          // Only extract page text when the user newly opts into Auto-Clarify.
          if (!wasAuto && isAutoAdaptEnabled(next)) {
            void maybeAutoAdapt();
          }
        },
        onAdaptSelection: () => {
          void openWithSelection();
        },
        onClose: () => {
          state.panelOpen = false;
          state.position = null;
          renderPanel();
        },
        onDisableSite: () => {
          void (async () => {
            await disableOrigin(location.origin);
            state.disabled = true;
            releasePageReadingHold();
            clearPageReading();
            state.panelOpen = false;
            state.position = null;
            renderPanel();
            updateFab();
          })();
        },
      }),
    ),
  );
}

function updateFab() {
  let shadow: ShadowRoot | null = null;
  try {
    shadow = ensureHost();
  } catch {
    return;
  }
  if (!shadow) return;
  if (state.disabled || state.panelOpen) {
    state.fab?.remove();
    state.fab = null;
    return;
  }

  const selection = getCurrentSelectionText();
  if (!selection || selection.length < MIN_SELECTION_CHARS) {
    state.fab?.remove();
    state.fab = null;
    return;
  }

  if (!state.fab) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "linaw-fab-btn";
    btn.name = "linaw-fab-btn";
    btn.className = "linaw-fab";
    btn.textContent = "Clarify with Linaw";

    btn.addEventListener("click", () => {
      void openWithSelection();
    });
    shadow.appendChild(btn);
    state.fab = btn;
  }
}

async function handleTextSelection() {
  if (state.disabled) return;
  let sel: Selection | null = null;
  try {
    sel = window.getSelection();
  } catch {
    return;
  }
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const selection = sel.toString().replace(/\s+/g, " ").trim();
  if (selection.length >= MIN_SELECTION_CHARS) {
    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        state.position = calculatePopoverPosition(rect);
      }
    } catch {
      state.position = null;
    }
    await safeSendSelection(selection);
    await safeStorePending(selection);
    state.replaceOnPage = selectionInsideArticle(
      findMainContentRoot(document),
      window.getSelection()?.anchorNode ?? null,
    );
    await openWithSource(selection);
  }
}

async function openWithSource(source: string) {
  if (state.disabled) return;
  const trimmed = source.trim();
  if (!trimmed) return;
  state.source = trimmed;
  state.panelOpen = true;
  try {
    state.preferences = await loadPreferences();
  } catch {
    // Keep last known preferences when storage is blocked.
  }
  try {
    renderPanel();
  } catch {
    state.panelOpen = false;
    return;
  }
  try {
    updateFab();
  } catch {
    // FAB is optional; panel is already open.
  }
}

async function openWithSelection() {
  let sel: Selection | null = null;
  try {
    sel = window.getSelection();
  } catch {
    sel = null;
  }
  const selection = getCurrentSelectionText();
  if (!selection || selection.length < MIN_SELECTION_CHARS) return;
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    try {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        state.position = calculatePopoverPosition(rect);
      }
    } catch {
      state.position = null;
    }
  }
  if (selection.length >= MIN_SELECTION_CHARS) {
    await safeSendSelection(selection);
    await safeStorePending(selection);
  }
  state.replaceOnPage = selectionInsideArticle(
    findMainContentRoot(document),
    sel?.anchorNode ?? null,
  );
  await openWithSource(selection);
}

/**
 * Auto-Clarify only after explicit opt-in (browserBehavior === auto_adapt or auto)
 * and when this origin is not disabled. Never sends page text before consent.
 */
async function maybeAutoAdapt() {
  if (state.disabled) return;
  try {
    state.preferences = await loadPreferences();
  } catch {
    return;
  }
  if (!isAutoAdaptEnabled(state.preferences)) return;
  let text = "";
  try {
    text = extractMainReadableText();
  } catch {
    return;
  }
  if (!text) return;
  try {
    state.replaceOnPage = findMainContentRoot(document) != null;
  } catch {
    state.replaceOnPage = false;
  }
  state.position = null;
  await safeStorePending(text);
  await safeSendSelection(text);
  await openWithSource(text);
}

function closePanel() {
  state.panelOpen = false;
  state.position = null;
  try {
    renderPanel();
  } catch {
    // Panel already torn down.
  }
}

/** Live-sync prefs + disabled sites so sidepanel/web changes apply without reload (P0-2). */
function startPreferenceStorageSync(): void {
  try {
    if (typeof chrome === "undefined" || !chrome.storage?.onChanged) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes["linaw.preferences.v1"]) return;
      void (async () => {
        try {
          const next = await loadPreferences();
          const wasDisabled = state.disabled;
          const origin = window.location.origin;
          const nowDisabled = next.disabledOrigins.includes(origin);
          state.preferences = next;
          state.disabled = nowDisabled;
          if (nowDisabled && !wasDisabled) {
            try {
              releasePageReadingHold();
              clearPageReading();
            } catch {
              // Page already clean.
            }
            closePanel();
            try {
              updateFab();
            } catch {
              // Optional.
            }
            return;
          }
          if (state.panelOpen) {
            try {
              renderPanel();
            } catch {
              // Keep old panel on render failure.
            }
          }
        } catch {
          // Storage read failed; keep last known state.
        }
      })();
    });
  } catch {
    // Storage sync unavailable — bootstrap values still work.
  }
}

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  try {
    if (isRestrictedPage()) return;
  } catch {
    return;
  }

  let origin = "";
  try {
    origin = window.location.origin;
  } catch {
    return;
  }

  try {
    state.disabled = await isOriginDisabled(origin);
  } catch {
    state.disabled = false;
  }

  // Preference sync with the Linaw web app (localhost) even when this origin is disabled.
  try {
    startLinawPreferenceSync();
  } catch {
    // Web sync is optional.
  }
  startPreferenceStorageSync();

  // If disabled, do not attach listeners or perform automatic extraction
  if (state.disabled) {
    return;
  }

  try {
    state.preferences = await loadPreferences();
  } catch {
    state.preferences = DEFAULT_PREFERENCES;
  }
  try {
    syncPageReading(await getReadingComfort());
  } catch {
    // Page styling is optional.
  }

  // Listen for clicks outside the companion card to dismiss it
  document.addEventListener("mousedown", (e: MouseEvent) => {
    if (!state.panelOpen) return;
    try {
      if (state.host && e.composedPath().includes(state.host)) {
        return;
      }
    } catch {
      return;
    }
    closePanel();
  });

  // Listen for text selection (mouseup); short phrases clarify too (MIN_SELECTION_CHARS)
  document.addEventListener("mouseup", (e: MouseEvent) => {
    try {
      if (state.host && e.composedPath().includes(state.host)) {
        return;
      }
    } catch {
      return;
    }
    void handleTextSelection().catch(() => {
      // Selection handling never breaks the page.
    });
  });

  document.addEventListener("selectionchange", () => {
    try {
      updateFab();
    } catch {
      // FAB is optional.
    }
  });

  try {
    chrome.runtime?.onMessage?.addListener((message, _sender, sendResponse) => {
      if (message?.type === "linaw.adaptSelection") {
        void openWithSelection()
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: false }));
        return true;
      }
      return undefined;
    });
  } catch {
    // Messaging unavailable — toolbar fallback disabled on this page.
  }

  // If browserBehavior is auto, extract readable article/main text on page load as default content;
  // if "manual", strictly wait for user selection.
  if (isAutoAdaptEnabled(state.preferences)) {
    void maybeAutoAdapt();
  }
}

void bootstrap();

