# 02 — Reading workspace

## Purpose

Present the adapted note for a session: status line, adapted text on warm paper, Show original, Listen, and mode switches that re-call `adapt()` with updated preferences.

## Ownership

- Directories: `components/read/`, `app/read/` (including `app/read/page.tsx`)
- Related: Meaning Check UI per [`03-meaning-check.md`](./03-meaning-check.md) (same track).
- Consume `adapt()` from `lib/adapt` (never import `fixture.ts`). Consume preferences from the store. Compose `components/sindi/` by `state` only.

## User-visible behavior

Route: `/read`

Layout (Granola note-card inspired):

- Title (e.g. session or “Clarified note”).
- One status line (adaptation overall status or short working copy)—not a dashboard of stats.
- Adapted text in a short measure (~65ch) on warm paper using **Lora**.
- Original source is **one action away** (e.g. “Show original”), not a permanent dual-pane that dominates.
- Controls (Raleway / Lucide): preference toggles for Detail / Wording / Delivery as needed; Listen; Show original.
- Sindi: **working** while `adapt()` is in flight; **reading** after a result; **listening** while speech runs; **pass** / **warning** when Meaning Check results apply (see mascot + meaning-check specs).

### Input for this slice

The development sample source is owned by the fixture track (campus-pilot text in `05-client-port.md`). The reading UI accepts adapted results from `adapt({ source, preferences })`. How the source string is obtained for the session (paste field vs fixture-provided default) must not hardcode that sample inside presentational components—pass source into `adapt()` from a thin page/container.

### Listen

- Uses the **Web Speech API** on the **exact displayed adaptation** (not a separately generated summary).
- Start/stop control; when speech ends, leave listening state.
- Respect reduced motion / avoid noisy animation; Sindi `listening` glow tracks speech when motion is allowed.

### Mode changes

Changing Detail / Wording / Delivery updates preferences (store) and re-invokes `adapt()`. Delivery Listen may auto-start speech after adaptation if that is the user’s delivery preference—keep behavior predictable and reversible.

## States

| State | UI |
| --- | --- |
| needs preferences | redirect or prompt toward `/` |
| working | Sindi working; do not blank the whole page behind a spinner |
| ready (pass) | adapted text; quiet pass treatment |
| ready (warning) | adapted text + warning affordance; Meaning Check marks (03) |
| showing original | original visible; easy return to adapted |
| listening | speech active; stop control available |
| adapt error | short recoverable message |

## Copy rules

- Status lines stay concrete and calm.
- No “100 overall,” prompt catalogs, or streak chrome.
- Warning copy stays cautious (see §12 / `03` / `04`).

## Acceptance checks

- [ ] Adapted text renders in Lora on paper tokens; UI chrome in Raleway.
- [ ] Show original reveals source and can be dismissed without losing adapted text.
- [ ] Listen speaks the displayed adapted string via Web Speech API.
- [ ] Preference changes call `adapt()` again with domain preferences.
- [ ] Sindi states match working / reading / listening / pass / warning as applicable.
- [ ] No chat composer layout; no inset marketing hero as the shell.
- [ ] Narrow viewports remain usable (rail may stack—see 03).

## Out of scope

- OCR/PDF upload pipelines.
- Implementing Fidelity Guard layers (fidelity track)—UI displays check results from `adapt()` response / fidelity pipeline output.
- Golden fixture content authorship (fixture track).
- Extension overlay (extension track).
