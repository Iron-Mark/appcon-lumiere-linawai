# 07 — Extension

## Purpose

Manifest V3 Chrome companion that reuses web ports: same preferences schema, `adapt()`, and Sindi states. Thin overlay—not a second product.

## Ownership

- Directory: `extension/` only
- Build script may be added to root `package.json` without a second install or monorepo
- Imports `lib/` through one alias
- Does **not** implement `lib/storage/preferences.ts` chrome binding inside Wave 0 web store—extension owns its `chrome.storage` adapter implementing the same `PreferenceStore` interface

## User-visible behavior

Panel / overlay repeats:

- Current modes (detail, wording, delivery)
- Status (working / pass / warning)
- Show original
- Open in web app
- Disable on this site
- **Auto-Clarify** off until the user turns it on
- Manual “Clarify with Linaw” works without Auto-Clarify

Sindi states in the header, smaller size. Keyboard focus matches visual order.

## Technical

- Manifest V3
- Page text or selected-text ingestion
- When Auto-Clarify is explicitly enabled by the user: eligible content may clarify automatically with the saved profile
- Auto-Clarify stays off until that opt-in; the campus-pilot sample does not assume it is on
- Site disable is remembered per origin
- No separate adaptation algorithm—call `adapt()`

## Acceptance checks

- [ ] Unpacked load works per README instructions once built.
- [ ] Manual clarify selection works with Auto-Clarify off.
- [ ] Auto-Clarify requires explicit enable.
- [ ] Show original / open web / disable on this site present.
- [ ] Same domain preference field names as web.
- [ ] Does not add `app/api` or a second npm package tree.

## Out of scope

- Chrome Web Store publication requirements beyond hackathon unpack.
- Full page redesign cloning the web marketing site.
- OCR of images on the page.
