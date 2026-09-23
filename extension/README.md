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
On-page: select text → **Clarify with Linaw** (works with Auto-Clarify off), or turn **Auto-Clarify** on in the panel.

## Behavior

- **Preferences:** `chrome.storage.local` caches the same domain fields (`detail`, `wording`, `delivery`, `browserBehavior`, optional `updatedAt`). Default `browserBehavior` is `manual` (Auto-Clarify off).
- **Sync:** on `http://localhost:3000` / `http://127.0.0.1:3000`, preferences sync with the web app’s localStorage (last-write-wins via `updatedAt`). No backend.
- **Consent:** page text is not extracted or sent until the user clarifies a selection or explicitly enables Auto-Clarify. Per-origin **Disable on this site** stops the companion on that origin.
- **Manual:** selection → clarify via `adapt()` from `lib/adapt` (never `fixture.ts` directly). The service worker asks the Linaw app at `http://127.0.0.1:3000` then `http://localhost:3000`. That app tries Gemini (`gemini-3.8-flash`), then the Pandev gateway, then the offline sample. Keys stay in the app, not in the extension. If Linaw is not running, the panel shows the offline example.
- **Auto-Clarify:** when enabled, a small deterministic main-text extractor runs, then the same `adapt()`. A model answer replaces that article.
- **Panel:** Clarified by Linaw, current mode, Full/Key Points, Original/Plain, Listen, Show original, Meaning Check status, Open in Linaw web app (`http://localhost:3000/read`), Disable on this site.
- **Listen:** Web Speech API on the displayed clarification only. Pace (slower / steady / faster) is extension-only.
- **On the page:** a model answer (`adapter: "model"`) replaces the article with plain paragraphs and list items. A fixture answer does not. A selection is written only when it sits inside the article; Auto-Clarify writes the whole article. **Page as it was** and **Disable on this site** restore the original words.
- **Reading:** Type size, spacing, Clear face, tone, focus line, and deadline marks. **On this page** applies them to the article. Stored under `linaw.readingComfort.v1` — not synced with the web app. The repeat-call cache lives on the Linaw server (source + detail + wording, 50 entries, memory only).
- **Sindi:** same states as the web mascot, smaller in the header; cautious Meaning Check copy only.

## Fonts

`extension/fonts/Lexend.woff2` is vendored (OFL) for the Clear reading face. Content scripts load it via `chrome.runtime.getURL` (see `fonts/README.md`). No Google Fonts CDN.
