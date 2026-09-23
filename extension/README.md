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

Toolbar icon: clarifies the current selection (works with Auto-Clarify off).  
On-page: select text → **Clarify with Linaw**, or turn **Auto-Clarify** on in the panel.

## Behavior

- **Preferences:** `chrome.storage.local` caches the same domain fields (`detail`, `wording`, `delivery`, `browserBehavior`, optional `updatedAt`). Default `browserBehavior` is `manual` (Auto-Clarify off).
- **Sync:** on `http://localhost:3000` / `http://127.0.0.1:3000`, preferences sync with the web app’s localStorage (last-write-wins via `updatedAt`). No backend.
- **Consent:** page text is not extracted or sent until the user clarifies a selection or explicitly enables Auto-Clarify. Per-origin **Disable on this site** stops the companion on that origin.
- **Manual:** selection → clarify via `adapt()` from `lib/adapt` (never `fixture.ts` directly).
- **Auto-Clarify:** when enabled, a small deterministic main-text extractor runs, then the same `adapt()`.
- **Panel:** Clarified by Linaw, current mode, Full/Key Points, Original/Plain, Listen, Show original, Meaning Check status, Open in Linaw web app (`http://localhost:3000/read`), Disable on this site.
- **Listen:** Web Speech API on the displayed clarification only.
- **Sindi:** same states as the web mascot, smaller in the header; cautious Meaning Check copy only.
