# Linaw AI — Chrome extension

Manifest V3 companion for the Linaw web app. Injects a thin reading panel that reuses the same preference schema, `adapt()` port (`lib/adapt`), and Sindi states. There is no extension backend and no `app/api`.

## Build (no root `package.json` script)

From the **repository root** (after `npm install` for the web app deps):

```bash
node extension/build.mjs
```

This writes `extension/dist/` and simple icons under `extension/icons/` using esbuild already present in the repo’s `node_modules`.

## Load unpacked

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `extension/` (the directory that contains `manifest.json`)

Toolbar icon: opens the side panel (shows the last pending selection, if any).  
On-page: select text → **Clarify with Linaw** pill, or right-click → **Clarify with Linaw**. Selecting text never opens the panel on its own. Turn **Auto-Clarify** on in the panel for automatic article clarification.

## Behavior

- **Preferences:** `chrome.storage.local` caches the same domain fields (`detail`, `wording`, `delivery`, `browserBehavior`, optional `updatedAt`). Default `browserBehavior` is `manual` (Auto-Clarify off).
- **Sync:** on `http://localhost:3000` / `http://127.0.0.1:3000`, preferences sync with the web app’s localStorage (last-write-wins via `updatedAt`). No backend.
- **Consent:** page text is not extracted or sent until the user clarifies a selection or explicitly enables Auto-Clarify. Per-origin **Disable on this site** stops the companion on that origin.
- **Manual:** select text, then open explicitly via the **Clarify with Linaw** pill, right-click → **Clarify with Linaw**, or the toolbar icon. Clarifies via `adapt()` from `lib/adapt` (never `fixture.ts` directly). The service worker asks the Linaw app at `http://127.0.0.1:3000` then `http://localhost:3000`. That app tries Gemini (`gemini-3.8-flash`), then the Pandev gateway, then the offline sample. Keys stay in the app, not in the extension. If Linaw is not running, the panel shows the offline example.
- **Auto-Clarify:** when enabled, a small deterministic main-text extractor runs, then the same `adapt()`. A model answer replaces that article.
- **Panel:** Clarified by Linaw, current mode, Full/Key Points, Original/Plain, Listen, Show original, Meaning Check status, Open in Linaw web app (`http://localhost:3000/read`), Disable on this site.
- **Listen:** Web Speech API on the displayed clarification only. Pace (slower / steady / faster) is extension-only.
- **On the page:** a model answer (`adapter: "model"`) replaces the article with plain paragraphs and list items. A fixture answer does not. A selection is written only when it sits inside the article; Auto-Clarify writes the whole article. **Page as it was** and **Disable on this site** restore the original words.
- **Reading:** Type size, spacing, Clear face, tone, focus line, and deadline marks. **On this page** applies them to the article. Stored under `linaw.readingComfort.v1` — not synced with the web app. The repeat-call cache lives on the Linaw server (source + detail + wording, 50 entries, memory only).
- **Sindi:** same states as the web mascot, smaller in the header; cautious Meaning Check copy only.
- **Permissions:** Chrome shows "read and change all your data on websites" because the companion runs on `http(s)://*/*` (needed for select-to-clarify and Auto-Clarify on any article). It does not exfiltrate browsing: page text is only processed after you clarify a selection or opt into Auto-Clarify, adaptation runs through the Linaw app you chose (or the offline sample), and per-origin **Disable on this site** is honored.

## Fonts

`extension/fonts/Lexend.woff2` is vendored (OFL) for the Clear reading face. Content scripts load it via `chrome.runtime.getURL` (see `fonts/README.md`). No Google Fonts CDN.
