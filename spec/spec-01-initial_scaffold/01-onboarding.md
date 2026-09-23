# 01 — Onboarding

## Purpose

Collect the user’s default communication preferences in four calm steps, persist them via `PreferenceStore`, then navigate to `/read`.

## Ownership

- Directories: `components/onboarding/`, `app/page.tsx`
- Do not edit `lib/domain/`, `lib/storage/`, or `components/sindi/` contracts—consume them.
- Wave 0 left `app/page.tsx` as a placeholder; this track replaces that page.

## User-visible behavior

Route: `/`

Four steps, one preference dimension each:

| Step | Dimension | Choices (labels) | Stored values |
| --- | --- | --- | --- |
| 1 | Detail | Full · Key Points | `full` · `key_points` |
| 2 | Wording | Original · Plain Language | `original` · `plain` |
| 3 | Delivery | Read · Listen | `read` · `listen` |
| 4 | Browser behavior | Auto-Adapt · Manual | `auto_adapt` · `manual` |

Chrome pattern (Duolingo-inspired):

- One question / one choice set per step.
- Progress indicator and a back chevron.
- Large selectable cards (not tiny chips).
- **Continue** pinned to the bottom; inactive until a choice; active fill uses the olive action token.
- Selected card: light olive fill + olive border; press-in ~scale 0.98 on select.
- Sindi in **prompt** state beside the question (not inside the reading measure—there is no reading column yet). After a choice, Sindi’s line may name the preference just chosen (see `04-mascot.md`).

On final Continue: write preferences through `PreferenceStore`, then route to `/read`.

If preferences already exist, either resume at `/read` or allow re-entry to change defaults—prefer a clear path to change later from the reading workspace if re-onboarding is skipped. Do not invent new preference fields.

## States

- **empty step** — no card selected; Continue disabled.
- **selected** — one card selected; Continue enabled.
- **saving** — optional brief disable while `set` resolves (localStorage is sync; keep UI honest).
- **error** — if store write fails, show a short recoverable message; do not navigate.

## Copy rules

- Use preference labels above only. No streaks, XP, hearts, ability labels, or diagnosis language.
- Prefer short questions such as “How much detail?” not “What is your learning style?”
- Brand “Linaw” may appear as a calm header signal; do not overpower with a marketing hero.

## Data contracts

Use Zod types from `lib/domain` (`Preferences`). Persist with `lib/storage/preferences` (`PreferenceStore`). Do not invent parallel shapes.

## Acceptance checks

- [ ] Four steps match the table; Continue disabled until a choice.
- [ ] Back returns to the previous step without losing prior selections.
- [ ] Final Continue persists preferences and lands on `/read`.
- [ ] Selected card styling uses olive tokens from `app/globals.css`.
- [ ] Sindi `prompt` state renders; no emoji mascot.
- [ ] No streak/XP/score chrome.
- [ ] Works on desktop and narrow mobile widths.

## Out of scope

- Account/auth, cloud sync, CAST behavioral suggestions.
- Building `chrome.storage` (extension track).
- Reading workspace UI, Meaning Check, Listen playback (reading track).
- Changing `lib/adapt/index.ts` or domain schemas.
